import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  hasSeenCard: boolean;
  isConnected: boolean;
}

export interface RoomSettings {
  selectedCategories: string[];
  imposterCount: number | 'auto';
  allianceMode: boolean;
  imposterHintMode: boolean;
  detectiveEnabled?: boolean;
  jokerEnabled?: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  status: 'lobby' | 'card_reveal' | 'playing' | 'ended';
  settings: RoomSettings;
  players: Player[];
  currentWord?: string | null;
  currentCategory?: { id: string; nameAz: string; icon: string } | null;
  firstSpeaker?: string | null;
  imposterIds?: string[];
}

interface GameState {
  // My personal info
  myId: string | null;
  myName: string;
  myRole: 'citizen' | 'imposter' | 'detective' | 'joker' | null;
  myWord: string | null;
  myCategoryName: string | null;
  myCategoryIcon: string | null;
  myAllies: string[];
  
  // Economy & Cosmetics
  coins: number;
  selectedSkin: string;
  unlockedSkins: string[];
  isStoreOpen: boolean;
  isMuted: boolean;
  
  // Room info
  room: Room | null;
  
  // UI state
  isPeekOpen: boolean;
  isCardRevealed: boolean;
  
  // Actions
  setMyInfo: (info: Partial<GameState>) => void;
  setRoom: (room: Room) => void;
  togglePeek: () => void;
  setIsCardRevealed: (isRevealed: boolean) => void;
  addCoins: (amount: number) => void;
  setSelectedSkin: (skinId: string) => void;
  unlockSkin: (skinId: string) => void;
  toggleStore: () => void;
  setIsMuted: (muted: boolean) => void;
  reset: () => void;
}

// Load persisted cosmetics
const getStoredCoins = (): number => {
  const val = localStorage.getItem('shade_coins');
  return val ? parseInt(val, 10) : 500;
};

const getStoredSkin = (): string => {
  return localStorage.getItem('shade_selected_skin') || 'neon_cyber';
};

const getStoredUnlockedSkins = (): string[] => {
  const val = localStorage.getItem('shade_unlocked_skins');
  return val ? JSON.parse(val) : ['neon_cyber'];
};

export const useGameStore = create<GameState>((set) => ({
  myId: null,
  myName: '',
  myRole: null,
  myWord: null,
  myCategoryName: null,
  myCategoryIcon: null,
  myAllies: [],
  
  coins: getStoredCoins(),
  selectedSkin: getStoredSkin(),
  unlockedSkins: getStoredUnlockedSkins(),
  isStoreOpen: false,
  isMuted: false,
  
  room: null,
  isPeekOpen: false,
  isCardRevealed: false,
  
  setMyInfo: (info) => set((state) => ({ ...state, ...info })),
  setRoom: (room) => set({ room }),
  togglePeek: () => set((state) => ({ isPeekOpen: !state.isPeekOpen })),
  setIsCardRevealed: (isCardRevealed) => set({ isCardRevealed }),
  
  addCoins: (amount) => set((state) => {
    const newCoins = state.coins + amount;
    localStorage.setItem('shade_coins', newCoins.toString());
    return { coins: newCoins };
  }),
  
  setSelectedSkin: (skinId) => set(() => {
    localStorage.setItem('shade_selected_skin', skinId);
    return { selectedSkin: skinId };
  }),
  
  unlockSkin: (skinId) => set((state) => {
    if (state.unlockedSkins.includes(skinId)) return state;
    const newUnlocked = [...state.unlockedSkins, skinId];
    localStorage.setItem('shade_unlocked_skins', JSON.stringify(newUnlocked));
    return { unlockedSkins: newUnlocked };
  }),
  
  toggleStore: () => set((state) => ({ isStoreOpen: !state.isStoreOpen })),
  setIsMuted: (isMuted) => set({ isMuted }),
  
  reset: () => set({
    myRole: null,
    myWord: null,
    myCategoryName: null,
    myCategoryIcon: null,
    myAllies: [],
    room: null,
    isPeekOpen: false,
    isCardRevealed: false
  }),
}));
