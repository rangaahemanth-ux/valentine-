# 🌸 Tanmai's Sanctuary — Interactive 3D Love Letter

A first-person 3D exploration game built with Three.js. Walk around a Japanese-themed sanctuary, water a bonsai plant, write love letters, take photos, and explore.

---

## 🚀 Quick Start

1. Open a terminal in this folder
2. Run: `npx live-server --port=8080`
3. Open `http://localhost:8080` in Chrome
4. Click **Start Experience** → Click the screen to lock your mouse → Explore!

Or simply open `index.html` directly in your browser (some features like JSON loading work better with a local server).

---

## 🎮 Controls

| Key | Action |
|-----|--------|
| **WASD** | Move around |
| **Mouse** | Look around |
| **E** | Interact with objects |
| **Space** | Jump |
| **ESC** | Pause menu |

---

## 🏗️ Adding Your Own 3D Models (GLB Format)

The game has placeholder procedural geometry. To upgrade with real 3D models:

### Where to get free models:
- **Sketchfab**: https://sketchfab.com/search?type=models&q=japanese+room (download as GLB)
- **Poly Pizza**: https://poly.pizza
- **Quaternius**: https://quaternius.com/packs.html

### How to add them:

1. Create the folder: `assets/models/`
2. Place your `.glb` files there
3. In `game.js`, find the `═══ MODEL SLOT ═══` comments and uncomment the loader code:

```javascript
// Example — in createBonsaiPlant():
const loader = new THREE.GLTFLoader();
loader.load('assets/models/bonsai.glb', (gltf) => {
    gltf.scene.scale.set(0.5, 0.5, 0.5);
    group.add(gltf.scene);
});
```

### Recommended models to download:

| Object | Search Term | File to save as |
|--------|------------|-----------------|
| Bonsai tree | "bonsai tree" | `assets/models/bonsai.glb` |
| Retro TV | "retro television" | `assets/models/tv.glb` |
| Postbox | "japanese postbox" or "red mailbox" | `assets/models/postbox.glb` |
| Tea set | "japanese tea set" | `assets/models/teaset.glb` |
| Japanese room | "japanese room" or "tatami room" | `assets/models/room.glb` |
| Stone lantern | "japanese stone lantern" | `assets/models/lantern.glb` |

---

## 🎵 Adding Background Music

1. Create folder: `assets/sounds/`
2. Place your `.mp3` file there (e.g., your Chinuku Take song)
3. In `game.js`, find the `initAudio()` method and uncomment:

```javascript
audio.src = 'assets/sounds/music.mp3';
```

---

## 📁 Project Structure

```
tanmai-sanctuary/
├── index.html          ← Main HTML (UI, modals, HUD)
├── style.css           ← All styles (menus, HUD, modals, responsive)
├── game.js             ← Complete game engine (rendering, physics, interactions)
├── letters.json        ← Love letter data
├── plant-data.json     ← Plant state data
├── package.json        ← npm config
├── README.md           ← This file
└── assets/             ← YOUR FILES GO HERE
    ├── models/         ← .glb 3D models
    ├── textures/       ← .jpg/.png textures
    └── sounds/         ← .mp3 audio files
```

---

## ✨ Features

- 🏠 **Japanese Sanctuary** — Tatami floors, shoji walls, wooden beams, paper lanterns
- 🌸 **Cherry Blossom Particles** — 300 petals gently falling
- 🌿 **Bonsai Plant** — Water it daily, track health & growth (saved to localStorage)
- 💌 **Love Letter Box** — Read pre-written letters, write new ones
- 📺 **Memory Gallery** — Take in-game screenshots as memories
- 🍵 **Tea Ceremony Set** — Interactive tea set
- 🪨 **Zen Garden** — Raked sand with stones
- 🎋 **Terrace & Garden** — Bamboo, stone lantern, rock garden
- ✨ **Firefly Particles** — Glowing fireflies at night
- 💾 **Save/Load** — Game state persists in localStorage
- 🌸 **Bloom Post-Processing** — Cinematic glow effect

---

## 🌐 Deploying to Vercel/Netlify

Just push the entire folder to GitHub and connect to Vercel or Netlify. No build step needed — it's all static files.

---

Made with 💛 for Tanmai
