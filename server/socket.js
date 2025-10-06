const { Server } = require('socket.io');
const { connect: connectDB } = require('./App/app');

function connect(server, Messages) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Joining a room
    socket.on('joinRoom', (data) => {
      const roomId = `${data.groupId}-${data.channel}`;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      // Creating a user joined message that isnt being saved
      const joinMessage = {
        sender: 'System',
        text: `${data.username || 'A user'} has joined the chat`,
        groupID: data.groupId,
        channel: data.channel,
      };
      
      // Emit to all users in the room
      io.to(roomId).emit('message', joinMessage);
    });

    // Leaving a room
    socket.on('leaveRoom', (data) => {
      const roomId = `${data.groupId}-${data.channel}`;
      
      // Creating a user left message that isnt being saved
      const leaveMessage = {
        sender: 'System',
        text: `${data.username || 'A user'} has left the chat`,
        groupID: data.groupId,
        channel: data.channel,
      };
      
      // Emit to all users in the room
      io.to(roomId).emit('message', leaveMessage);
      
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Sending messages
    socket.on('sendMessage', async (data) => {      
        const { db, client } = await connectDB();
        
        const user = await db.collection('users').findOne({ username: data.sender });
        const profileImg = user ? user.profileImg || 'default-avatar.png' : 'default-avatar.png';
        const messageType = data.imageUrl ? 'image' : 'text';
    
        const newMsg = new Messages(data.groupId, data.channel, data.sender, data.text || '', data.imageUrl || null, messageType);
        newMsg.profileImg = profileImg;
        
        const msgSave = new Messages(data.groupId, data.channel, data.sender, data.text || '', data.imageUrl || null, messageType);
        await db.collection('messages').insertOne(msgSave);
        await client.close();
        
        const roomId = `${data.groupId}-${data.channel}`;
        io.to(roomId).emit('message', newMsg);
    });

    // Disconnections
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { connect };