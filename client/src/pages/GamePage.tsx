import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mic } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

export default function GamePage() {
  const { room, myId, myRole, myWord, myCategoryName, myCategoryIcon, myAllies } = useGameStore();
  const [isPeekOpen, setIsPeekOpen] = useState(false);

  if (!room) return null;

  const myPlayer = room.players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost || false;
  const isImposter = myRole === 'imposter';

  const firstSpeakerPlayer = room.players.find(p => p.id === room.firstSpeaker);

  const handleEndGame = () => {
    socket.emit('end_game', { roomCode: room.code });
  };

  return (
    <div className="flex flex-col h-screen bg-background-primary text-text-primary overflow-hidden relative">
      
      {/* Top Bar */}
      <div className="h-16 bg-background-elevated border-b border-gray-800 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-2 opacity-80">
           <span className="text-xl">
             🔒
           </span>
           <span className="font-medium font-inter text-sm tracking-wide text-text-muted">
             Gizlilik qorunur
           </span>
        </div>
        
        <button 
          onClick={() => setIsPeekOpen(!isPeekOpen)}
          className={`p-2 rounded-full transition-colors ${isPeekOpen ? 'bg-accent-primary text-white' : 'bg-background-card text-text-muted hover:text-white'}`}
        >
          {isPeekOpen ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>

      {/* Peek Overlay */}
      <AnimatePresence>
        {isPeekOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-background-card/95 backdrop-blur-md border-b border-gray-800 p-6 z-20 shadow-2xl"
          >
             <h3 className="text-center font-bold text-lg mb-4 text-accent-secondary-light">Gizli Məlumatınız</h3>
             <div className="bg-background-primary rounded-xl p-4 border border-gray-800">
                {isImposter ? (
                  <>
                     <p className="text-sm text-text-muted text-center mb-1">Kateqoriya:</p>
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
                     <p className="text-sm text-text-muted text-center mb-1">Gizli Söz:</p>
                     <p className="text-2xl font-bold text-center text-white">{myWord}</p>
                  </>
                )}
             </div>
             
             <button 
               onClick={() => setIsPeekOpen(false)}
               className="w-full mt-4 py-3 bg-gray-800 text-white rounded-xl font-medium"
             >
               Bağla
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6"
        onClick={() => isPeekOpen && setIsPeekOpen(false)} // close peek on tap outside
      >
        <div className="max-w-md mx-auto space-y-6 pb-24">
          
          {/* First Speaker Banner */}
          {firstSpeakerPlayer && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring' }}
              className="bg-accent-primary/20 border border-accent-primary rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(233,69,96,0.2)]"
            >
              <p className="text-sm text-text-muted mb-2 uppercase tracking-widest font-bold">İlk Danışan</p>
              <div className="flex items-center justify-center gap-3">
                <div className="bg-accent-primary p-3 rounded-full text-white">
                  <Mic size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white">{firstSpeakerPlayer.name}</h2>
              </div>
            </motion.div>
          )}

          <div className="text-center mt-8 mb-4">
             <p className="text-text-muted">Oyunda iştirak edənlər</p>
             <p className="text-xs text-gray-600 mt-1">Növbə ilə sözlə əlaqədar bir cümlə quraraq imposteri tapın.</p>
          </div>

          <div className="bg-background-card rounded-2xl p-2 border border-gray-800 grid grid-cols-2 gap-2">
            {room.players.map(p => (
              <div key={p.id} className="bg-background-primary/50 p-3 rounded-xl text-center border border-gray-800/50">
                <span className={`font-medium ${p.id === room.firstSpeaker ? 'text-accent-primary font-bold' : 'text-white'}`}>
                  {p.name}
                </span>
                {!p.isConnected && <span className="ml-1 text-xs text-red-500">(Xətdə deyil)</span>}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-background-primary/90 backdrop-blur-md border-t border-red-900/30">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleEndGame}
              className="w-full py-4 bg-red-600/90 text-white rounded-xl font-bold text-lg hover:bg-red-500 transition shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              Oyunu Bitir (Nəticələr)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
