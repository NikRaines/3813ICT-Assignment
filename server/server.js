const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const sockets = require('./socket');
const { connect } = require('./App/app');
const { addUsers } = require('./App/add');
const formidable = require('formidable');

const app = express();
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/imageupload/')));
app.use('/images',express.static(path.join(__dirname , './userimages')));

app.get('/', (req, res) => {
    res.send('Chat Server is running!');
});

//Classes
class User {
    constructor(username, email, password, role = 'User', groups = [], appliedGroups = [], profileImg = 'default-avatar.png') {
        this.username = username; //Unique
        this.email = email; //Unique
        this.password = password;
        this.role = role; // 'SuperAdmin', 'GroupAdmin', 'User'
        this.groups = groups;
        this.appliedGroups = appliedGroups;
        this.valid = false; //Login Approval
        this.profileImg = profileImg; //Profile image path
    }
}

class Group {
    constructor(id, name, admins = [], channels = [], banned = []) {
        this.id = id; //Unique
        this.name = name;
        this.admins = admins;
        this.channels = channels;
        this.banned = banned; //usernames
    }
}

class Messages {
    constructor(groupID, channel, sender, text, imageUrl = null, messageType = 'text') {
        this.groupID = groupID;
        this.channel = channel;
        this.sender = sender; //usernames
        this.text = text;
        this.imageUrl = imageUrl; // Path to uploaded image
        this.messageType = messageType; // 'text' or 'image'
    }
}

class Notifications {
    constructor(createdBy, description, reason) {
        this.createdBy = createdBy; //usernames
        this.description = description;
        this.reason = reason;
    }
}

