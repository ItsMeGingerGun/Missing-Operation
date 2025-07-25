'use client';
import { useNeynar } from '@/lib/neynar';
import Image from 'next/image';

export default function AuthButton() {
  const { user, login, logout } = useNeynar();

  return user ? (
    <div className="flex items-center gap-3">
      {user.pfp && (
        <Image 
          src={user.pfp} 
          alt={user.username} 
          width={40}
          height={40}
          className="rounded-full border-2 border-purple-500"
        />
      )}
      <span className="font-bold text-purple-300">{user.username}</span>
      <button 
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
      >
        Sign Out
      </button>
    </div>
  ) : (
    <button
      onClick={() => login()}
      className="bg-farcaster-purple hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2"
    >
      <Image 
        src="/images/logo.png" 
        alt="Farcaster" 
        width={24}
        height={24}
      />
      Connect Farcaster
    </button>
  );
}
