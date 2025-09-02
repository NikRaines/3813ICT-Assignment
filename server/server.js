
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

//Logout
app.post('/api/users/logout', (req, res) => res.json({ message: 'Logout successful' }));

//Start Server
app.listen(PORT,() => console.log(`Server running on http://localhost:${PORT}`));