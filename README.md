# 🌸 Tanmai's Sanctuary v3

## 🚀 Deployment to Vercel (FIXES THE 404)

The `vercel.json` file is already configured. Just:

1. Push ALL files (including `vercel.json`) to your GitHub repo
2. Vercel will automatically redeploy
3. The 404 is fixed!

**Important:** Make sure your folder structure on GitHub looks like:
```
your-repo/
├── index.html          ← Must be at ROOT
├── game.js
├── style.css
├── vercel.json         ← NEW - fixes 404
├── letters.json
├── plant-data.json
├── package.json
└── assets/
    ├── models/
    │   ├── japanese_style_room.glb
    │   ├── cc0__youko_sakura_prunus_yoko.glb
    │   ├── old_tv.glb
    │   ├── british_postbox.glb
    │   ├── spherical_japanese_paper_lantern.glb
    │   ├── sweetheart_cushion.glb
    │   └── wizard_table.glb
    ├── sounds/
    │   └── Chinuku Take-SenSongsMp3.Co.mp3
    └── textures/
```

## 🎵 Adding More Songs to the Music Player

In `game.js`, find the `initMusicPlayer()` method and add tracks to the array:

```javascript
tracks: [
    { name: 'Chinuku Take', artist: 'SenSongs', file: 'assets/sounds/Chinuku Take-SenSongsMp3.Co.mp3' },
    { name: 'Your Song Name', artist: 'Artist', file: 'assets/sounds/your-file.mp3' },
    { name: 'Another Song', artist: 'Artist', file: 'assets/sounds/another.mp3' },
]
```

Then put the MP3 files in `assets/sounds/`.

## ✨ Features

- 🌌 **Stunning Space Sky** — 2500 stars, shooting stars, 4 planets, detailed moon, nebula clouds, aurora borealis
- 🏠 **Japanese Room** — GLB model with procedural fallback
- 🌸 **Cherry Blossoms** — 400 particles gently falling
- 🌿 **Interactive Bonsai** — Water/fertilize, track growth
- 💌 **Love Letters** — Read/write system
- 📺 **Memory Gallery** — In-game screenshots
- 🎵 **Full Music Player** — Play/pause/skip/shuffle/repeat/volume/progress bar/playlist
- ✨ **Bloom Post-Processing** — Cinematic glow
- 💾 **Auto-Save** — localStorage persistence