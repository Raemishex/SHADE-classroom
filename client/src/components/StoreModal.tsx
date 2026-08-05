import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SoundFX } from '../utils/SoundFX';
import { X, Sparkles, Video, Check, Lock, Shield, Palette } from 'lucide-react';

interface CardSkin {
  id: string;
  name: string;
  price: number;
  icon: string;
  colorGradient: string;
  borderColor: string;
  description: string;
}

const CARD_SKINS: CardSkin[] = [
  {
    id: 'velvet_noir',
    name: 'Velvet Noir',
    price: 0,
    icon: '🕵️‍♂️',
    colorGradient: 'from-[#241e2e] via-[#1a1520] to-[#2e2640]',
    borderColor: 'border-[rgba(163,155,181,0.3)]',
    description: 'Dərin şabalıd velvet toxuması.'
  },
  {
    id: 'amber_gold',
    name: 'Amber Gold',
    price: 300,
    icon: '👑',
    colorGradient: 'from-[rgba(245,158,11,0.2)] via-[#241e2e] to-[#1a1520]',
    borderColor: 'border-[rgba(245,158,11,0.5)] shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    description: 'Qızılı amber işıqlanma.'
  },
  {
    id: 'emerald_shadow',
    name: 'Emerald Shadow',
    price: 450,
    icon: '🟢',
    colorGradient: 'from-[rgba(52,211,153,0.2)] via-[#241e2e] to-[#1a1520]',
    borderColor: 'border-[rgba(52,211,153,0.5)] shadow-[0_0_20px_rgba(52,211,153,0.2)]',
    description: 'Zümrüd kölgə effektli kart.'
  },
  {
    id: 'rose_crimson',
    name: 'Rose Crimson',
    price: 600,
    icon: '🩸',
    colorGradient: 'from-[rgba(244,63,94,0.2)] via-[#241e2e] to-[#1a1520]',
    borderColor: 'border-[rgba(244,63,94,0.5)] shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    description: 'Qırmızı imposter prestij kartı.'
  }
];

