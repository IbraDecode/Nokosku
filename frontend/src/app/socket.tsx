import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStoredToken } from '../api/http';

const SocketContext = createContext<Socket | null>(null);
const WS_BASE = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(WS_BASE, {
      transports: ['websocket'],
      auth: {
        token: getStoredToken()
      }
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
