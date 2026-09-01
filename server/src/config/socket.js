let ioInstance = null;

const initSocket = (server, clientUrl) => {
  const { Server } = require('socket.io');

  const parseOrigins = () => {
    const urls = (clientUrl || '').split(',').map((u) => u.trim().replace(/\/+$/, '')).filter(Boolean);
    if (!urls.includes('https://mailpilot.karthikeyantech.in')) {
      urls.push('https://mailpilot.karthikeyantech.in');
    }
    return urls;
  };

  const allowedOrigins = parseOrigins();

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/+$/, '');
        if (allowedOrigins.includes(normalized)) {
          return callback(null, true);
        }
        if (process.env.NODE_ENV !== 'production' && (normalized.includes('localhost') || normalized.includes('127.0.0.1'))) {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy: Origin not allowed for Socket.IO.'));
      },
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
