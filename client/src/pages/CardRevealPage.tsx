import { useState } from 'react';
import { motion } from 'framer-motion';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

export default function CardRevealPage() {
  const { room, myRole, myWord, myCategoryName, myCategoryIcon, myAllies } = useGameStore();
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasSeenAtLeastOnce, setHasSeenAtLeastOnce] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handlePointerDown = () => {
    setIsRevealed(true);
    setHasSeenAtLeastOnce(true);
  };

  const handlePointerUpOrLeave = () => {
    setIsRevealed(false);
  };

  const handleConfirmSeen = () => {
    if (!room || hasConfirmed) return;
    setHasConfirmed(true);
    socket.emit('player_seen_card', { roomCode: room.code });
  };

  const isImposter = myRole === 'imposter';

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background-primary text-text-primary px-4 perspective-1000">
      
      <div className="text-center mb-8 h-16">
         {!isRevealed && !hasConfirmed && (
           <motion.p 
             animate={{ opacity: [0.5, 1, 0.5] }} 
             transition={{ repeat: Infinity, duration: 2 }}
             className="text-text-muted"
           >
             Kartı görmək üçün basıb saxla
           </motion.p>
         )}
         {hasConfirmed && (
           <p className="text-ready-color font-medium">Digər oyunçular gözlənilir...</p>
         )}
      </div>

      {/* The 3D Card */}
      <div 
        className="relative w-72 h-96 cursor-pointer transform-style-3d transition-transform duration-500 ease-out select-none"
        style={{ transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUpOrLeave}
        onPointerLeave={handlePointerUpOrLeave}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Card Front (Face down to user initially) */}
        <div className="absolute inset-0 w-full h-full bg-background-card border-2 border-accent-secondary rounded-2xl flex items-center justify-center backface-hidden shadow-[0_0_20px_rgba(15,52,96,0.5)]">
          <div className="text-center opacity-30">
             <div className="w-16 h-16 border-4 border-dashed border-white rounded-full mx-auto mb-2 animate-spin-slow"></div>
             <p className="font-orbitron font-bold tracking-widest text-lg">SHADE</p>
             <p className="font-orbitron font-bold text-xs">Classroom</p>
          </div>
        </div>

        {/* Card Back (Face up when revealed) */}
        <div className={`absolute inset-0 w-full h-full bg-background-elevated rounded-2xl p-6 backface-hidden rotate-y-180 flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 ${isImposter ? 'border-imposter-color shadow-[0_0_25px_rgba(248,113,113,0.3)]' : 'border-citizen-color shadow-[0_0_25px_rgba(74,222,128,0.3)]'}`}>
          
          <h2 className={`text-2xl font-bold font-orbitron mt-2 ${isImposter ? 'text-imposter-color' : 'text-citizen-color'}`}>
             {isImposter ? '🔴 İMPOSTER' : '👤 VƏTƏNDAŞ'}
          </h2>
          
          <div className="flex-1 flex flex-col justify-center w-full mt-4 bg-background-card rounded-xl p-4 border border-gray-800">
            {isImposter ? (
               <>
                 <p className="text-sm text-text-muted text-center mb-1">İpucun:</p>
                 <p className="text-xl font-bold text-center text-white mb-4">{myCategoryName} {myCategoryIcon}</p>
                 
                 {myAllies.length > 0 && (
                   <>
                     <div className="h-px bg-gray-800 w-full my-3"></div>
                     <p className="text-sm text-text-muted text-center mb-1">Müttəfiqlərin:</p>
                     <div className="flex flex-wrap gap-2 justify-center">
                        {myAllies.map((ally, i) => (
                           <span key={i} className="text-imposter-color font-medium text-sm bg-imposter-color/10 px-2 py-1 rounded">🤝 {ally}</span>
                        ))}
                     </div>
                   </>
                 )}
               </>
            ) : (
               <>
                 <p className="text-sm text-text-muted text-center mb-1">Sözün:</p>
                 <p className="text-3xl font-bold text-center text-white">{myWord}</p>
               </>
            )}
          </div>

          <p className="text-sm text-text-muted mt-6 text-center font-medium">
             {isImposter ? 'Sözü tap, blef et!' : 'Bu sözü unutma!'}
          </p>

        </div>
      </div>

      <div className="mt-12 h-16 w-full max-w-xs">
        {hasSeenAtLeastOnce && !hasConfirmed && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleConfirmSeen}
            className="w-full py-4 bg-ready-color text-black rounded-xl font-bold text-lg shadow-[0_0_15px_rgba(74,222,128,0.4)]"
          >
            Gördüm ✓
          </motion.button>
        )}
      </div>

    </div>
  );
}
