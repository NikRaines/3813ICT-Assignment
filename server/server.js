const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:4200" }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

//Classes
class User {
    constructor(username, password, roles = [], groups = []) {
        this.username = username;
        this.password = password;
        this.roles = roles; //['SuperAdmin', 'GroupAdmin', 'User']
        this.groups = groups;
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


//Users
let users = [
    //{ username :'', password: '', roles: [''], groups: []},
    { username :'super', password: '123', roles: ['SuperAdmin'], groups: [1, 2]},
    { username :'test', password: '123', roles: ['User'], groups: [1]},
];

//Groups
let groups = [
    //{ id: 1, name: '', admins: ['super'], members: ['', ''], channels: ['']},
    { id: 1, name: 'Group A', admins: ['super'], members: ['super', 'test'], channels: ['general', 'random']},
    { id: 2, name: 'Group B', admins: ['super'], members: ['super'], channels: ['general']},
];

//Messages
let messages = [
    //{ groupID: 1, channel: '', sender: '', text: '', timestamp: new Date()},
    { groupID: 1, channel: 'general', sender: 'super', text: 'Group A First Message', timestamp: new Date()},
];

//Login
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        user.valid = true;
        const { password, ...userWithoutPassword } = user; // Exclude password from response
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ valid: false, message: 'Invalid username or password' });
    }
});

//Logout
app.post('/api/users/logout', (req, res) => res.json({ message: 'Logout successful' }));

//Start Server
app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`));