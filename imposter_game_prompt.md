# FULL PROJECT PROMPT — "Who Is The Imposter?" Word Party Game
## (Köstəbək Kim / Imposter Who — Style Social Deduction Game)

---

> **HOW TO USE THIS PROMPT:**
> Give this entire document to your AI coding assistant (Cursor, Windsurf, Copilot, Claude, etc.) as the initial project prompt. Do NOT skip any section. Every detail here is intentional.

---

## 0. WHAT ARE WE BUILDING?

A **real-time multiplayer web party game** inspired by "Who Is The Imposter?" / "Köstəbək Kim". Players sit in the **same physical room** with their own phones/devices, connect to a shared game session via a 4-digit room code, and play a social deduction word game together.

The game flow in one sentence: *Everyone gets a secret word — but imposters get only the category name instead — then players talk, bluff, and figure out who the impostors are.*

---

## 1. TECH STACK — USE EXACTLY THESE

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **React + Vite** | TypeScript preferred |
| Backend | **Node.js + Express** | Simple REST for setup + Socket.io for real-time |
| Real-time | **Socket.io** | The ONLY real-time solution. Do NOT use Supabase, Firebase, Pusher, or anything else |
| State (Frontend) | **Zustand** | For global game state on the client |
| Styling | **Tailwind CSS + shadcn/ui** | Dark-themed, game-like atmosphere |
| Animations | **Framer Motion** | Card flips, lobby transitions, result reveals |
| Confetti | **canvas-confetti** | Fire on game end screen |

**CRITICAL RULE:** Do NOT introduce any database (no PostgreSQL, no MongoDB, no SQLite, no Supabase). All game state lives **in memory on the Node.js server** as a JavaScript object. The game is session-based — if the server restarts, rooms are gone. This is intentional and acceptable.

---

## 2. PROJECT FOLDER STRUCTURE

Create this exact structure:

```
project-root/
├── client/                  ← React + Vite frontend
│   ├── src/
│   │   ├── components/      ← Reusable UI components
│   │   ├── pages/           ← Screen-level components
│   │   │   ├── HomePage.tsx         ← Create/Join room
│   │   │   ├── LobbyPage.tsx        ← Waiting room
│   │   │   ├── CardRevealPage.tsx   ← Hold-to-see card
│   │   │   ├── GamePage.tsx         ← Active game screen
│   │   │   └── ResultPage.tsx       ← Game over screen
│   │   ├── store/
│   │   │   └── gameStore.ts         ← Zustand store
│   │   ├── socket.ts                ← Socket.io client singleton
│   │   └── main.tsx
│   ├── public/
│   │   └── words.json               ← The word database (provided, do not modify)
│   └── vite.config.ts
│
├── server/
│   ├── index.js             ← Express + Socket.io server entry point
│   ├── roomManager.js       ← All room/game logic
│   └── words.json           ← Same word database (copy here too)
│
└── package.json (or separate client/server package.json files)
```

---

## 3. THE WORD DATABASE — `words.json`

The `words.json` file is **already provided by the developer**. Do NOT generate or modify words.

**Structure of words.json:**
```json
{
  "metadata": { "totalCategories": 16, "totalWords": 1220 },
  "categories": [
    { "id": "yemekler", "nameAz": "Yeməklər", "nameEn": "Foods", "icon": "🍕", "isPremium": false },
    { "id": "heyvanlar", "nameAz": "Heyvanlar", "nameEn": "Animals", "icon": "🐾", "isPremium": false },
    ...16 categories total...
  ],
  "words": {
    "yemekler": [
      { "az": "Pizza", "en": "Pizza", "difficulty": 1 },
      ...
    ],
    ...
  }
}
```

**How the game uses this data:**
- **Citizens (Vətəndaş):** See the selected word. Example: *"Pizza"*
- **Imposters (İmposter):** See ONLY the category name. Example: *"Yeməklər 🍕"*
- There are NO per-word hints. The category name IS the only hint for imposters. This is intentional game design.

---

## 4. IN-MEMORY ROOM STATE (SERVER)

On the Node.js server, maintain a single `rooms` object in `roomManager.js`:

