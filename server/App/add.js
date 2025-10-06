const { connect } = require('./app');

async function addUsers() {
    try {
        const { db, client } = await connect();

        const existingUserByUsername = await db.collection("users").findOne({ username: "super" });
        const existingUserById = await db.collection("users").findOne({ id: 1 });
        const existingUserByEmail = await db.collection("users").findOne({ email: "test@example.com" });
        
        if (existingUserByUsername || existingUserById || existingUserByEmail) {
            console.log("Super admin user already exists (by username, ID, or email), skipping creation");
            await client.close();
            return;
        }

        let users = [
            { 
                id: 1, 
                username: "super", 
                password: "123", 
                email: "test@example.com",
                role: "SuperAdmin",
                groups: [],
                appliedGroups: [],
                valid: true,
                profileImg: "default-avatar.png"
            }
        ];

        const result = await db.collection("users").insertMany(users);
        console.log(result.insertedCount + " users inserted");
        
        await client.close();
    } catch (error) {
        console.error('Error adding initial users:', error);
    }
}

module.exports = { addUsers };

if (require.main === module) {
    addUsers();
}
