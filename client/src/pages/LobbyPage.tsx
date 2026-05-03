import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, CheckCircle2, Circle } from 'lucide-react';
import { socket } from '../socket';
import { useGameStore } from '../store/gameStore';

interface Category {
  id: string;
  nameAz: string;
  icon: string;
}

export default function LobbyPage() {
  const { room, myId } = useGameStore();
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    fetch('/words.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(err => console.error("Could not load categories", err));
  }, []);

  if (!room) return null;

  const myPlayer = room.players.find(p => p.id === myId);
  const isHost = myPlayer?.isHost || false;
  
  const readyPlayersCount = room.players.filter(p => p.isReady).length;
  const canStart = readyPlayersCount >= 3 && room.settings.selectedCategories.length > 0;

  const handleToggleReady = () => {
    socket.emit('player_ready', { roomCode: room.code });
  };

  const handleStartGame = () => {
    socket.emit('start_game', { roomCode: room.code });
  };

  const updateSetting = (key: string, value: any) => {
    socket.emit('update_settings', { 
      roomCode: room.code, 
      settings: { [key]: value } 
    });
  };

  const toggleCategory = (id: string) => {
    const current = [...room.settings.selectedCategories];
    if (current.includes(id)) {
      updateSetting('selectedCategories', current.filter(c => c !== id));
    } else {
      updateSetting('selectedCategories', [...current, id]);
    }
  };

  const selectAllCategories = () => {
    if (room.settings.selectedCategories.length === categories.length) {
      updateSetting('selectedCategories', []);
    } else {
      updateSetting('selectedCategories', categories.map(c => c.id));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-primary text-text-primary overflow-hidden">
      
      {/* Header section */}
      <div className="pt-8 pb-4 px-4 text-center shrink-0">
        <p className="text-sm text-text-muted mb-1">OTAQ KODU</p>
        <h1 className="text-5xl font-orbitron font-bold text-white tracking-widest bg-background-elevated inline-block px-8 py-3 rounded-2xl shadow-[0_0_15px_rgba(255,255,255,0.1)] select-all">
          {room.code}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Players List */}
          <div className="bg-background-card rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
              <h2 className="font-bold flex items-center gap-2">
                <Users size={18} className="text-accent-primary" /> 
                Oyunçular
              </h2>
              <span className="text-sm text-text-muted">{room.players.length} / 16</span>
            </div>
            
            <div className="space-y-2">
              {room.players.map((p) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={p.id} 
                  className={`flex items-center justify-between p-3 rounded-xl ${p.isReady ? 'bg-background-elevated' : 'bg-background-primary/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white flex items-center gap-2">
                      {p.name}
                      {p.isHost && <Crown size={16} className="text-yellow-500" />}
                    </span>
                  </div>
                  <div>
                    {p.isReady ? (
                      <CheckCircle2 size={20} className="text-ready-color" />
                    ) : (
                      <Circle size={20} className="text-not-ready-color" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Settings for Host */}
          {isHost && (
            <div className="bg-background-card rounded-2xl p-4 border border-accent-secondary/50">
              <h2 className="font-bold mb-4 border-b border-gray-800 pb-2 text-accent-secondary-light">Oyun Tənzimləmələri</h2>
              
              <div className="space-y-5">
                {/* Imposter Count */}
                <div>
                  <label className="text-sm text-text-muted mb-2 block">İmposter Sayı</label>
                  <select 
                    className="w-full bg-background-elevated border border-gray-700 rounded-lg p-3 text-white outline-none"
                    value={room.settings.imposterCount}
                    onChange={(e) => updateSetting('imposterCount', e.target.value)}
                  >
                    <option value="auto">Avtomatik</option>
                    <option value="1">1 İmposter</option>
                    <option value="2">2 İmposter</option>
                  </select>
                </div>

                {/* Alliance Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white block">İmposter İttifaqı</label>
                    <p className="text-xs text-text-muted">İmposterlər bir-birini görür</p>
                  </div>
                  <button 
                    onClick={() => updateSetting('allianceMode', !room.settings.allianceMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${room.settings.allianceMode ? 'bg-accent-primary' : 'bg-gray-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${room.settings.allianceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm text-text-muted block">Kateqoriyalar</label>
                    <button onClick={selectAllCategories} className="text-xs text-accent-primary">Hamısını Seç</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {categories.map(cat => {
                      const isSelected = room.settings.selectedCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-sm transition text-left ${isSelected ? 'bg-accent-secondary text-white border border-accent-secondary' : 'bg-background-elevated text-text-muted border border-transparent'}`}
                        >
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.nameAz}</span>
                        </button>
                      );
                    })}
                  </div>
                  {room.settings.selectedCategories.length === 0 && (
                     <p className="text-xs text-red-400 mt-1">Ən azı 1 kateqoriya seçilməlidir.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Read Only Settings for non-hosts */}
          {!isHost && (
            <div className="bg-background-card rounded-2xl p-4 border border-gray-800">
               <h2 className="font-bold mb-2 text-sm text-text-muted">Oyun Tənzimləmələri</h2>
               <p className="text-sm text-white">İmposter Sayı: {room.settings.imposterCount === 'auto' ? 'Avtomatik' : room.settings.imposterCount}</p>
               <p className="text-sm text-white">İmposter İttifaqı: {room.settings.allianceMode ? 'Aktiv' : 'Passiv'}</p>
               <p className="text-sm text-white">Seçilmiş Kateqoriya Sayı: {room.settings.selectedCategories.length}</p>
            </div>
          )}
          
        </div>
      </div>

      {/* Bottom fixed controls */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background-primary/90 backdrop-blur-md border-t border-gray-800">
        <div className="max-w-md mx-auto flex gap-3">
          {!isHost ? (
             <button
               onClick={handleToggleReady}
               className={`flex-1 py-4 rounded-xl font-bold text-lg transition shadow-lg ${myPlayer?.isReady ? 'bg-background-card border-2 border-ready-color text-ready-color' : 'bg-ready-color text-black hover:bg-opacity-90'}`}
             >
               {myPlayer?.isReady ? 'Hazıram ✓' : 'Hazıram'}
             </button>
          ) : (
             <button
               onClick={handleStartGame}
               disabled={!canStart}
               className={`flex-1 py-4 rounded-xl font-bold text-lg transition shadow-lg ${canStart ? 'bg-accent-primary text-white hover:bg-opacity-90 shadow-[0_0_15px_rgba(233,69,96,0.4)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
             >
               Oyunu Başlat ({readyPlayersCount}/16)
             </button>
          )}
        </div>
      </div>
      
    </div>
  );
}