```javascript
const rooms = {};

// Structure of each room:
rooms["4582"] = {
  code: "4582",
  hostId: "socket_id_of_host",       // socket.id of the host player
  status: "lobby",                    // "lobby" | "card_reveal" | "playing" | "ended"
  
  settings: {
    selectedCategories: ["yemekler", "heyvanlar"],  // chosen by host; [] means ALL categories
    imposterCount: 1,         // number of imposters (1 or 2, auto-calculated if 0)
    allianceMode: false,      // if true, imposters see each other's names on their card
    imposterHintMode: true,   // always true in our game (category name as hint)
  },
  
  players: [
    {
      id: "socket_id_1",       // socket.id — used as unique identifier
      name: "Rəşad",           // chosen by player on join
      isHost: true,
      role: null,              // null until game starts, then "citizen" | "imposter"
      isReady: false,          // in lobby: clicked "Ready" button
      hasSeenCard: false,      // in card_reveal: clicked "I Saw It" button
      isConnected: true,       // tracks connection status
      disconnectedAt: null,    // timestamp when they disconnected
    }
  ],
  
  currentWord: null,           // e.g., "Pizza" — assigned when game starts
  currentCategory: null,       // e.g., { id: "yemekler", nameAz: "Yeməklər", icon: "🍕" }
  firstSpeaker: null,          // player id of who speaks first (random)
  createdAt: Date.now(),
};
```

---

## 5. SOCKET.IO EVENTS — COMPLETE LIST

### Client → Server (events the client emits):

| Event | Payload | Description |
|---|---|---|
| `create_room` | `{ playerName }` | Host creates a new room |
| `join_room` | `{ roomCode, playerName }` | Player joins existing room |
| `player_ready` | `{ roomCode }` | Player toggles ready status in lobby |
| `update_settings` | `{ roomCode, settings }` | Host changes game settings (categories, imposter count, modes) |
| `start_game` | `{ roomCode }` | Host starts the game (only host can do this) |
| `player_seen_card` | `{ roomCode }` | Player confirmed they saw their card |
| `end_game` | `{ roomCode }` | Host ends the game (shows results) |
| `rematch` | `{ roomCode }` | Host requests rematch (keep players, reset game) |
| `leave_room` | `{ roomCode }` | Player voluntarily leaves the room |

### Server → Client (events the server emits):

| Event | Payload | Description |
|---|---|---|
| `room_created` | `{ room }` | Sent to host after room creation |
| `room_joined` | `{ room }` | Sent to joining player |
| `room_updated` | `{ room }` | Broadcast to ALL in room when anything changes |
| `game_started` | `{ role, word?, categoryName, categoryIcon, allies? }` | Sent INDIVIDUALLY to each player with their personal role info |
| `game_phase_changed` | `{ status, firstSpeaker? }` | Broadcast when game phase changes |
| `game_ended` | `{ word, category, imposters, reason }` | Broadcast to all when game ends |
| `error` | `{ message }` | Sent to specific client on error |
| `host_changed` | `{ newHostId, newHostName }` | Broadcast when host changes due to disconnection |

---

## 6. GAME FLOW — STEP BY STEP

### STEP 1: Home Screen
- Two options: **"Otaq Yarat" (Create Room)** and **"Otağa Qoşul" (Join Room)**
- Create Room: enter your name → server generates 4-digit code → redirect to lobby
- Join Room: enter room code + your name → validate → redirect to lobby
- Validation: room must exist, must have space (max 16 players), game must not have started

### STEP 2: Lobby Screen
All players see:
- The 4-digit room code (large, copyable)
- Live list of all players with their ready status (green checkmark = ready)
- Player count: "X / 16"
- Host badge next to host's name

**Host-only controls (visible only to host):**
- Category selector: checkboxes for all 16 categories with emoji icons. Can select multiple or "Hamısı (All)". At least 1 must be selected.
- Imposter count: dropdown or toggle: "Avtomatik", "1 İmposter", "2 İmposter"
  - Auto rule: 3-5 players → 1 imposter; 6+ players → 2 imposters
- Alliance Mode toggle (İmposter İttifaqı): if ON, imposters see each other's names on their card and in the peek panel
- "Oyunu Başlat (Start Game)" button — only enabled when: at least 3 players are ready (including host) AND at least 1 category selected

**All players:**
- "Hazıram (Ready)" toggle button
- Can see room settings (read-only, except host)

### STEP 3: Card Reveal Phase (`status: "card_reveal"`)
This happens right after host clicks Start Game.

Each player sees their own screen with a **card face-down**.

**The card interaction (CRITICAL - implement carefully):**
- The card has text: *"Kartı görmək üçün basıb saxla"* ("Hold to see your card")
- User must **press and hold** the card (mouse down / touch start)
- While holding: card flips over (CSS 3D flip animation) and shows content
- When released: card flips back to face-down immediately
- This prevents others from seeing the card accidentally

**What the card shows:**

For a **CITIZEN**:
```
┌─────────────────────┐
│   👤 VƏTƏNDAŞsan   │
│                     │
│   Sözün:            │
│   🍕 Pizza          │
│                     │
│  Bu sözü unutma!    │
└─────────────────────┘
```

