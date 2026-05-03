import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

export default function ResultPage() {
  const { room, myId, myWord, myCategoryName, myAllies } = useGameStore(); // myAllies holds imposters array now
  const [showImposters, setShowImposters] = useState(false);

  useEffect(() => {
    // Fire confetti when page loads
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4ade80', '#f87171', '#e94560']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4ade80', '#f87171', '#e94560']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Reveal imposters after a short delay for dramatic effect
    const timer = setTimeout(() => {
      setShowImposters(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!room) return null;

  const myPlayer = room.players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost || false;

  const imposters = myAllies || [];
  const citizens = room.players.filter(p => !imposters.includes(p.name)).map(p => p.name);

  const handleRematch = () => {
    socket.emit('rematch', { roomCode: room.code });
  };

  const handleMainMenu = () => {
    socket.emit('leave_room', { roomCode: room.code });
    useGameStore.getState().reset();
  };

  return (
    <div className="flex flex-col h-screen bg-background-primary text-text-primary overflow-hidden">
      
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-8">
          
          <div className="text-center">
            <h1 className="text-4xl font-orbitron font-bold text-white mb-2">OYUN BİTDİ</h1>
            <p className="text-text-muted">Nəticələr</p>
          </div>

          {/* Reveal Word & Category */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background-card rounded-2xl p-6 border border-accent-secondary text-center shadow-[0_0_20px_rgba(15,52,96,0.3)]"
          >
             <p className="text-sm text-text-muted mb-1 uppercase tracking-wider">Kateqoriya</p>
             <p className="text-xl font-bold text-white mb-4">{myCategoryName}</p>
             
             <p className="text-sm text-text-muted mb-1 uppercase tracking-wider">Gizli Söz</p>
             <p className="text-4xl font-bold text-accent-primary drop-shadow-[0_0_10px_rgba(233,69,96,0.5)]">{myWord}</p>
          </motion.div>

          {/* Reveal Roles */}
          <div className="space-y-4">
             {showImposters && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-red-950/30 rounded-2xl p-4 border border-imposter-color/50"
               >
                 <h2 className="text-imposter-color font-bold mb-3 flex items-center justify-center gap-2">
                   🔴 İmposterlər
                 </h2>
                 <div className="flex flex-wrap justify-center gap-2">
                   {imposters.map((name, i) => (
                     <span key={i} className="bg-imposter-color text-white px-3 py-1.5 rounded-lg font-medium shadow-[0_0_10px_rgba(248,113,113,0.5)]">
                       {name}
                     </span>
                   ))}
                 </div>
               </motion.div>
             )}

             {showImposters && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="bg-green-950/30 rounded-2xl p-4 border border-citizen-color/50 mt-4"
               >
                 <h2 className="text-citizen-color font-bold mb-3 flex items-center justify-center gap-2">
                   ✅ Vətəndaşlar
                 </h2>
                 <div className="flex flex-wrap justify-center gap-2">
                   {citizens.map((name, i) => (
                     <span key={i} className="bg-background-elevated border border-citizen-color/50 text-white px-3 py-1 rounded-lg text-sm">
                       {name}
                     </span>
                   ))}
                 </div>
               </motion.div>
             )}
          </div>
          
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-background-primary/90 backdrop-blur-md border-t border-gray-800 shrink-0">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {isHost && (
            <button
              onClick={handleRematch}
              className="w-full py-4 bg-accent-primary text-white rounded-xl font-bold text-lg hover:bg-opacity-90 transition shadow-[0_0_15px_rgba(233,69,96,0.4)]"
            >
              Yenidən Oyna 🔄
            </button>
          )}
          <button
            onClick={handleMainMenu}
            className="w-full py-3 bg-background-elevated border border-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition"
          >
            Ana Menyu
          </button>
        </div>
      </div>

    </div>
  );
}
