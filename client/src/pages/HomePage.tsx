import { useState } from 'react';
import { motion } from 'framer-motion';
import { socket } from '../socket';

export default function HomePage() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreateRoom = () => {
    if (!name.trim()) return;
    socket.emit('create_room', { playerName: name });
  };

  const handleJoinRoom = () => {
    if (!name.trim() || !roomCode.trim()) return;
    socket.emit('join_room', { roomCode, playerName: name });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-primary px-4 text-text-primary">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10 relative">
          <h1 className="text-4xl font-orbitron font-bold text-accent-primary mb-2 drop-shadow-[0_0_10px_rgba(233,69,96,0.6)]">
            SHADE
          </h1>
          <h2 className="text-2xl font-orbitron text-text-primary">Classroom</h2>
          <span className="absolute -bottom-6 right-8 text-xs font-mono text-accent-secondary-light/70 bg-background-elevated px-2 py-0.5 rounded border border-gray-800">
            v1.0 Beta
          </span>
        </div>

        {mode === 'menu' && (
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => setMode('create')}
              className="w-full py-4 bg-accent-primary text-white rounded-xl font-bold text-lg hover:bg-opacity-90 transition shadow-[0_0_15px_rgba(233,69,96,0.4)]"
            >
              Otaq Yarat
            </button>
            <button 
              onClick={() => setMode('join')}
              className="w-full py-4 bg-background-elevated border border-accent-secondary text-white rounded-xl font-bold text-lg hover:bg-opacity-80 transition"
            >
              Otağa Qoşul
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Adınız" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background-card border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary transition text-center text-lg"
              maxLength={15}
            />
            <button 
              onClick={handleCreateRoom}
              disabled={!name.trim()}
              className="w-full py-4 bg-accent-primary text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-opacity-90 transition"
            >
              Yarat
            </button>
            <button 
              onClick={() => setMode('menu')}
              className="w-full py-3 text-text-muted hover:text-white transition"
            >
              Geri
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Otaq Kodu" 
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full bg-background-card border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary transition text-center text-2xl font-orbitron tracking-widest uppercase"
              maxLength={4}
            />
            <input 
              type="text" 
              placeholder="Adınız" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background-card border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary transition text-center text-lg"
              maxLength={15}
            />
            <button 
              onClick={handleJoinRoom}
              disabled={!name.trim() || roomCode.length < 4}
              className="w-full py-4 bg-accent-primary text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-opacity-90 transition"
            >
              Qoşul
            </button>
            <button 
              onClick={() => setMode('menu')}
              className="w-full py-3 text-text-muted hover:text-white transition"
            >
              Geri
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