For an **IMPOSTER (with Alliance Mode OFF)**:
```
┌─────────────────────┐
│   🔴 İMPOSTERsən   │
│                     │
│   İpucun:           │
│   Yeməklər 🍕       │
│                     │
│  Sözü tap, blef et! │
└─────────────────────┘
```

For an **IMPOSTER (with Alliance Mode ON, 2 imposters)**:
```
┌─────────────────────┐
│   🔴 İMPOSTERsən   │
│                     │
│   İpucun:           │
│   Yeməklər 🍕       │
│                     │
│   Müttəfiqin:       │
│   🤝 Elvin          │
└─────────────────────┘
```

After seeing the card, player clicks **"Gördüm ✓"** ("I saw it") button.

Phase advances to `"playing"` when ALL players have clicked "Gördüm".

### STEP 4: Game Screen (`status: "playing"`)

**Top bar (always visible, never hidden):**
- For CITIZENS: Shows `🍕 Pizza` — the secret word
- For IMPOSTERS: Shows `Yeməklər 🍕` — the category name (their hint)
- A **👁️ eye icon button** in the top-right corner

**The 👁️ Eye Button (Peek Panel):**
- Tap to show a small overlay/bottom sheet
- For CITIZENS: shows the word again (in case they forgot)
- For IMPOSTERS: shows the category AND their allies (if alliance mode)
- Tap again or tap outside to hide
- This panel appears ON TOP of everything, covering part of screen
- Designed to be briefly peeked at without others noticing

**Center of screen:**
- Shows who speaks first: *"İlk danışan: 🎙️ Rəşad"* (randomly selected, shown to everyone)
- Below that: a simple list of all player names for reference

**Host-only controls (bottom of screen):**
- **"Oyunu Bitir (End Game)"** red button — ends the game immediately

**No voting UI. No timers. Players talk in real life.**

### STEP 5: Result Screen (`status: "ended"`)

Shown to ALL players simultaneously when host ends game.

Reveals:
- The secret word: *"Söz: 🍕 Pizza"*
- The category: *"Kateqoriya: Yeməklər"*
- Imposters revealed with names and red highlight: *"İmposterlər: 🔴 Elvin, 🔴 Sara"*
- All citizens listed in green: *"Vətəndaşlar: ✅ Rəşad, ✅ Nigar..."*
- canvas-confetti fires on this screen

**Buttons:**
- **"Rematch 🔄"** (host only) — resets to lobby with SAME players and SAME room code. Roles cleared, words cleared, ready status cleared. Settings stay as they were. Players can change settings again in lobby.
- **"Ana Menyu (Main Menu)"** (all players) — goes back to home screen

---

## 7. IMPOSTER COUNT AUTO-CALCULATION

```javascript
function calculateImposterCount(playerCount, manualCount) {
  if (manualCount === "auto" || manualCount === 0) {
    if (playerCount <= 5) return 1;
    return 2;
  }
  // Manual override: ensure at least 1 citizen remains
  const max = Math.floor(playerCount / 2) - 1;
  return Math.min(manualCount, max);
}
```

---

## 8. ROLE ASSIGNMENT (SERVER-SIDE)

When host clicks Start Game, the server does this:

```javascript
function assignRoles(room) {
  const players = room.players;
  const count = calculateImposterCount(players.length, room.settings.imposterCount);
  
  // Shuffle player array
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  
  // First `count` players become imposters, rest are citizens
  shuffled.forEach((player, index) => {
    player.role = index < count ? "imposter" : "citizen";
  });
  
  // Select random word from selected categories
  const selectedCats = room.settings.selectedCategories.length > 0
    ? room.settings.selectedCategories
    : allCategoryIds;
  
  const randomCat = selectedCats[Math.floor(Math.random() * selectedCats.length)];
  const wordsInCat = wordsData.words[randomCat];
  const randomWord = wordsInCat[Math.floor(Math.random() * wordsInCat.length)];
  
  room.currentWord = randomWord.az;
  room.currentCategory = wordsData.categories.find(c => c.id === randomCat);
  room.status = "card_reveal";
  
  // Select first speaker randomly
  room.firstSpeaker = players[Math.floor(Math.random() * players.length)].id;
  
  // Reset card-seen status
  players.forEach(p => p.hasSeenCard = false);
}
```

Then for each player, emit `game_started` **individually** with their personal data:

