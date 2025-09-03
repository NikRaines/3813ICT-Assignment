const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:4200" }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

//Classes
class User {
    constructor(username, email, password, role = 'User', groups = [], appliedGroups = []) {
        this.username = username; //Unique
        this.email = email; //Unique
        this.password = password;
        this.role = role; // 'SuperAdmin', 'GroupAdmin', 'User'
        this.groups = groups;
        this.appliedGroups = appliedGroups;
        this.valid = false; //Login Approval
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
    constructor(groupID, channel, sender, text) {
        this.groupID = groupID;
        this.channel = channel;
        this.sender = sender; //usernames
        this.text = text;
    }
}

class Notifications {
    constructor(createdBy, description, reason) {
        this.createdBy = createdBy; //usernames
        this.description = description;
        this.reason = reason;
    }
}


// Load data from JSON files
let users = loadData(path.join('data', 'users.json'), []);
let groups = loadData(path.join('data', 'groups.json'), []);
let messages = loadData(path.join('data', 'messages.json'), []);
let notifications = loadData(path.join('data', 'notifications.json'), []);

// Loading Json
function loadData(filename, defaultData) {
    const filePath = path.join(__dirname, filename);
    if (fs.existsSync(filePath)) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Error reading ${filename}:`, e);
            return defaultData;
        }
    }
    return defaultData;
}

// Saving Json
function saveData(filename, data) {
    const filePath = path.join(__dirname, 'data', path.basename(filename));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

//Get all users (for user management)
app.get('/api/users', (req, res) => {
    const usersNoPassword = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });
    res.json(usersNoPassword);
});

//Get all notifications
app.get('/api/notifications', (req, res) => {
    res.json(notifications);
});

//Get all groups
app.get('/api/groups', (req, res) => {
    res.json(groups);
});

// Get messages by channel
app.get('/api/messages', (req, res) => {
    const channel = req.query.channel;
    const groupId = req.query.groupId;
    // Filter messages by groupId and channel
    const filteredMessages = messages.filter(m => m.channel === channel && m.groupID == groupId);
    res.json(filteredMessages);
});

//Login
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
        if (!foundUser.valid) {
            return res.status(403).json({ valid: false, message: 'Account not approved by super admin.' });
        }
        const { password, ...userWithoutPassword } = foundUser; // Exclude password from response
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ valid: false, message: 'Invalid username or password' });
    }
});

//Logout
app.post('/api/users/logout', (req, res) => res.json({ message: 'Logout successful' }));

//Register
app.post('/api/users/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    }
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
    }
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    let role = 'User';
    const newUser = new User(username, email, password, role, [], []);
    newUser.valid = role === 'SuperAdmin' ? true : false;
    users.push(newUser);
    saveData('users.json', users);
    res.json({ success: true, message: 'Registration successful. Awaiting super admin approval.' });
});

//User management
//Approve user (login)
app.post('/api/users/approve', (req, res) => {
    const { username } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    user.valid = true;
    saveData('users.json', users);
    res.json({ success: true, message: 'User approved.' });
});

//Update user roles (promote/demote in user management)
app.post('/api/users/updateRoles', (req, res) => {
    const { username, role } = req.body;
    const user = users.find(u => u.username === username);
    user.role = role;
    saveData('users.json', users);
    res.json({ success: true, message: 'Role updated.' });
});

//Delete user (admin delete or user self-delete)
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        console.log('User not found for deletion:', username);
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    groups.forEach(group => {
        group.admins = group.admins.filter(admin => admin !== username);
        if (Array.isArray(group.banned)) {
            group.banned = group.banned.filter(bannedUser => bannedUser !== username);
        }
    });
    saveData('groups.json', groups);
    users.splice(userIndex, 1);
    saveData('users.json', users);
    console.log('User deleted:', username);
    res.json({ success: true });
});

//Group management

// Create a new group
app.post('/api/groups', (req, res) => {
    const { name, creator, role } = req.body;
    const newId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
    let admins = [];
    let channels = [];
    if (role === 'GroupAdmin') {
        admins.push(creator);
        const user = users.find(u => u.username === creator);
        user.groups.push(newId);
        saveData('users.json', users);
    }
    const newGroup = new Group(newId, name.trim(), admins, channels, []);
    groups.push(newGroup);
    saveData('groups.json', groups);
    res.json({ success: true, group: newGroup });
});

// Create a new channel in a group
app.post('/api/groups/:groupId/channels', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { channel, username, role } = req.body;
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    if (group.channels.includes(channel.trim())) {
        return res.status(409).json({ success: false, message: 'Channel already exists.' });
    }
    group.channels.push(channel.trim());
    saveData('groups.json', groups);
    res.json({ success: true, group });
});

// Delete a group
app.delete('/api/groups/:groupId', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) {
        return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    messages = messages.filter(m => m.groupID !== groupId);
    saveData('messages.json', messages);
    users.forEach(user => {
        user.groups = user.groups.filter(gid => gid !== groupId);
    });
    saveData('users.json', users);
    groups.splice(groupIndex, 1);
    saveData('groups.json', groups);
    res.json({ success: true });
});

// Delete a channel
app.delete('/api/groups/:groupId/channels/:channel', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const channel = req.params.channel;
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    const channelIndex = group.channels.indexOf(channel);
    if (channelIndex === -1) {
        return res.status(404).json({ success: false, message: 'Channel not found.' });
    }
    messages = messages.filter(m => !(m.groupID === groupId && m.channel === channel));
    saveData('messages.json', messages);
    group.channels.splice(channelIndex, 1);
    saveData('groups.json', groups);
    res.json({ success: true });
});

// Update user's appliedGroups
app.post('/api/users/updateAppliedGroups', (req, res) => {
    const { username, appliedGroups } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    user.appliedGroups = appliedGroups;
    saveData(path.join('data', 'users.json'), users);
    res.json({ success: true });
});

// Update user's group (Leave/kick)
app.post('/api/users/updateGroups', (req, res) => {
    const { username, groups: newGroups } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const removedGroupId = user.groups.find(gid => !newGroups.includes(gid));
    user.groups = newGroups;
    if (removedGroupId !== undefined) {
        const group = groups.find(g => g.id === removedGroupId);
        if (group) {
            group.admins = group.admins.filter(admin => admin !== username);
        }
    }
    saveData(path.join('data', 'users.json'), users);
    saveData(path.join('data', 'groups.json'), groups);
    res.json({ success: true });
});

// Promote user to group admin (Group management)
app.post('/api/groups/:groupId/promoteAdmin', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { username } = req.body;
    const group = groups.find(g => g.id === groupId);
    if (!group.admins.includes(username)) {
        group.admins.push(username);
        saveData('groups.json', groups);
    }
    res.json({ success: true });
});

// Demote user from group admin (Group management)
app.post('/api/groups/:groupId/demoteAdmin', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { username } = req.body;
    const group = groups.find(g => g.id === groupId);
    group.admins = group.admins.filter(admin => admin !== username);
    saveData('groups.json', groups);
    res.json({ success: true });
});

// Ban user from group
app.post('/api/groups/:groupId/ban', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { username, reason, createdBy } = req.body;
    const group = groups.find(g => g.id === groupId);
    const user = users.find(u => u.username === username);
    group.banned.push(username);
    user.groups = user.groups.filter(gid => gid !== groupId);
    const description = `Banned ${username} from ${group.name}`;
    notifications.push(new Notifications(createdBy, description, reason));
    saveData('groups.json', groups);
    saveData('users.json', users);
    saveData('notifications.json', notifications);
    res.json({ success: true });
});

//Dashboard

// Send a new message
app.post('/api/messages', (req, res) => {
    const { groupId, channel, sender, text } = req.body;
    const newMsg = new Messages(groupId, channel, sender, text);
    messages.push(newMsg);
    saveData('messages.json', messages);
    res.json({ success: true, message: newMsg });
});

//Start Server
app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`));