export const StoreModal: React.FC = () => {
  const {
    coins,
    selectedSkin,
    unlockedSkins,
    isStoreOpen,
    toggleStore,
    setSelectedSkin,
    unlockSkin,
    addCoins
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'skins' | 'rewards'>('skins');
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isStoreOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSkinSelect = (skin: CardSkin) => {
    SoundFX.playClick();
    if (unlockedSkins.includes(skin.id)) {
      setSelectedSkin(skin.id);
      showNotification(`"${skin.name}" kartı seçildi!`);
    } else {
      if (coins >= skin.price) {
        addCoins(-skin.price);
        unlockSkin(skin.id);
        setSelectedSkin(skin.id);
        SoundFX.playVictory();
        showNotification(`Təbrik edirik! "${skin.name}" skin-i uğurla alındı! 🎉`);
      } else {
        showNotification(`Kafi Coin yoxdur! (${skin.price - coins} Coin çatışmır)`);
      }
    }
  };

  const handleWatchAd = () => {
    if (isWatchingAd) return;
    SoundFX.playClick();
    setIsWatchingAd(true);
    setAdCountdown(3);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWatchingAd(false);
          addCoins(200);
          SoundFX.playVictory();
          showNotification('Reklam izlənildi! +200 Coins qazandınız! 🪙');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg">
      <div className="relative w-full max-w-md card-surface border-[rgba(163,155,181,0.2)] p-5 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(163,155,181,0.12)]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h3 className="font-heading font-bold text-xl text-[#f0ecf5] tracking-wide">
                MAĞAZA VƏ PRESTİJ
              </h3>
              <p className="text-xs text-[#a39bb5] font-body">
                Kart Skinləri & Gəlir Mükafatları
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundFX.playClick();
              toggleStore();
            }}
            className="p-2 rounded-xl bg-[rgba(163,155,181,0.1)] text-[#a39bb5] hover:text-[#f0ecf5] hover:bg-[rgba(163,155,181,0.2)] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications toast */}
        {notification && (
          <div className="mt-3 p-2.5 rounded-xl bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] text-center text-xs font-bold text-[#f59e0b] shadow-lg animate-bounce">
            {notification}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 my-4 p-1 rounded-xl bg-[rgba(163,155,181,0.06)] border border-[rgba(163,155,181,0.12)]">
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('skins');
            }}
            className={`flex-1 py-2 rounded-lg font-heading font-bold text-sm tracking-wide transition-all ${
              activeTab === 'skins'
                ? 'bg-[#f59e0b] text-[#1a1520] shadow-md'
                : 'text-[#a39bb5] hover:text-[#f0ecf5]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 inline mr-1.5" />
            Kart Skinləri
          </button>
          <button
            onClick={() => {
              SoundFX.playClick();
              setActiveTab('rewards');
            }}
            className={`flex-1 py-2 rounded-lg font-heading font-bold text-sm tracking-wide transition-all ${
              activeTab === 'rewards'
                ? 'bg-[#f59e0b] text-[#1a1520] shadow-md'
                : 'text-[#a39bb5] hover:text-[#f0ecf5]'
            }`}
          >
            <Video className="w-3.5 h-3.5 inline mr-1.5" />
            Coin Qazan (+200)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'skins' ? (
            CARD_SKINS.map((skin) => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isSelected = selectedSkin === skin.id;

              return (
                <div
                  key={skin.id}
                  onClick={() => handleSkinSelect(skin)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
                    isSelected
                      ? 'border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)] shadow-[0_4px_20px_rgba(245,158,11,0.1)]'
                      : 'border-[rgba(163,155,181,0.1)] bg-[rgba(163,155,181,0.04)] hover:border-[rgba(163,155,181,0.2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-16 rounded-xl border bg-gradient-to-br ${skin.colorGradient} ${skin.borderColor} flex items-center justify-center text-xl shadow-md`}
                    >
                      {skin.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-base text-[#f0ecf5]">
                          {skin.name}
                        </h4>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.3)] text-[10px] text-[#f59e0b] font-code font-bold">
                            Seçilib
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#a39bb5]">{skin.description}</p>
                    </div>
                  </div>

                  {/* Price / Select Status */}
                  <div>
                    {isUnlocked ? (
                      <button
                        className={`px-3 py-1.5 rounded-xl font-body font-bold text-xs ${
                          isSelected
                            ? 'bg-[#f59e0b] text-[#1a1520]'
                            : 'bg-[rgba(163,155,181,0.1)] text-[#f0ecf5] hover:bg-[rgba(163,155,181,0.2)]'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4 inline" /> : 'Seç'}
                      </button>
                    ) : (
                      <button
                        className={`px-3 py-1.5 rounded-xl font-body font-bold text-xs flex items-center gap-1 ${
                          coins >= skin.price
                            ? 'bg-[#f59e0b] text-[#1a1520]'
                            : 'bg-[rgba(163,155,181,0.1)] text-[#a39bb5] cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{skin.price} Coins</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="space-y-4 py-2">
              {/* Watch Ad Reward Box */}
              <div className="p-4 rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] mx-auto flex items-center justify-center text-[#f59e0b]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-lg text-[#f59e0b]">
                    QISA REKLAM İZLƏ
                  </h4>
                  <p className="text-xs text-[#a39bb5]">
                    Saniyələr içində +200 Coin qazan və istədiyin prestij kart skin-ini aktiv et!
                  </p>
                </div>

                <button
                  onClick={handleWatchAd}
                  disabled={isWatchingAd}
                  className="btn-primary flex items-center justify-center gap-2 py-3 text-base shadow-lg"
                >
                  <Video className="w-5 h-5" />
                  {isWatchingAd ? (
                    <span>Reklam İzlənilir... ({adCountdown}s)</span>
                  ) : (
                    <span>+200 COIN QAZAN 🎬</span>
                  )}
                </button>
              </div>

              {/* Security Banner */}
              <div className="p-3 rounded-xl bg-[rgba(163,155,181,0.06)] border border-[rgba(163,155,181,0.12)] flex items-center gap-2.5 text-xs text-[#a39bb5]">
                <Shield className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <span>Bütün qazanılan skinlər və coinlər yerli cihazınızda yadda saxlanılır.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