```javascript
players.forEach(player => {
  const isImposter = player.role === "imposter";
  const allies = isImposter && room.settings.allianceMode
    ? players.filter(p => p.role === "imposter" && p.id !== player.id).map(p => p.name)
    : [];
  
  io.to(player.id).emit("game_started", {
    role: player.role,
    word: isImposter ? null : room.currentWord,          // citizens get word, imposters get null
    categoryName: room.currentCategory.nameAz,
    categoryIcon: room.currentCategory.icon,
    allies: allies,                                       // empty array if not imposter or alliance off
  });
});
```

---

## 9. DISCONNECT & RECONNECT HANDLING

### When a player disconnects (socket `disconnect` event):

```javascript
socket.on("disconnect", () => {
  const room = findRoomByPlayerId(socket.id);
  if (!room) return;
  
  const player = room.players.find(p => p.id === socket.id);
  if (!player) return;
  
  player.isConnected = false;
  player.disconnectedAt = Date.now();
  
  // If this was the host, transfer host to another random connected player
  if (player.isHost && room.status === "lobby") {
    const newHost = room.players.find(p => p.isConnected && p.id !== socket.id);
    if (newHost) {
      player.isHost = false;
      newHost.isHost = true;
      room.hostId = newHost.id;
      io.to(room.code).emit("host_changed", { newHostId: newHost.id, newHostName: newHost.name });
    }
  }
  
  // During game: if host disconnects, transfer host immediately
  if (player.isHost && room.status !== "lobby") {
    const newHost = room.players.find(p => p.isConnected && p.id !== socket.id);
    if (newHost) {
      player.isHost = false;
      newHost.isHost = true;
      room.hostId = newHost.id;
      io.to(room.code).emit("host_changed", { newHostId: newHost.id, newHostName: newHost.name });
    }
  }
  
  io.to(room.code).emit("room_updated", { room: sanitizeRoom(room) });
  
  // Schedule cleanup: remove player permanently after 60 seconds if not reconnected
  setTimeout(() => {
    const currentPlayer = room.players.find(p => p.id === socket.id);
    if (currentPlayer && !currentPlayer.isConnected) {
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(room.code).emit("room_updated", { room: sanitizeRoom(room) });
      // Clean up empty rooms
      if (room.players.length === 0) delete rooms[room.code];
    }
  }, 60000); // 60 seconds grace period
});
```

### Reconnection:
If a player whose socket disconnected tries to rejoin the same room (same name + same room code within 60 seconds), match them to the existing player entry and restore their socket ID and role.

```javascript
// In join_room handler, check if a player with same name exists and is disconnected
const existingPlayer = room.players.find(
  p => p.name === playerName && !p.isConnected
);
if (existingPlayer) {
  existingPlayer.id = socket.id;       // update to new socket
  existingPlayer.isConnected = true;
  existingPlayer.disconnectedAt = null;
  socket.join(roomCode);
  // Re-send their current game state
  // ... send appropriate event based on room.status
}
```

### Voluntary leave:
When a player sends `leave_room` event:
- Remove them from players array immediately
- If they were host, transfer host to another player
- Emit `room_updated` to all remaining players
- If room becomes empty, delete it

---

## 10. UI DESIGN REQUIREMENTS

### Color Palette (dark theme):
```css
--bg-primary: #0f0f1a;        /* very dark navy */
--bg-card: #1a1a2e;           /* dark card background */
--bg-elevated: #16213e;       /* elevated elements */
--accent-primary: #e94560;    /* red/pink accent */
--accent-secondary: #0f3460;  /* blue accent */
--text-primary: #eaeaea;
--text-muted: #8892b0;
--citizen-color: #4ade80;     /* green for citizen */
--imposter-color: #f87171;    /* red for imposter */
--ready-color: #4ade80;
--not-ready-color: #64748b;
```

### Fonts:
- Heading: `Orbitron` or `Rajdhani` (Google Fonts) — futuristic, game-like
- Body: `Inter` or `DM Sans` — clean, readable

### The Card (CardRevealPage):
- Large, centered card (like a playing card, portrait orientation)
- Subtle border glow (citizen = green glow when shown, imposter = red glow)
- 3D CSS flip animation (rotateY) on hold, flip back on release
- Back of card: question mark pattern or game logo
- Satisfying shadow and glow effects

### Lobby Player List:
- Each player shown as a pill/badge with their name
- Animate new players joining with Framer Motion (slide in from side)
- Ready players get green background, crown emoji 👑 next to host name
- Show number count: "3 / 16 oyunçu"

### Animations (Framer Motion):
- Page transitions: fade + slide between all pages
- Card flip: CSS 3D transform (not Framer Motion, use CSS for performance)
- Lobby player joins: spring animation
- Result reveal: staggered reveal of each player name with delay

---

## 11. ZUSTAND STORE STRUCTURE (CLIENT)

