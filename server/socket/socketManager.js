let io = null;

let broadcaster = null;

const initSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // --- WebRTC Signaling ---
    
    // 1. Broadcaster registers themselves
    socket.on('broadcaster', () => {
      broadcaster = socket.id;
      socket.broadcast.emit('broadcaster'); // Tell everyone a stream is active
      console.log(`Broadcaster registered: ${broadcaster}`);
    });

    // 2. Viewer requests to watch
    socket.on('watcher', () => {
      if (broadcaster) {
        socket.to(broadcaster).emit('watcher', socket.id);
      }
    });

    // 3. Broadcaster sends an Offer to a specific Viewer
    socket.on('offer', (id, message) => {
      socket.to(id).emit('offer', socket.id, message);
    });

    // 4. Viewer sends an Answer back to the Broadcaster
    socket.on('answer', (id, message) => {
      socket.to(id).emit('answer', socket.id, message);
    });

    // 5. Exchange ICE Candidates (Network routing info)
    socket.on('candidate', (id, message) => {
      socket.to(id).emit('candidate', socket.id, message);
    });

    // --- Disconnect Handling ---
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      if (socket.id === broadcaster) {
        broadcaster = null;
        socket.broadcast.emit('disconnectPeer', socket.id);
        console.log('Broadcaster disconnected');
      } else if (broadcaster) {
        // Tell broadcaster this specific viewer left
        socket.to(broadcaster).emit('disconnectPeer', socket.id);
      }
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export { initSocket, getIO, broadcast };
