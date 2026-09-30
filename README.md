# LAST ZONE - 3D Browser Battle Royale

**LAST ZONE** is a fast-paced, original 3D browser battle-royale game prototype. Dropped onto Hazard Island alongside 14 AI-controlled combatants, you must scavenge weapons, ammunition, armor, and medical supplies while fighting to be the last survivor as the deadly electric Safe Zone contracts.

---

## 🎮 Controls

### Desktop (Keyboard & Mouse)
- **W, A, S, D**: Move / Strafe
- **Left Shift**: Sprint
- **Space**: Jump
- **Mouse Movement**: Aim / Look (click the screen to lock mouse pointer)
- **Left Mouse Button**: Shoot
- **R**: Reload magazine
- **E**: Scavenge / Pick up weapons & items
- **H**: Use medical kit / Heal
- **1, 2, 3**: Switch weapon slots (Primary, Secondary, Sidearm)
- **Esc**: Pause match

### Mobile (Touchscreens)
- **Left Thumb (Virtual Joystick)**: Touch and drag anywhere on the bottom-left to move. Pushing outward automatically triggers sprint.
- **Right Thumb**: Swipe anywhere on the right half of the screen to aim and turn.
- **Dedicated Touch Buttons**:
  - 🎯 **FIRE**: Large thumb button to shoot
  - 🔄 **RELOAD**: Quick reload button
  - ⬆️ **JUMP**: Jump obstacles
  - ➕ **HEAL**: Consume medical kit
  - 🔀 **SWAP**: Cycle active weapon
  - ✋ **LOOT**: Scavenge nearby weapons, ammo, and armor

---

## ⚡ Key Features

1. **Original Weapons**:
   - **Pulse Rifle**: All-around automatic assault rifle (Heavy Ammo)
   - **Viper SMG**: Ultra-high fire rate submachine gun (Light Ammo)
   - **Ranger Shotgun**: 7-pellet scatter blast with brutal close-range burst damage (Shells)
   - **Falcon DMR**: Precision semi-automatic marksman rifle (Heavy Ammo)
   - **Sidekick Pistol**: Fast-reloading tactical sidearm (Light Ammo)
2. **Dynamic Shrinking Safe Zone ("LAST ZONE")**:
   - 4 shrinking phases with countdown timers
   - 3D visual energy barrier dome in the world
   - 2D minimap radar showing current ring (blue) and next ring (dashed white)
   - Continuous radiation damage ticks if trapped outside
3. **AI Combatants**:
   - 14 distinct AI survivors with original tactical names
   - State machine: Patrol, Search, Chase, Attack, Cover, Fleeing to Safe Zone, Reloading
   - Believable combat accuracy so players can dodge, flank, and outplay them
4. **Procedural Web Audio Engine**:
   - 100% self-contained synthesized audio using the browser's Web Audio API
   - Unique gunshot audio per weapon, mechanical reload clicks, footstep thuds, hit markers, zone sirens, countdown beeps, and victory fanfare
   - Zero external audio download dependencies (no broken audio links)
5. **HUD & Tactical Systems**:
   - Real-time Players Alive and Kills count
   - Dynamic crosshair with hit confirmation (white) and kill confirmation (red)
   - Health and Armor absorption bars
   - Live elimination killfeed
   - In-game Settings (Master, SFX, and Ambience volumes, Mouse sensitivity, Graphics quality: Low/Med/High)

---

## 🚀 Local Build & Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Production build
npm run build
```

---

## 🌐 Vercel Deployment Instructions

This project is built as a pure client-side SPA with Vite and React, making deployment to Vercel completely seamless:

1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Vercel automatically detects the **Vite** framework preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**. Your game will be live in under a minute!

---

## 🔒 Fixing "Vercel Account / Access Request" Login Screen

If your live URL asks visitors to log in with Vercel or request access, Vercel's **Deployment Protection** is enabled by default on your account. To make it publicly playable for everyone:

1. Open your project on [vercel.com](https://vercel.com).
2. Go to **Settings** (top navigation tab).
3. In the left menu, select **Deployment Protection**.
4. Find **Vercel Authentication**.
5. Toggle or set it to **Disabled** (turn off for Preview and Production).
6. Click **Save**.
7. Share your main production link (e.g., `https://your-project.vercel.app`). Anyone can now open and play immediately without needing an account!