//Get all users (for user management)
app.get('/api/users', async (req, res) => {
    try {
        const { db, client } = await connect();
        const users = await db.collection('users').find({}).toArray();
        await client.close();
        
        const usersNoPassword = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        res.json(usersNoPassword);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Get all notifications
app.get('/api/notifications', async (req, res) => {
    try {
        const { db, client } = await connect();
        const notifications = await db.collection('notifications').find({}).toArray();
        await client.close();
        
        res.json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Get all groups
app.get('/api/groups', async (req, res) => {
    try {
        const { db, client } = await connect();
        const groups = await db.collection('groups').find({}).toArray();
        await client.close();
        
        res.json(groups);
    } catch (error) {
        console.error('Error getting groups:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get messages by channel
app.get('/api/messages', async (req, res) => {
    try {
        const channel = req.query.channel;
        const groupId = parseInt(req.query.groupId);
        
        const { db, client } = await connect();
        const filteredMessages = await db.collection('messages').find({ 
            channel: channel, 
            groupID: groupId 
        }).toArray();
        await client.close();
        
        res.json(filteredMessages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Login
app.post('/api/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const { db, client } = await connect();
        
        const foundUser = await db.collection('users').findOne({ username, password });
        await client.close();
        
        if (foundUser) {
            if (!foundUser.valid) {
                return res.status(403).json({ valid: false, message: 'Account not approved by super admin.' });
            }
            const { password, ...userWithoutPassword } = foundUser;
            res.json(userWithoutPassword);
        } else {
            res.status(401).json({ valid: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Logout
app.post('/api/users/logout', (req, res) => res.json({ message: 'Logout successful' }));

//Register
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }
        
        const { db, client } = await connect();
        
        // Check if username already exists
        const existingUsername = await db.collection('users').findOne({ username });
        if (existingUsername) {
            await client.close();
            return res.status(409).json({ message: 'Username already exists.' });
        }
        
        // Check if email already exists
        const existingEmail = await db.collection('users').findOne({ email });
        if (existingEmail) {
            await client.close();
            return res.status(409).json({ message: 'Email already registered.' });
        }
        
        let role = 'User';
        const newUser = new User(username, email, password, role, [], []);
        newUser.valid = role === 'SuperAdmin' ? true : false;
        
        // Insert new user into database
        await db.collection('users').insertOne(newUser);
        await client.close();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//User management
//Approve user (login)
app.post('/api/users/approve', async (req, res) => {
    try {
        const { username } = req.body;
        const { db, client } = await connect();
        
        const result = await db.collection('users').updateOne(
            { username },
            { $set: { valid: true } }
        );
        await client.close();
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Update user roles (promote/demote in user management)
app.post('/api/users/updateRoles', async (req, res) => {
    try {
        const { username, role } = req.body;
        const { db, client } = await connect();
        
        const result = await db.collection('users').updateOne(
            { username },
            { $set: { role } }
        );
        await client.close();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Delete user (admin delete or user self-delete)
app.delete('/api/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { db, client } = await connect();
        
        const user = await db.collection('users').findOne({ username });
        if (!user) {
            await client.close();
            console.log('User not found for deletion:', username);
            return res.status(404).json({ message: 'User not found.' });
        }
        
        await db.collection('groups').updateMany(
            {},
            { 
                $pull: { 
                    admins: username,
                    banned: username 
                } 
            }
        );
        
        await db.collection('users').deleteOne({ username });
        await client.close();
        
        console.log('User deleted:', username);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Group management

// Create a new group
app.post('/api/groups', async (req, res) => {
    try {
        const { name, creator, role } = req.body;
        const { db, client } = await connect();
        
        const groups = await db.collection('groups').find({}).toArray();
        const newId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
        
        let admins = [];
        let channels = [];
        
        if (role === 'GroupAdmin') {
            admins.push(creator);
            await db.collection('users').updateOne(
                { username: creator },
                { $push: { groups: newId } }
            );
        }
        
        const newGroup = new Group(newId, name.trim(), admins, channels, []);
        await db.collection('groups').insertOne(newGroup);
        await client.close();
        
        res.json({ success: true, group: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Create a new channel in a group
app.post('/api/groups/:groupId/channels', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { channel, username, role } = req.body;
        
        const { db, client } = await connect();
        const group = await db.collection('groups').findOne({ id: groupId });
        
        if (!group) {
            await client.close();
            return res.status(404).json({ message: 'Group not found.' });
        }
        
        if (group.channels.includes(channel.trim())) {
            await client.close();
            return res.status(409).json({ message: 'Channel already exists.' });
        }
        
        await db.collection('groups').updateOne(
            { id: groupId },
            { $push: { channels: channel.trim() } }
        );
        
        const updatedGroup = await db.collection('groups').findOne({ id: groupId });
        await client.close();
        
        res.json({ success: true, group: updatedGroup });
    } catch (error) {
        console.error('Error creating channel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a group
app.delete('/api/groups/:groupId', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { db, client } = await connect();
        
        const group = await db.collection('groups').findOne({ id: groupId });
        if (!group) {
            await client.close();
            return res.status(404).json({ message: 'Group not found.' });
        }
        
        await db.collection('messages').deleteMany({ groupID: groupId });
        
        await db.collection('users').updateMany(
            { groups: groupId },
            { $pull: { groups: groupId } }
        );
        
        await db.collection('groups').deleteOne({ id: groupId });
        await client.close();
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a channel
app.delete('/api/groups/:groupId/channels/:channel', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const channel = req.params.channel;
        
        const { db, client } = await connect();
        const group = await db.collection('groups').findOne({ id: groupId });
        if (!group) {
            await client.close();
            return res.status(404).json({ message: 'Group not found.' });
        }
        
        const channelIndex = group.channels.indexOf(channel);
        if (channelIndex === -1) {
            await client.close();
            return res.status(404).json({ message: 'Channel not found.' });
        }
        
        await db.collection('messages').deleteMany({ 
            groupID: groupId, 
            channel: channel 
        });
        
        await db.collection('groups').updateOne(
            { id: groupId },
            { $pull: { channels: channel } }
        );
        
        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting channel:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update user's appliedGroups
app.post('/api/users/updateAppliedGroups', async (req, res) => {
    try {
        const { username, appliedGroups } = req.body;
        const { db, client } = await connect();
        
        const user = await db.collection('users').findOne({ username: username });
        if (!user) {
            await client.close();
            return res.status(404).json({ error: 'User not found' });
        }
        
        await db.collection('users').updateOne(
            { username: username },
            { $set: { appliedGroups: appliedGroups } }
        );
        
        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating applied groups:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update user's group (Leave/kick)
app.post('/api/users/updateGroups', async (req, res) => {
    try {
        const { username, groups: newGroups } = req.body;
        const { db, client } = await connect();
        
        const user = await db.collection('users').findOne({ username: username });
        if (!user) {
            await client.close();
            return res.status(404).json({ error: 'User not found' });
        }
        
        const removedGroupId = user.groups.find(gid => !newGroups.includes(gid));
        
        await db.collection('users').updateOne(
            { username: username },
            { $set: { groups: newGroups } }
        );
        
        if (removedGroupId !== undefined) {
            await db.collection('groups').updateOne(
                { id: removedGroupId },
                { $pull: { admins: username } }
            );
        }
        
        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user groups:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Promote user to group admin (Group management)
app.post('/api/groups/:groupId/promoteAdmin', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { username } = req.body;
        
        const { db, client } = await connect();
        const group = await db.collection('groups').findOne({ id: groupId });
        
        if (!group.admins.includes(username)) {
            await db.collection('groups').updateOne(
                { id: groupId },
                { $push: { admins: username } }
            );
        }
        
        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Error promoting admin:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Demote user from group admin (Group management)
app.post('/api/groups/:groupId/demoteAdmin', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { username } = req.body;
        
        const { db, client } = await connect();
        await db.collection('groups').updateOne(
            { id: groupId },
            { $pull: { admins: username } }
        );
        
        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Error demoting admin:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Ban user from group
app.post('/api/groups/:groupId/ban', async (req, res) => {
    try {
        const groupId = parseInt(req.params.groupId);
        const { username, reason, createdBy } = req.body;
        
        const { db, client } = await connect();
        
        const group = await db.collection('groups').findOne({ id: groupId });
        
        await db.collection('groups').updateOne(
            { id: groupId },
            { $push: { banned: username } }
        );
        
        await db.collection('users').updateOne(
            { username: username },
            { $pull: { groups: groupId } }
        );
        
        const description = `Banned ${username} from ${group.name}`;
        const notification = new Notifications(createdBy, description, reason);
        await db.collection('notifications').insertOne(notification);
        
        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Dashboard

// Send a new message
app.post('/api/messages', async (req, res) => {
    try {
        const { groupId, channel, sender, text } = req.body;
        const parsedGroupId = parseInt(groupId);
        const { db, client } = await connect();
        
        const newMsg = new Messages(parsedGroupId, channel, sender, text);
        await db.collection('messages').insertOne(newMsg);
        await client.close();
        
        res.json({ success: true, message: newMsg });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/upload', (req, res) => {
    var form = new formidable.IncomingForm({ uploadDir: './userimages' });
    form.keepExtensions = true;
    
    form.on('error', function(err) {
        throw err;
        res.send({
            result:"failed",
            data:{},
            numberofImages:0,
            message:"Cannot upload images. Error is :" + err
        });
    });
    
    form.on('fileBegin', function(name, file){
        file.path = form.uploadDir + "/" + (file.originalFilename || file.name || 'uploaded-file');
    });
    
    form.on('file', function(field, file){
        // Rename the file to use the original filename
        const fs = require('fs');
        const path = require('path');
        const oldPath = file.filepath || file.path;
        const newPath = path.join(form.uploadDir, file.originalFilename);
        
        fs.renameSync(oldPath, newPath);
        
        res.send({
            result:'OK',
            data:{'filename':file.originalFilename || file.name,'size':file.size},
            numberOfImages:1,
            message:"upload successful"
        });
    });
    
    form.parse(req);
});

//Update user profile image
app.post('/api/users/updateProfileImg', async (req, res) => {
    try {
        const { username, profileImg } = req.body;
        const { db, client } = await connect();
        
        const result = await db.collection('users').updateOne(
            { username },
            { $set: { profileImg } }
        );
        await client.close();
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

//Start Server and Socket.io
const server = http.createServer(app);
sockets.connect(server, Messages);

// Initialize database with default admin user
addUsers();

require('./listen')(server);