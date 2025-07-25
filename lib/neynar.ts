'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { storeUser } from './redis';

interface NeynarUser {
  fid: string;
  username: string;
  pfp: string;
}

interface NeynarContextType {
  user: NeynarUser | null;
  login: () => void;
  logout: () => void;
}

const NeynarContext = createContext<NeynarContextType | null>(null);

export function NeynarProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [client] = useState(() => new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!));

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('neynarUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('neynarUser');
      }
    }
  }, []);

  const login = async () => {
    try {
      // In a real app, you would use the Neynar signer and redirect to auth flow
      // This is a mock implementation for demo purposes
      const mockUser = {
        fid: '12345',
        username: 'fc_user',
        pfp: '/images/logo.png',
      };
      
      setUser(mockUser);
      localStorage.setItem('neynarUser', JSON.stringify(mockUser));
      
      // Store user in Redis
      await storeUser(mockUser.fid, mockUser.username, mockUser.pfp);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neynarUser');
  };

  return (
    <NeynarContext.Provider value={{ user, login, logout }}>
      {children}
    </NeynarContext.Provider>
  );
}

export const useNeynar = () => {
  const context = useContext(NeynarContext);
  if (!context) {
    throw new Error('useNeynar must be used within a NeynarProvider');
  }
  return context;
};
