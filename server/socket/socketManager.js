let io = null;

let broadcaster = null;
let connectedViewers = new Map(); // Map of socket.id -> viewer info
let chatHistory = []; // Keep track of recent chat messages

const initSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send recent chat history to the newly connected client
    socket.emit('chat_history', chatHistory);

    // --- Chat System ---
    socket.on('send_chat', (data) => {
      const chatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        senderId: socket.id,
        senderName: data.senderName || 'Anonymous', // Can be Admin or Viewer
        message: data.message,
        isAdmin: !!data.isAdmin,
        timestamp: new Date().toISOString()
      };
      
      chatHistory.push(chatMessage);
      if (chatHistory.length > 100) {
        chatHistory.shift(); // Keep only last 100 messages in memory
      }
      
      io.emit('receive_chat', chatMessage);
    });

    // --- WebRTC Signaling ---
    
    // 1. Broadcaster registers themselves
    socket.on('broadcaster', () => {
      broadcaster = socket.id;
      socket.broadcast.emit('broadcaster'); // Tell everyone a stream is active
      console.log(`Broadcaster registered: ${broadcaster}`);
    });

    // 2. Viewer requests to watch
    socket.on('watcher', (metadata) => {
      if (broadcaster) {
        connectedViewers.set(socket.id, {
          id: socket.id,
          name: metadata?.name || 'Viewer ' + socket.id.substring(0, 4),
          joinedAt: new Date().toISOString()
        });
        
        socket.to(broadcaster).emit('watcher', socket.id);
        io.to(broadcaster).emit('viewer_list', Array.from(connectedViewers.values()));
      }
    });

    // 2.1 Admin kicks a viewer
    socket.on('kick_viewer', (viewerId) => {
      if (socket.id === broadcaster && connectedViewers.has(viewerId)) {
        io.to(viewerId).emit('kicked');
        const viewerSocket = io.sockets.sockets.get(viewerId);
        if (viewerSocket) {
          viewerSocket.disconnect(true);
        }
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
      
      if (connectedViewers.has(socket.id)) {
        connectedViewers.delete(socket.id);
        if (broadcaster) {
          io.to(broadcaster).emit('viewer_list', Array.from(connectedViewers.values()));
        }
      }

      if (socket.id === broadcaster) {
        broadcaster = null;
        connectedViewers.clear();
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
