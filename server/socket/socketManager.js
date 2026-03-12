let io = null;

// SocketManager now only handles global basic broadcast announcements 
// (Live Video, PiP, Voice, and Live Chat are handled entirely by LiveKit SFU in `streamController.js`)

const initSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`Client connected for global alerts: ${socket.id}`);

    // --- Disconnect Handling ---
    socket.on('disconnect', () => {
       // Legacy code removed: specific broadcaster/viewer map logic
       // LiveKit Cloud handles presence.
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Expose the ability to blast a global text alert to all connected sockets
const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export { initSocket, getIO, broadcast };