```typescript
interface GameStore {
  // My personal info
  myId: string | null;           // my socket.id
  myName: string;
  myRole: "citizen" | "imposter" | null;
  myWord: string | null;         // null if imposter
  myCategoryName: string | null;
  myCategoryIcon: string | null;
  myAllies: string[];            // names of allied imposters (empty if citizen or no alliance)
  
  // Room info
  room: Room | null;             // full room object from server
  
  // UI state
  isPeekOpen: boolean;
  isCardRevealed: boolean;       // is user currently holding the card
  
  // Actions
  setMyInfo: (info: Partial<GameStore>) => void;
  setRoom: (room: Room) => void;
  togglePeek: () => void;
  reset: () => void;
}
```

---

## 12. IMPORTANT IMPLEMENTATION NOTES

1. **Socket.io singleton:** Create `client/src/socket.ts` that exports a single Socket.io client instance. Import this everywhere. Never create multiple instances.

2. **Room sanitization:** When sending room data to clients, NEVER include `role` of other players in `room_updated` events. The `room_updated` event only contains names, ready status, connected status. Roles are only sent privately via `game_started`.

3. **The hold-to-see mechanic:** Use `onPointerDown` / `onPointerUp` / `onPointerLeave` (covers both mouse and touch). Do NOT use `onClick`. When user holds, set `isCardRevealed = true` in local component state. Release sets it back to `false`.

4. **Mobile-first:** The game is primarily played on phones. All touch targets must be minimum 44x44px. The card must be easy to hold with a thumb.

5. **"Gördüm" button:** Only appears after the card has been seen at least once (track with local `hasSeen` state). After clicking, disable the button and show a checkmark. The server tracks `hasSeenCard` per player.

6. **Phase transition (card_reveal → playing):** Server checks if ALL players have `hasSeenCard: true`. If yes, change `status` to `"playing"`, pick `firstSpeaker`, and emit `game_phase_changed` to all.

7. **CORS:** Configure Express with CORS to allow requests from the Vite dev server (localhost:5173).

8. **Environment variables:** Use `.env` files. `VITE_SOCKET_URL` for client to know where the server is.

9. **Error handling:** Always emit `error` event to client on invalid operations (room not found, game already started, not enough players, etc.) and display toast notifications on client.

10. **Minimum players:** Do not allow game start if fewer than 3 players are ready. Show error message to host.

---

## 13. STARTUP INSTRUCTIONS TO GENERATE

After building, the AI must provide:

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies  
cd client && npm install

# Start server (runs on port 3001)
cd server && node index.js

# Start client (runs on port 5173)
cd client && npm run dev
```

And copy `words.json` to both `client/public/words.json` and `server/words.json`.

---

## 14. WHAT NOT TO BUILD (Explicitly excluded)

- ❌ No user authentication / login / accounts
- ❌ No database of any kind
- ❌ No persistent storage
- ❌ No voting / vote counting UI (players vote verbally in real life)
- ❌ No chat system
- ❌ No timer / countdown
- ❌ No sound effects (can be added later)
- ❌ No per-word hints (category name IS the hint)
- ❌ No English language support in UI (UI is in Azerbaijani)
- ❌ No user avatar / profile pictures
- ❌ No leaderboard
- ❌ No Supabase, Firebase, or any BaaS

---

## 15. SUMMARY CHECKLIST

Before considering the project done, verify all of these:

- [ ] Host can create room, gets 4-digit code
- [ ] Players can join with code and name
- [ ] Lobby shows live player list with ready/not-ready status
- [ ] Host can select categories (multi-select, min 1)
- [ ] Host can toggle Alliance Mode
- [ ] Host can set imposter count (auto/1/2)
- [ ] Game start requires minimum 3 ready players
- [ ] Card is only visible while holding (press & hold mechanic)
- [ ] Citizens see the word on their card
- [ ] Imposters see the category name on their card
- [ ] If Alliance Mode ON: imposters see ally names on card AND in peek panel
- [ ] "Gördüm" button appears after first hold, advances game when all click it
- [ ] During game: top bar always shows word (citizens) or category (imposters)
- [ ] 👁️ peek button shows/hides the info panel
- [ ] First speaker is randomly selected and shown to everyone
- [ ] Host can end game at any time
- [ ] Result screen shows word, category, and who the imposters were
- [ ] Confetti fires on result screen
- [ ] Rematch resets game but keeps players in same room
- [ ] Disconnected players get 60 seconds to reconnect
- [ ] If host disconnects/leaves, a random player becomes host
- [ ] All UI text is in Azerbaijani language
- [ ] Mobile-friendly (tested at 390px width)
