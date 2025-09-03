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

//functions for loading and saving JSON
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

function saveData(filename, data) {
    // Always save to the data folder
    const filePath = path.join(__dirname, 'data', path.basename(filename));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

//Classes
class User {
    constructor(username, email, password, role = 'User', groups = [], appliedGroups = []) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role; // 'SuperAdmin', 'GroupAdmin', 'User'
        this.groups = groups;
        this.appliedGroups = appliedGroups;
        this.valid = false;
    }
}

class Group {
    constructor(id, name, channels = [], admins = [], members = []) {
        this.id = id;
        this.name = name;
        this.channels = channels;
        this.admins = admins;
        this.members = members;
    }
}

class Messages {
    constructor(groupID, channel, sender, text, timestamp) {
        this.groupID = groupID;
        this.channel = channel;
        this.sender = sender;
        this.text = text;
        this.timestamp = timestamp;
    }
}

class Notifications {
    constructor(createdBy, Description, Reason) {
        this.createdBy = createdBy;
        this.Description = Description;
        this.Reason = Reason;
    }
}


// Load data from JSON files
let users = loadData(path.join('data', 'users.json'), []);
let groups = loadData(path.join('data', 'groups.json'), []);
let messages = loadData(path.join('data', 'messages.json'), []);
let notifications = loadData(path.join('data', 'notifications.json'), []);


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
    newUser.valid = role === 'SuperAdmin' ? true : false; // SuperAdmin is auto-approved
    users.push(newUser);
    saveData('users.json', users);
    res.json({ success: true, message: 'Registration successful. Awaiting super admin approval.' });
});

//Approve user (super admin only)
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

// Delete a group
app.delete('/api/groups/:groupId', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) {
        return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    messages = messages.filter(m => m.groupID !== groupId);
    saveData('messages.json', messages);
    groups.splice(groupIndex, 1);
    saveData('groups.json', groups);
    res.json({ success: true });
});

// Delete a channel from a group
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

// Get messages by channel
app.get('/api/messages', (req, res) => {
    const channel = req.query.channel;
    const groupId = req.query.groupId;
    // Filter messages by groupId and channel
    const filteredMessages = messages.filter(m => m.channel === channel && m.groupID == groupId);
    res.json(filteredMessages);
});


//Delete user
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        console.log('User not found for deletion:', username);
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    groups.forEach(group => {
        group.members = group.members.filter(member => member !== username);
        group.admins = group.admins.filter(admin => admin !== username);
    });
    saveData('groups.json', groups);
    users.splice(userIndex, 1);
    saveData('users.json', users);
    console.log('User deleted:', username);
    res.json({ success: true });
});

//Update user roles
app.post('/api/users/updateRoles', (req, res) => {
    const { username, role } = req.body;
    const user = users.find(u => u.username === username);
    user.role = role;
    saveData('users.json', users);
    res.json({ success: true, message: 'Role updated.' });
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

// Promote user to group admin (add to admins array)
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

// Demote user from group admin (remove from admins array)
app.post('/api/groups/:groupId/demoteAdmin', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const { username } = req.body;
    const group = groups.find(g => g.id === groupId);
    group.admins = group.admins.filter(admin => admin !== username);
    saveData('groups.json', groups);
    res.json({ success: true });
});

//Logout
app.post('/api/users/logout', (req, res) => res.json({ message: 'Logout successful' }));

//Start Server
app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`));