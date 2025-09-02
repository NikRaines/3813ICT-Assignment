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
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

//Classes
class User {
    constructor(username, email, password, roles = [], groups = []) {
        this.username = username;
        this.email = email;
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


// Load data from JSON files
let users = loadData('users.json', []);
let groups = loadData('groups.json', []);
let messages = loadData('messages.json', []);



//Login
app.post('/api/users/login', (req, res) => {
    const { username, password } = req.body;
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
        foundUser.valid = true;
        const { password, ...userWithoutPassword } = foundUser; // Exclude password from response
        res.json(userWithoutPassword);
    } else {
        res.status(401).json({ valid: false, message: 'Invalid username or password' });
    }
});
// Register endpoint
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
    const newUser = new User(username, email, password, ['User'], []);
    users.push(newUser);
    saveData('users.json', users);
    res.json({ success: true });
});

// Delete user endpoint
app.delete('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
        console.log('User not found for deletion:', username);
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    users.splice(userIndex, 1);
    saveData('users.json', users);
    console.log('User deleted:', username);
    res.json({ success: true });
});

//Logout
app.post('/api/users/logout', (req, res) => res.json({ message: 'Logout successful' }));

//Start Server
app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`));