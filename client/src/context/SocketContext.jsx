import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState(null);
  const [broadcasts, setBroadcasts] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || '';
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      withCredentials: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('admin-broadcast', (data) => {
      setLastBroadcast(data);
      setBroadcasts((prev) => [data, ...prev].slice(0, 50));
    });

    socket.on('data-updated', () => {
      // Trigger refetch in consuming components
      window.dispatchEvent(new CustomEvent('f1-data-updated'));
    });

    socket.on('race-updated', () => {
      window.dispatchEvent(new CustomEvent('f1-data-updated'));
    });

    socket.on('driver-updated', () => {
      window.dispatchEvent(new CustomEvent('f1-data-updated'));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      isConnected, 
      lastBroadcast, 
      broadcasts 
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
