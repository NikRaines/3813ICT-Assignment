const { Server } = require('socket.io');

function connect(server, messages, saveData, Messages) {
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
    socket.on('sendMessage', (message) => {
      console.log('Received message:', message);
      
      // Saving the message
      const newMsg = new Messages(message.groupId, message.channel, message.sender, message.text);
      messages.push(newMsg);
      saveData('messages.json', messages);
      
      // Create room ID and emit to that room
      const roomId = `${message.groupId}-${message.channel}`;
      io.to(roomId).emit('message', newMsg);
      console.log(`Message sent to room ${roomId}:`, newMsg);
    });

    // Disconnections
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { connect };