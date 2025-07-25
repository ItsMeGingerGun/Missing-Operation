'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { storeUser } from './redis';
import * as frame from '@farcaster/frame-sdk';

interface NeynarUser {
  fid: string;
  username: string;
  pfp: string;
}

interface NeynarContextType {
  user: NeynarUser | null;
  login: () => void;
  logout: () => void;
  frameSigner: any;
}

const NeynarContext = createContext<NeynarContextType | null>(null);

export function NeynarProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [frameSigner, setFrameSigner] = useState<any>(null);
  const [client] = useState(() => new NeynarAPIClient(process.env.NEXT_PUBLIC_NEYNAR_API_KEY!));

  // Initialize from localStorage and Frame SDK
  useEffect(() => {
    const initializeFrame = async () => {
      try {
        await frame.sdk.actions.ready();
        const context = await frame.sdk.context();
        
        if (context.isValid && context.user) {
          const frameUser = {
            fid: context.user.fid.toString(),
            username: context.user.username || `User${context.user.fid}`,
            pfp: context.user.pfpUrl || '/images/logo.png'
          };
          
          setUser(frameUser);
          localStorage.setItem('neynarUser', JSON.stringify(frameUser));
          await storeUser(frameUser.fid, frameUser.username, frameUser.pfp);
          setFrameSigner(context.signer);
        }
      } catch (error) {
        console.error('Frame initialization failed:', error);
      }
    };

    const storedUser = localStorage.getItem('neynarUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('neynarUser');
      }
    } else {
      initializeFrame();
    }
  }, []);

  const login = async () => {
    try {
      // Try to get frame context first
      try {
        await frame.sdk.actions.ready();
        const context = await frame.sdk.context();
        
        if (context.isValid && context.user) {
          const frameUser = {
            fid: context.user.fid.toString(),
            username: context.user.username || `User${context.user.fid}`,
            pfp: context.user.pfpUrl || '/images/logo.png'
          };
          
          setUser(frameUser);
          localStorage.setItem('neynarUser', JSON.stringify(frameUser));
          await storeUser(frameUser.fid, frameUser.username, frameUser.pfp);
          setFrameSigner(context.signer);
          return;
        }
      } catch (frameError) {
        console.log('Frame context not available, using fallback');
      }

      // Fallback to mock user
      const mockUser = {
        fid: '12345',
        username: 'fc_user',
        pfp: '/images/logo.png',
      };
      
      setUser(mockUser);
      localStorage.setItem('neynarUser', JSON.stringify(mockUser));
      await storeUser(mockUser.fid, mockUser.username, mockUser.pfp);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neynarUser');
    setFrameSigner(null);
  };

  return (
    <NeynarContext.Provider value={{ user, login, logout, frameSigner }}>
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
