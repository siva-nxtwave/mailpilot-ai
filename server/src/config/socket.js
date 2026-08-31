let ioInstance = null;

const initSocket = (server, clientUrl) => {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: clientUrl || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Authenticate user socket room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  ioInstance = io;
  return io;
};

const getIO = () => {
  return ioInstance;
};

const emitToUser = (userId, event, payload) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId}`).emit(event, payload);
  }
};

module.exports = { initSocket, getIO, emitToUser };
