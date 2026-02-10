// 🔥 ULTRA-FIX VERSION 2 - Generated: 2025-02-10 03:15 AM UTC
// If you see this in browser console, the file updated successfully!
console.log("🎮 GAME.JS ULTRA-FIX V2 LOADED - Blur should be GONE");

// Tanmai's Sanctuary - Core Game Engine (FIXED & COMPLETE)
// A production-grade 3D interactive experience

class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.keys = {};
        
        this.gameState = {
            loaded: false,
            started: false,
            paused: false,
            player: {
                position: new THREE.Vector3(0, 1.6, 15),
                rotation: new THREE.Euler(0, 0, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                canMove: false,
                canJump: true
            },
            time: {
                current: new Date(),
                speed: 60,
                paused: false
            },
            plant: {
                health: 85,
                growth: 0.3,
                day: 1,
                lastWatered: null,
                color: '#ff6b8b',
                waterCount: 0
            },
            letters: [],
            memories: [],
            settings: {
                graphics: 'high',
                shadows: true,
                bloom: false,
                masterVolume: 0.7,
                musicVolume: 0.6,
                sfxVolume: 0.8,
                mouseSensitivity: 0.002
            }
        };

        this.systems = {
            physics: null,
            lighting: null,
            weather: null,
            audio: null,
            ui: null,
            interactions: null
        };

        this.assets = {
            models: new Map(),
            textures: new Map(),
            sounds: new Map()
        };

        this.interactiveObjects = [];
        this.particles = [];
        this.lights = [];
        this.animations = [];
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.currentFps = 60;
        
        // Deferred init
        this.init();
    }

    async init() {
        try {
            this.updateLoadingProgress(5, 'Initializing renderer...');
            await this.initRenderer();
            
            this.updateLoadingProgress(10, 'Creating scene...');
            await this.initScene();
            
            this.updateLoadingProgress(15, 'Setting up camera...');
            await this.initCamera();
            
            // NOW we can setup post-processing (scene + camera exist)
            this.updateLoadingProgress(20, 'Post-processing...');
            this.setupPostProcessing();
            
            this.updateLoadingProgress(25, 'Lighting the world...');
            await this.initLighting();
            
            this.updateLoadingProgress(30, 'Physics engine...');
            await this.initPhysics();
            
            this.updateLoadingProgress(35, 'Audio system...');
            await this.initAudio();
            
            this.updateLoadingProgress(40, 'UI systems...');
            await this.initUI();
            await this.initInteractions();
            
            this.updateLoadingProgress(50, 'Loading game data...');
            await this.loadGameData();
            
            this.updateLoadingProgress(60, 'Building the sanctuary...');
            await this.buildWorld();
            
            this.updateLoadingProgress(90, 'Final touches...');
            this.setupEventListeners();
            
            this.updateLoadingProgress(100, 'Welcome to the Sanctuary!');
            this.gameState.loaded = true;
            this.startGameLoop();
            
            console.log('✅ Game Engine initialized successfully');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load: ' + error.message + '. Try refreshing.');
        }
    }

    // ═══════════════════════════════════════
    // RENDERER
    // ═══════════════════════════════════════
    async initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.physicallyCorrectLights = true;
    }

    setupPostProcessing() {
        // Bloom disabled for sharp, clear visuals
        this.composer = null;
        /*
        try {
            this.composer = new THREE.EffectComposer(this.renderer);
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.3, 0.4, 0.9
            );
            this.composer.addPass(this.bloomPass);
        } catch (e) {
            console.warn('Post-processing unavailable:', e);
            this.composer = null;
        }
        */
    }

    // ═══════════════════════════════════════
    // SCENE
    // ═══════════════════════════════════════
        // Simple solid background for debugging
        this.scene.background = new THREE.Color(0x1a1a3e);
        // Fog completely disabled
        // this.scene.fog = new THREE.FogExp2(0x0a0a2e, 0.002);
    }

    // ═══════════════════════════════════════
    // CAMERA
    // ═══════════════════════════════════════
    async initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.1, 500
        );
        this.camera.position.copy(this.gameState.player.position);
        this.scene.add(this.camera);
        
        // Add camera headlight for better visibility
        const cameraLight = new THREE.PointLight(0xffffff, 0.5, 10);
        this.camera.add(cameraLight);
        cameraLight.position.set(0, 0, 0);
    }

    // ═══════════════════════════════════════
    // LIGHTING
    // ═══════════════════════════════════════
    async initLighting() {
        this.systems.lighting = {
            sun: null, moon: null, ambient: null, pointLights: [],
            update: (time) => this.updateLighting(time)
        };

        // Moonlight (default night scene)
        this.systems.lighting.moon = new THREE.DirectionalLight(0x88aaff, 1.5);
        this.systems.lighting.moon.position.set(-30, 40, -20);
        this.systems.lighting.moon.castShadow = true;
        this.systems.lighting.moon.shadow.mapSize.set(2048, 2048);
        this.systems.lighting.moon.shadow.camera.near = 0.5;
        this.systems.lighting.moon.shadow.camera.far = 200;
        this.systems.lighting.moon.shadow.camera.left = -30;
        this.systems.lighting.moon.shadow.camera.right = 30;
        this.systems.lighting.moon.shadow.camera.top = 30;
        this.systems.lighting.moon.shadow.camera.bottom = -30;
        this.scene.add(this.systems.lighting.moon);

        // Warm ambient
        this.systems.lighting.ambient = new THREE.AmbientLight(0x332244, 1.0);
        this.scene.add(this.systems.lighting.ambient);

        // Hemisphere light for overall brightness
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.0);
        this.scene.add(hemiLight);

        // Warm room lights
        const roomLight1 = new THREE.PointLight(0xffe8c8, 5.0, 18, 2);
        roomLight1.position.set(-3, 3.5, -5);
        roomLight1.castShadow = true;
        roomLight1.shadow.mapSize.set(1024, 1024);
        this.scene.add(roomLight1);
        this.systems.lighting.pointLights.push(roomLight1);

        const roomLight2 = new THREE.PointLight(0xffe0b2, 4.0, 15, 2);
        roomLight2.position.set(4, 3.5, -5);
        roomLight2.castShadow = true;
        this.scene.add(roomLight2);
        this.systems.lighting.pointLights.push(roomLight2);

        // Lantern glow
        const lanternLight = new THREE.PointLight(0xffcc66, 1.5, 12, 2);
        lanternLight.position.set(18, 1.5, 2);
        this.scene.add(lanternLight);
        this.systems.lighting.pointLights.push(lanternLight);

        // Soft fill from terrace
        const terraceLight = new THREE.PointLight(0x6688cc, 0.5, 20, 2);
        terraceLight.position.set(12, 2, 0);
        this.scene.add(terraceLight);
    }

    updateLighting(time) {
        // Gentle light flickering for lanterns
        const t = Date.now() * 0.001;
        this.systems.lighting.pointLights.forEach((light, i) => {
            const base = light.userData.baseIntensity || light.intensity;
            if (!light.userData.baseIntensity) light.userData.baseIntensity = light.intensity;
            light.intensity = base + Math.sin(t * 2 + i * 1.5) * 0.15;
        });
    }

    // ═══════════════════════════════════════
    // PHYSICS (simplified - no cannon dependency needed)
    // ═══════════════════════════════════════
    async initPhysics() {
        // Simple physics without cannon.js dependency
        this.systems.physics = {
            gravity: -15,
            playerVelocityY: 0,
            grounded: true,
            update: (delta) => this.updatePhysics(delta)
        };
    }

    updatePhysics(delta) {
        if (!this.gameState.player.canMove) return;
        
        const pos = this.camera.position;
        const phys = this.systems.physics;
        
        // Gravity
        phys.playerVelocityY += phys.gravity * delta;
        pos.y += phys.playerVelocityY * delta;
        
        // Ground collision
        const groundY = 1.6;
        if (pos.y <= groundY) {
            pos.y = groundY;
            phys.playerVelocityY = 0;
            phys.grounded = true;
            this.gameState.player.canJump = true;
        }
        
        // WASD Movement
        const moveSpeed = 5 * delta;
        const moveDir = new THREE.Vector3();
        
        if (this.keys['w'] || this.keys['arrowup']) moveDir.z -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) moveDir.z += 1;
        if (this.keys['a'] || this.keys['arrowleft']) moveDir.x -= 1;
        if (this.keys['d'] || this.keys['arrowright']) moveDir.x += 1;
        
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            // Get camera forward/right vectors (ignore Y)
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0;
            forward.normalize();
            
            const right = new THREE.Vector3();
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
            
            const worldMove = new THREE.Vector3();
            worldMove.addScaledVector(forward, -moveDir.z * moveSpeed);
            worldMove.addScaledVector(right, moveDir.x * moveSpeed);
            
            pos.add(worldMove);
            
            // Room bounds
            pos.x = Math.max(-9, Math.min(19, pos.x));
            pos.z = Math.max(-9, Math.min(6, pos.z));
        }
        
        // Jump
        if (this.keys[' '] && this.gameState.player.canJump && phys.grounded) {
            phys.playerVelocityY = 6;
            phys.grounded = false;
            this.gameState.player.canJump = false;
        }
        
        this.gameState.player.position.copy(pos);
    }

    // ═══════════════════════════════════════
    // AUDIO
    // ═══════════════════════════════════════
    async initAudio() {
        this.systems.audio = {
            context: null,
            musicElement: null,
            musicPlaying: false,
            playSound: (name) => this.playSound(name),
            playMusic: () => this.playMusic(),
            stopMusic: () => this.stopMusic()
        };
        
        // Create audio element for background music
        const audio = document.createElement('audio');
        audio.loop = true;
        audio.volume = 0.4;
        audio.src = 'assets/sounds/Chinuku Take-SenSongsMp3.Co.mp3';
        this.systems.audio.musicElement = audio;
    }

    playSound(name) {
        // Lightweight click/interaction sounds via oscillator
        try {
            if (!this.systems.audio.context) {
                this.systems.audio.context = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this.systems.audio.context;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            gain.gain.value = 0.05 * this.gameState.settings.sfxVolume;
            gain.connect(ctx.destination);
            osc.connect(gain);
            
            switch(name) {
                case 'click':
                    osc.frequency.value = 800;
                    gain.gain.setValueAtTime(0.05, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
                    osc.start(); osc.stop(ctx.currentTime + 0.1);
                    break;
                case 'water':
                    osc.type = 'sine';
                    osc.frequency.value = 400;
                    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
                    gain.gain.setValueAtTime(0.08, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    osc.start(); osc.stop(ctx.currentTime + 0.4);
                    break;
                case 'paper':
                    osc.type = 'sawtooth';
                    osc.frequency.value = 2000;
                    gain.gain.setValueAtTime(0.02, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                    osc.start(); osc.stop(ctx.currentTime + 0.08);
                    break;
                case 'success':
                    osc.frequency.value = 523;
                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                    osc.start(); osc.stop(ctx.currentTime + 0.3);
                    // Second note
                    const osc2 = ctx.createOscillator();
                    const gain2 = ctx.createGain();
                    gain2.gain.value = 0.06;
                    gain2.connect(ctx.destination);
                    osc2.connect(gain2);
                    osc2.frequency.value = 659;
                    gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.15);
                    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
                    osc2.start(ctx.currentTime + 0.15); osc2.stop(ctx.currentTime + 0.45);
                    break;
            }
        } catch(e) {}
    }

    playMusic() {
        const el = this.systems.audio.musicElement;
        if (el && el.src) {
            el.play().catch(() => {});
            this.systems.audio.musicPlaying = true;
        }
    }

    stopMusic() {
        const el = this.systems.audio.musicElement;
        if (el) { el.pause(); this.systems.audio.musicPlaying = false; }
    }

    // ═══════════════════════════════════════
    // UI & INTERACTIONS
    // ═══════════════════════════════════════
    async initUI() {
        this.systems.ui = {
            update: () => this.updateUI(),
            showNotification: (msg, type) => this.showNotification(msg, type),
            showInteractionHint: (text) => this.showInteractionHint(text),
            hideInteractionHint: () => this.hideInteractionHint()
        };
    }

    async initInteractions() {
        this.systems.interactions = {
            raycaster: new THREE.Raycaster(),
            currentObject: null,
            maxDistance: 5,
            update: () => this.updateInteractions()
        };
    }

    // ═══════════════════════════════════════
    // LOAD GAME DATA
    // ═══════════════════════════════════════
    async loadGameData() {
        // Try loading letters.json
        try {
            const resp = await fetch('letters.json');
            if (resp.ok) this.gameState.letters = await resp.json();
            else throw new Error('No file');
        } catch {
            this.gameState.letters = this.getDefaultLetters();
        }

        // Try loading plant-data.json
        try {
            const resp = await fetch('plant-data.json');
            if (resp.ok) {
                const pd = await resp.json();
                Object.assign(this.gameState.plant, pd);
            }
        } catch {}

        // Load saved game
        try {
            const saved = localStorage.getItem('tanmai_sanctuary_save');
            if (saved) this.loadSaveData(JSON.parse(saved));
        } catch {}

        // Calculate plant day
        const startDate = new Date('2025-02-15');
        this.gameState.plant.day = Math.max(1, Math.floor((Date.now() - startDate) / 86400000));
    }

    // ═══════════════════════════════════════
    // BUILD WORLD
    // ═══════════════════════════════════════
    async buildWorld() {
        // Initialize GLTF loader
        this.gltfLoader = new THREE.GLTFLoader();
        
        // Load all GLB models in parallel
        this.updateLoadingProgress(62, 'Loading 3D models...');
        const modelPromises = {
            room: this.loadModel('assets/models/japanese_style_room.glb'),
            bonsai: this.loadModel('assets/models/cc0__youko_sakura_prunus_yoko.glb'),
            tv: this.loadModel('assets/models/old_tv.glb'),
            postbox: this.loadModel('assets/models/british_postbox.glb'),
            lantern: this.loadModel('assets/models/spherical_japanese_paper_lantern.glb'),
            cushion: this.loadModel('assets/models/sweetheart_cushion.glb'),
            table: this.loadModel('assets/models/wizard_table.glb')
        };
        
        // Wait for all models (with fallback if any fail)
        this.loadedModels = {};
        for (const [name, promise] of Object.entries(modelPromises)) {
            try {
                this.loadedModels[name] = await promise;
                console.log(`✅ Loaded: ${name}`);
            } catch (e) {
                console.warn(`⚠️ Failed to load ${name}, using procedural fallback`);
                this.loadedModels[name] = null;
            }
        }
        
        this.updateLoadingProgress(75, 'Building sanctuary...');
        await this.createJapaneseRoom();
        await this.createInteractiveObjects();
        this.createParticleSystems();
        this.createWeatherSystem();
        
        // Start music on first user interaction
        document.addEventListener('click', () => {
            if (!this.systems.audio.musicPlaying) this.playMusic();
        }, { once: true });
    }
    
    loadModel(url) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(url, 
                (gltf) => {
                    // Enable shadows on all meshes
                    gltf.scene.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    resolve(gltf.scene);
                },
                undefined,
                (err) => reject(err)
            );
        });
    }

    async createJapaneseRoom() {
        const room = new THREE.Group();
        room.name = 'JapaneseRoom';

        // Try loading the GLB room model
        if (this.loadedModels.room) {
            const glbRoom = this.loadedModels.room.clone();
            // Auto-fit: find bounding box and scale/position accordingly
            const box = new THREE.Box3().setFromObject(glbRoom);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // Scale to fit ~20 units wide
            const targetSize = 20;
            const scale = targetSize / Math.max(size.x, size.z);
            glbRoom.scale.setScalar(scale);
            
            // Recalculate after scaling
            const scaledBox = new THREE.Box3().setFromObject(glbRoom);
            const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
            
            // Center and put on ground
            glbRoom.position.x -= scaledCenter.x;
            glbRoom.position.z -= scaledCenter.z;
            glbRoom.position.y -= scaledBox.min.y; // floor at y=0
            
            room.add(glbRoom);
            console.log(`🏠 Room model loaded (scale: ${scale.toFixed(2)}, size: ${size.x.toFixed(1)}x${size.y.toFixed(1)}x${size.z.toFixed(1)})`);
        } else {
            // ── PROCEDURAL FALLBACK ──
            this.createProceduralRoom(room);
        }

        // Always add invisible floor for physics/walking
        const invisFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 40),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        invisFloor.rotation.x = -Math.PI / 2;
        invisFloor.position.y = 0;
        room.add(invisFloor);

        // Add furniture (table, cushions, lanterns — with GLB models)
        this.addFurniture(room);
        this.createTerrace(room);
        this.scene.add(room);
    }
    
    createProceduralRoom(room) {
        const floorGeo = new THREE.PlaneGeometry(20, 20, 1, 1);
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512; floorCanvas.height = 512;
        const fCtx = floorCanvas.getContext('2d');
        fCtx.fillStyle = '#5a4a32';
        fCtx.fillRect(0, 0, 512, 512);
        // Tatami grid
        fCtx.strokeStyle = '#4a3a22';
        fCtx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                fCtx.strokeRect(i * 128 + 2, j * 128 + 2, 124, 124);
                // Tatami lines
                fCtx.strokeStyle = 'rgba(74,58,34,0.3)';
                for (let k = 0; k < 10; k++) {
                    fCtx.beginPath();
                    fCtx.moveTo(i * 128 + 4, j * 128 + 4 + k * 12);
                    fCtx.lineTo(i * 128 + 124, j * 128 + 4 + k * 12);
                    fCtx.stroke();
                }
                fCtx.strokeStyle = '#4a3a22';
            }
        }
        // Border strips (gold)
        fCtx.fillStyle = '#8b7355';
        for (let i = 1; i < 4; i++) {
            fCtx.fillRect(i * 128 - 2, 0, 4, 512);
            fCtx.fillRect(0, i * 128 - 2, 512, 4);
        }
        
        const floorTex = new THREE.CanvasTexture(floorCanvas);
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        room.add(floor);

        // ── WALLS ──
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0xf5f0e8, roughness: 0.9, side: THREE.DoubleSide
        });

        // Back wall
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
        backWall.position.set(0, 3, -10);
        backWall.receiveShadow = true;
        room.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.set(-10, 3, 0);
        leftWall.receiveShadow = true;
        room.add(leftWall);

        // Shoji screen grid on walls
        this.addShojiGrid(backWall);
        this.addShojiGrid(leftWall);

        // ── CEILING ──
        const ceilMat = new THREE.MeshStandardMaterial({ color: 0x6b5b45, roughness: 0.8 });
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ceilMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 6;
        ceiling.receiveShadow = true;
        room.add(ceiling);

        // ── WOODEN BEAMS ──
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
        for (let i = -8; i <= 8; i += 4) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 20), beamMat);
            beam.position.set(i, 5.95, 0);
            beam.castShadow = true;
            room.add(beam);
        }
    }

    addShojiGrid(wall) {
        const gridMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7 });
        // Vertical bars
        for (let i = -4; i <= 4; i += 2) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5, 0.04), gridMat);
            bar.position.set(i, 0, 0.02);
            wall.add(bar);
        }
        // Horizontal bars
        for (let j = -2; j <= 2; j += 1.5) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 0.04), gridMat);
            bar.position.set(0, j, 0.02);
            wall.add(bar);
        }
    }

    addFurniture(parent) {
        // ── TABLE (wizard_table.glb) ──
        if (this.loadedModels.table) {
            const table = this.loadedModels.table.clone();
            const box = new THREE.Box3().setFromObject(table);
            const size = box.getSize(new THREE.Vector3());
            const scale = 1.5 / Math.max(size.x, size.z); // fit to ~1.5m
            table.scale.setScalar(scale);
            table.position.set(0, 0, -5);
            // Adjust Y to sit on floor
            const scaledBox = new THREE.Box3().setFromObject(table);
            table.position.y -= scaledBox.min.y;
            parent.add(table);
            console.log('🪑 Table model loaded');
        } else {
            // Procedural kotatsu fallback
            const woodMat = new THREE.MeshStandardMaterial({ color: 0x6d4c2a, roughness: 0.7 });
            const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), woodMat);
            tableTop.position.set(0, 0.45, -5);
            tableTop.castShadow = true;
            parent.add(tableTop);
            for (let x of [-1, 1]) {
                for (let z of [-1, 1]) {
                    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), woodMat);
                    leg.position.set(x * 0.9, 0.22, -5 + z * 0.9);
                    leg.castShadow = true;
                    parent.add(leg);
                }
            }
        }
        
        // ── CUSHIONS (sweetheart_cushion.glb) ──
        const cushionPositions = [[1.2, -4], [-1.2, -4], [1.2, -6], [-1.2, -6]];
        if (this.loadedModels.cushion) {
            cushionPositions.forEach(([x, z]) => {
                const cushion = this.loadedModels.cushion.clone();
                const box = new THREE.Box3().setFromObject(cushion);
                const size = box.getSize(new THREE.Vector3());
                const scale = 0.6 / Math.max(size.x, size.z);
                cushion.scale.setScalar(scale);
                cushion.position.set(x, 0, z);
                const sb = new THREE.Box3().setFromObject(cushion);
                cushion.position.y -= sb.min.y;
                parent.add(cushion);
            });
            console.log('🪑 Cushion models loaded');
        } else {
            const cushionMat = new THREE.MeshStandardMaterial({ color: 0x7b1fa2, roughness: 0.85 });
            cushionPositions.forEach(([x, z]) => {
                const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), cushionMat);
                cushion.position.set(x, 0.04, z);
                cushion.castShadow = true;
                parent.add(cushion);
            });
        }

        // ── TOKONOMA (display alcove) — keep procedural ──
        const platformMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 });
        const platform = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 2), platformMat);
        platform.position.set(-7, 0.075, -8.5);
        platform.castShadow = true;
        parent.add(platform);
        
        const scrollMat = new THREE.MeshStandardMaterial({ color: 0xfff8e1, side: THREE.DoubleSide });
        const scroll = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.5), scrollMat);
        scroll.position.set(-7, 2.5, -9.8);
        parent.add(scroll);
        
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const topRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2, 12), borderMat);
        topRoll.rotation.z = Math.PI / 2;
        topRoll.position.set(-7, 3.8, -9.8);
        parent.add(topRoll);
        const btmRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2, 12), borderMat);
        btmRoll.rotation.z = Math.PI / 2;
        btmRoll.position.set(-7, 1.2, -9.8);
        parent.add(btmRoll);

        // ── IKEBANA ──
        this.createIkebana(parent, -7, 0.2, -8.5);

        // ── PAPER LANTERNS (spherical_japanese_paper_lantern.glb) ──
        this.createPaperLantern(parent, -3, 4.0, -3, 0xff6b8b);
        this.createPaperLantern(parent, 3, 4.0, -7, 0xffcc00);
        this.createPaperLantern(parent, 0, 4.2, -8, 0xff8e53);
    }

    createIkebana(parent, x, y, z) {
        const group = new THREE.Group();
        
        // Vase
        const vaseMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.3, metalness: 0.7 });
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.35, 16), vaseMat);
        vase.castShadow = true;
        group.add(vase);

        // Cherry blossom branches
        const colors = [0xff6b8b, 0xff8e53, 0xffcc00, 0xce93d8];
        for (let i = 0; i < 6; i++) {
            const branch = new THREE.Group();
            
            // Stem
            const stemMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.5 + Math.random() * 0.4, 6), stemMat);
            stem.castShadow = true;
            branch.add(stem);
            
            // Flower
            const flowerColor = colors[Math.floor(Math.random() * colors.length)];
            const flowerMat = new THREE.MeshStandardMaterial({ color: flowerColor, emissive: flowerColor, emissiveIntensity: 0.1 });
            for (let p = 0; p < 5; p++) {
                const petal = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), flowerMat);
                const ang = (p / 5) * Math.PI * 2;
                petal.position.set(Math.cos(ang) * 0.06, 0.3 + Math.random() * 0.1, Math.sin(ang) * 0.06);
                branch.add(petal);
            }
            const center = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6),
                new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 0.2 }));
            center.position.y = 0.32;
            branch.add(center);
            
            branch.position.set((Math.random() - 0.5) * 0.2, 0.17, (Math.random() - 0.5) * 0.2);
            branch.rotation.set((Math.random() - 0.5) * 0.5, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.3);
            group.add(branch);
        }
        
        group.position.set(x, y, z);
        parent.add(group);
    }

    createPaperLantern(parent, x, y, z, color) {
        const group = new THREE.Group();
        
        if (this.loadedModels.lantern) {
            const lantern = this.loadedModels.lantern.clone();
            const box = new THREE.Box3().setFromObject(lantern);
            const size = box.getSize(new THREE.Vector3());
            const scale = 0.7 / Math.max(size.x, size.y, size.z);
            lantern.scale.setScalar(scale);
            // Center it
            const sb = new THREE.Box3().setFromObject(lantern);
            const center = sb.getCenter(new THREE.Vector3());
            lantern.position.sub(center);
            // Tint emissive
            lantern.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material = child.material.clone();
                    child.material.emissive = new THREE.Color(color);
                    child.material.emissiveIntensity = 0.25;
                }
            });
            group.add(lantern);
        } else {
            // Procedural fallback
            const mat = new THREE.MeshStandardMaterial({
                color, emissive: color, emissiveIntensity: 0.3,
                transparent: true, opacity: 0.85
            });
            const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), mat);
            body.scale.y = 1.4;
            body.castShadow = true;
            group.add(body);
            const capMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.08, 12), capMat);
            topCap.position.y = 0.52;
            group.add(topCap);
            const btmCap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.08, 0.08, 12), capMat);
            btmCap.position.y = -0.52;
            group.add(btmCap);
        }
        
        // String
        const string = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.5, 4),
            new THREE.MeshStandardMaterial({ color: 0x333333 }));
        string.position.y = 1.3;
        group.add(string);
        
        // Inner glow light
        const glow = new THREE.PointLight(color, 0.8, 6);
        glow.position.y = 0;
        group.add(glow);
        
        group.position.set(x, y, z);
        
        // Gentle swing animation
        this.animations.push({
            update: (delta) => {
                group.rotation.z = Math.sin(Date.now() * 0.0008 + x) * 0.03;
                group.rotation.x = Math.cos(Date.now() * 0.0006 + z) * 0.02;
            }
        });
        
        parent.add(group);
    }

    createTerrace(parent) {
        const terrace = new THREE.Group();

        // Wooden deck
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x6d5d3b, roughness: 0.85 });
        const deck = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), deckMat);
        deck.rotation.x = -Math.PI / 2;
        deck.position.set(16, 0.01, 0);
        deck.receiveShadow = true;
        terrace.add(deck);

        // Bamboo railing
        const railMat = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.7 });
        for (let i = -5; i <= 5; i += 1.2) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), railMat);
            post.position.set(16 + i, 0.6, 6);
            post.castShadow = true;
            terrace.add(post);
        }
        // Top rail
        const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 11, 8), railMat);
        topRail.rotation.z = Math.PI / 2;
        topRail.position.set(16, 1.2, 6);
        terrace.add(topRail);

        // Stone lantern
        this.createStoneLantern(terrace, 19, 0, 3);

        // Bamboo plants
        this.createBamboo(terrace, 17, 0, 1);
        this.createBamboo(terrace, 17.5, 0, 0.5);
        this.createBamboo(terrace, 16.3, 0, 1.5);

        // Rock garden
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.9 });
        for (let i = 0; i < 8; i++) {
            const size = 0.1 + Math.random() * 0.25;
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), rockMat);
            rock.position.set(14 + Math.random() * 6, size * 0.7, 2 + Math.random() * 3);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            terrace.add(rock);
        }

        parent.add(terrace);
    }

    createStoneLantern(parent, x, y, z) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.85 });
        const group = new THREE.Group();
        
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.15, 8), mat);
        group.add(base);
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 8), mat);
        pillar.position.y = 0.5;
        group.add(pillar);
        const housing = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), mat);
        housing.position.y = 1.1;
        group.add(housing);
        // Window openings (dark insets)
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        for (let i = 0; i < 4; i++) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), windowMat);
            const ang = (i / 4) * Math.PI * 2;
            win.position.set(Math.cos(ang) * 0.31, 1.1, Math.sin(ang) * 0.31);
            win.lookAt(new THREE.Vector3(0, 1.1, 0).add(group.position));
            group.add(win);
        }
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.3, 4), mat);
        roof.position.y = 1.5;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
        
        group.position.set(x, y, z);
        group.castShadow = true;
        parent.add(group);
    }

    createBamboo(parent, x, y, z) {
        const group = new THREE.Group();
        const segH = 0.5;
        const segR = 0.06;
        const count = 5 + Math.floor(Math.random() * 3);
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.7 });
        const jointMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.6 });

        for (let i = 0; i < count; i++) {
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(segR, segR, segH, 8), bambooMat);
            seg.position.y = i * segH + segH / 2;
            seg.castShadow = true;
            group.add(seg);
            if (i < count - 1) {
                const joint = new THREE.Mesh(new THREE.TorusGeometry(segR, 0.015, 8, 12), jointMat);
                joint.position.y = (i + 1) * segH;
                joint.rotation.x = Math.PI / 2;
                group.add(joint);
            }
        }

        // Leaves
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x388e3c, side: THREE.DoubleSide });
        for (let i = 0; i < 5; i++) {
            const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.4), leafMat);
            leaf.position.set((Math.random() - 0.5) * 0.3, count * segH - Math.random() * 0.5, (Math.random() - 0.5) * 0.3);
            leaf.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.3);
            group.add(leaf);
        }

        group.position.set(x, y, z);
        parent.add(group);
    }

    // ═══════════════════════════════════════
    // INTERACTIVE OBJECTS
    // ═══════════════════════════════════════
    async createInteractiveObjects() {
        this.createBonsaiPlant();
        this.createTV();
        this.createPostbox();
        this.createTeaSet();
        this.createZenGarden();
    }

    createBonsaiPlant() {
        const group = new THREE.Group();
        group.name = 'Bonsai';

        if (this.loadedModels.bonsai) {
            const bonsai = this.loadedModels.bonsai.clone();
            const box = new THREE.Box3().setFromObject(bonsai);
            const size = box.getSize(new THREE.Vector3());
            const scale = 1.2 / Math.max(size.x, size.y, size.z);
            bonsai.scale.setScalar(scale);
            const sb = new THREE.Box3().setFromObject(bonsai);
            bonsai.position.y -= sb.min.y;
            const center = sb.getCenter(new THREE.Vector3());
            bonsai.position.x -= center.x;
            bonsai.position.z -= center.z;
            group.add(bonsai);
            console.log('🌸 Sakura bonsai model loaded');
        } else {
            // Procedural fallback
            const potMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.6 });
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.3, 16), potMat);
            pot.castShadow = true;
            group.add(pot);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.8, 8), trunkMat);
            trunk.position.y = 0.55; trunk.rotation.z = 0.1; trunk.castShadow = true;
            group.add(trunk);
            const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), foliageMat);
            foliage.position.y = 1.05; foliage.scale.y = 0.7; foliage.castShadow = true;
            group.add(foliage);
            const flowerMat = new THREE.MeshStandardMaterial({ color: 0xff6b8b, emissive: 0xff6b8b, emissiveIntensity: 0.3 });
            for (let i = 0; i < 8; i++) {
                const flower = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), flowerMat);
                flower.position.set((Math.random()-0.5)*0.4, 0.85+Math.random()*0.25, (Math.random()-0.5)*0.3);
                group.add(flower);
            }
        }

        group.position.set(4, 0.6, -8);
        group.userData = {
            interactive: true, type: 'plant',
            name: 'Bonsai of Love 🌸',
            description: 'Water it daily and watch it grow!'
        };
        
        this.animations.push({
            update: () => {
                group.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
            }
        });

        this.scene.add(group);
        this.interactiveObjects.push(group);
    }

    createTV() {
        const group = new THREE.Group();
        group.name = 'MemoryTV';

        if (this.loadedModels.tv) {
            const tv = this.loadedModels.tv.clone();
            const box = new THREE.Box3().setFromObject(tv);
            const size = box.getSize(new THREE.Vector3());
            const scale = 1.8 / Math.max(size.x, size.y, size.z);
            tv.scale.setScalar(scale);
            const sb = new THREE.Box3().setFromObject(tv);
            tv.position.y -= sb.min.y;
            const center = sb.getCenter(new THREE.Vector3());
            tv.position.x -= center.x;
            tv.position.z -= center.z;
            group.add(tv);
            console.log('📺 TV model loaded');
        } else {
            // Procedural fallback
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.3, metalness: 0.8 });
            const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.1), frameMat);
            frame.castShadow = true;
            group.add(frame);
            const screenMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, emissive: 0x283593, emissiveIntensity: 0.5 });
            const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.3), screenMat);
            screen.position.z = 0.06;
            group.add(screen);
            const stand = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.4),
                new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 }));
            stand.position.y = -1.2; stand.castShadow = true;
            group.add(stand);
        }

        // Screen glow (always add)
        const tvGlow = new THREE.PointLight(0x5c6bc0, 0.5, 5);
        tvGlow.position.set(0, 0.5, 0.5);
        group.add(tvGlow);

        group.position.set(-5, 0.0, -9.0);
        group.userData = {
            interactive: true, type: 'tv',
            name: 'Memory Gallery 📺',
            description: 'View our precious memories'
        };

        this.scene.add(group);
        this.interactiveObjects.push(group);
    }

    createPostbox() {
        const group = new THREE.Group();
        group.name = 'Postbox';

        if (this.loadedModels.postbox) {
            const postbox = this.loadedModels.postbox.clone();
            const box = new THREE.Box3().setFromObject(postbox);
            const size = box.getSize(new THREE.Vector3());
            const scale = 1.4 / Math.max(size.x, size.y, size.z);
            postbox.scale.setScalar(scale);
            const sb = new THREE.Box3().setFromObject(postbox);
            postbox.position.y -= sb.min.y;
            const center = sb.getCenter(new THREE.Vector3());
            postbox.position.x -= center.x;
            postbox.position.z -= center.z;
            group.add(postbox);
            console.log('📮 Postbox model loaded');
        } else {
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.5 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), bodyMat);
            body.castShadow = true;
            group.add(body);
            const topMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.5 });
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.15, 16, 1, false, 0, Math.PI), topMat);
            top.rotation.z = Math.PI / 2; top.rotation.y = Math.PI / 2; top.position.y = 0.45;
            group.add(top);
            const slotMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
            const slot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.05), slotMat);
            slot.position.set(0, 0.2, 0.22);
            group.add(slot);
            const postMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), postMat);
            post.position.y = -0.7; post.castShadow = true;
            group.add(post);
        }

        // Heart glow above postbox
        const heartLight = new THREE.PointLight(0xff6b8b, 0.4, 4);
        heartLight.position.set(0, 1.5, 0);
        group.add(heartLight);

        group.position.set(7, 0.0, -7);
        group.userData = {
            interactive: true, type: 'postbox',
            name: 'Love Letter Box 💌',
            description: 'Read and write letters'
        };

        this.scene.add(group);
        this.interactiveObjects.push(group);
    }

    createTeaSet() {
        const group = new THREE.Group();
        group.name = 'TeaSet';

        // Procedural tea set (no GLB model for this one)
        const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xefebe9, roughness: 0.4 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 });

        // Teapot body
        const potBody = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), ceramicMat);
        potBody.scale.y = 0.75;
        potBody.castShadow = true;
        group.add(potBody);

        // Lid
        const lid = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), ceramicMat);
        lid.position.y = 0.12;
        group.add(lid);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), darkMat);
        knob.position.y = 0.18;
        group.add(knob);

        // Spout
        const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.15, 8), ceramicMat);
        spout.position.set(0.22, 0.05, 0);
        spout.rotation.z = -Math.PI / 4;
        group.add(spout);

        // Handle
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 12, Math.PI), darkMat);
        handle.position.set(-0.2, 0.05, 0);
        handle.rotation.y = Math.PI / 2;
        group.add(handle);

        // Cups
        for (let i = 0; i < 2; i++) {
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12), ceramicMat);
            cup.position.set(i * 0.25 - 0.12, -0.04, 0.25);
            cup.castShadow = true;
            group.add(cup);
        }

        // Tray
        const tray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.5), darkMat);
        tray.position.y = -0.09;
        tray.castShadow = true;
        group.add(tray);

        group.position.set(0, 0.6, -5);
        group.userData = {
            interactive: true, type: 'teaset',
            name: 'Tea Ceremony Set 🍵',
            description: 'Share a warm cup of tea'
        };

        this.scene.add(group);
        this.interactiveObjects.push(group);
    }

    createZenGarden() {
        const group = new THREE.Group();

        // Sand
        const sandMat = new THREE.MeshStandardMaterial({ color: 0xf5e6d3, roughness: 0.95 });
        const sand = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), sandMat);
        sand.rotation.x = -Math.PI / 2;
        sand.position.y = 0.01;
        sand.receiveShadow = true;
        group.add(sand);

        // Raked lines
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xe8d5b7 });
        for (let i = -0.8; i <= 0.8; i += 0.15) {
            const line = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.005, 0.02), lineMat);
            line.position.set(0, 0.015, i);
            group.add(line);
        }

        // Rocks
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.9 });
        [[0, 0.12, 0, 0.12], [-0.5, 0.08, 0.3, 0.08], [0.6, 0.1, -0.2, 0.1]].forEach(([x, s, z, r]) => {
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
            rock.position.set(x, s, z);
            rock.castShadow = true;
            group.add(rock);
        });

        group.position.set(-7, 0, -3);
        group.userData = {
            interactive: true, type: 'zengarden',
            name: 'Zen Garden 🪨',
            description: 'A place for meditation and peace'
        };

        this.scene.add(group);
        this.interactiveObjects.push(group);
    }

    // ═══════════════════════════════════════
    // PARTICLES
    // ═══════════════════════════════════════
    createParticleSystems() {
        this.createCherryBlossomParticles();
        this.createFireflyParticles();
        this.createSteamParticles();
    }

    createCherryBlossomParticles() {
        const count = 300;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 40;
            positions[i3 + 1] = Math.random() * 15;
            positions[i3 + 2] = (Math.random() - 0.5) * 40;
            color.setHSL(0.95 + Math.random() * 0.05, 0.7, 0.75);
            colors[i3] = color.r; colors[i3 + 1] = color.g; colors[i3 + 2] = color.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.15, vertexColors: true, transparent: true, opacity: 0.7,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const system = new THREE.Points(geo, mat);
        this.scene.add(system);

        this.particles.push({
            system, update: (delta) => {
                const pos = system.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    const i3 = i * 3;
                    pos[i3 + 1] -= 0.3 * delta;
                    pos[i3] += Math.sin(Date.now() * 0.001 + i) * 0.003 * delta;
                    pos[i3 + 2] += Math.cos(Date.now() * 0.0008 + i) * 0.003 * delta;
                    if (pos[i3 + 1] < -1) {
                        pos[i3 + 1] = 12 + Math.random() * 5;
                        pos[i3] = (Math.random() - 0.5) * 40;
                    }
                }
                system.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    createFireflyParticles() {
        const count = 60;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = 0.5 + Math.random() * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.12, color: 0xffee58, transparent: true, opacity: 0.8,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const fireflies = new THREE.Points(geo, mat);
        this.scene.add(fireflies);

        this.particles.push({
            system: fireflies, update: (delta) => {
                const pos = fireflies.geometry.attributes.position.array;
                const t = Date.now() * 0.001;
                for (let i = 0; i < count; i++) {
                    const i3 = i * 3;
                    const off = i * 0.1;
                    pos[i3] += Math.sin(t + off) * 0.005;
                    pos[i3 + 1] += Math.cos(t * 0.5 + off) * 0.003;
                    pos[i3 + 2] += Math.sin(t * 0.7 + off) * 0.005;
                }
                fireflies.geometry.attributes.position.needsUpdate = true;
                // Pulse opacity
                mat.opacity = 0.5 + Math.sin(t * 2) * 0.3;
            }
        });
    }

    createSteamParticles() {
        // Small steam rising from tea set
        const count = 30;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.2;
            positions[i * 3 + 1] = Math.random() * 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.06, color: 0xffffff, transparent: true, opacity: 0.3,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const steam = new THREE.Points(geo, mat);
        steam.position.set(0, 0.75, -5); // Above tea set
        this.scene.add(steam);

        this.particles.push({
            system: steam, update: (delta) => {
                const pos = steam.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    pos[i * 3 + 1] += 0.2 * delta;
                    pos[i * 3] += (Math.random() - 0.5) * 0.01;
                    if (pos[i * 3 + 1] > 0.8) {
                        pos[i * 3 + 1] = 0;
                        pos[i * 3] = (Math.random() - 0.5) * 0.2;
                        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
                    }
                }
                steam.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // ═══════════════════════════════════════
    // WEATHER
    // ═══════════════════════════════════════
    createWeatherSystem() {
        this.systems.weather = {
            time: 0, season: 'spring',
            update: (delta) => { this.systems.weather.time += delta; }
        };
    }

    // ═══════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════
    setupEventListeners() {
        const canvas = this.renderer.domElement;

        // Pointer lock
        canvas.addEventListener('click', () => {
            if (this.gameState.started && !document.pointerLockElement) {
                canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                this.gameState.player.canMove = true;
                this.gameState.paused = false;
                document.getElementById('game-hud').classList.remove('hidden');
                document.getElementById('pause-menu').classList.add('hidden');
            } else if (this.gameState.started) {
                this.gameState.player.canMove = false;
                this.gameState.paused = true;
                document.getElementById('pause-menu').classList.remove('hidden');
            }
        });

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('resize', () => this.onWindowResize());

        // UI buttons
        document.getElementById('start-game')?.addEventListener('click', () => this.startGame());
        document.getElementById('load-game')?.addEventListener('click', () => this.startGame());
        document.getElementById('resume-game')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('save-game')?.addEventListener('click', () => this.saveGame());
        document.getElementById('quit-game')?.addEventListener('click', () => this.quitToMenu());
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            document.getElementById('settings-panel')?.classList.toggle('hidden');
        });
        document.getElementById('back-settings')?.addEventListener('click', () => {
            document.getElementById('settings-panel')?.classList.add('hidden');
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Quick actions
        document.getElementById('action-plant')?.addEventListener('click', () => this.waterPlant());
        document.getElementById('action-letter')?.addEventListener('click', () => this.showLetterModal());
        document.getElementById('action-camera')?.addEventListener('click', () => this.takePhoto());
        document.getElementById('action-music')?.addEventListener('click', () => this.toggleMusic());

        // Plant modal buttons
        document.getElementById('water-plant')?.addEventListener('click', () => this.waterPlant());
        document.getElementById('fertilize-plant')?.addEventListener('click', () => {
            this.gameState.plant.growth = Math.min(1, this.gameState.plant.growth + 0.05);
            this.showNotification('Fertilizer added! Growth boosted 🌱', 'success');
            this.playSound('success');
        });

        // Letter sending
        document.getElementById('send-letter')?.addEventListener('click', () => this.sendLetter());
    }

    // ═══════════════════════════════════════
    // GAME LOOP
    // ═══════════════════════════════════════
    startGameLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta
            this.updateFPS(delta);
            if (!this.gameState.paused && this.gameState.started) {
                this.update(delta);
            }
            this.render(delta);
        };
        animate();
    }

    update(delta) {
        this.systems.physics.update(delta);
        this.systems.lighting.update(this.gameState.time);
        this.systems.weather.update(delta);
        this.particles.forEach(p => p.update && p.update(delta));
        this.animations.forEach(a => a.update && a.update(delta));
        this.systems.interactions.update();
        this.updateUI();
    }

    render(delta) {
        if (this.composer && this.gameState.settings.bloom) {
            this.composer.render(delta);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // ═══════════════════════════════════════
    // INTERACTIONS (raycasting)
    // ═══════════════════════════════════════
    updateInteractions() {
        if (!this.gameState.player.canMove) return;

        // Cast ray from center of screen
        this.systems.interactions.raycaster.setFromCamera(
            new THREE.Vector2(0, 0), this.camera
        );

        const intersects = this.systems.interactions.raycaster.intersectObjects(
            this.interactiveObjects, true
        );

        if (intersects.length > 0 && intersects[0].distance < this.systems.interactions.maxDistance) {
            let obj = intersects[0].object;
            while (obj && !obj.userData?.interactive) obj = obj.parent;
            
            if (obj?.userData?.interactive) {
                this.systems.interactions.currentObject = obj;
                this.showInteractionHint(`${obj.userData.name} - ${obj.userData.description}`);
                return;
            }
        }
        
        this.systems.interactions.currentObject = null;
        this.hideInteractionHint();
    }

    handleInteraction(object) {
        if (!object?.userData) return;
        this.playSound('click');

        switch (object.userData.type) {
            case 'plant': this.showPlantModal(); break;
            case 'tv': this.showTVModal(); break;
            case 'postbox': this.showLetterModal(); break;
            case 'teaset':
                this.showNotification('The tea is still warm... 🍵 Enjoy!', 'info');
                break;
            case 'zengarden':
                this.showNotification('The zen garden brings peace to your mind 🧘', 'info');
                break;
        }
    }

    // ═══════════════════════════════════════
    // INPUT HANDLERS
    // ═══════════════════════════════════════
    onKeyDown(event) {
        this.keys[event.key.toLowerCase()] = true;
        
        if (event.key === 'Escape' && document.pointerLockElement) {
            document.exitPointerLock();
        }
        if (event.key === 'e' || event.key === 'E') {
            if (this.systems.interactions.currentObject) {
                this.handleInteraction(this.systems.interactions.currentObject);
            }
        }
    }

    onKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }

    onMouseMove(event) {
        if (!this.gameState.player.canMove || !document.pointerLockElement) return;
        
        const sensitivity = this.gameState.settings.mouseSensitivity;
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y -= (event.movementX || 0) * sensitivity;
        this.camera.rotation.x -= (event.movementY || 0) * sensitivity;
        this.camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.rotation.x));
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    // ═══════════════════════════════════════
    // UI UPDATES
    // ═══════════════════════════════════════
    updateUI() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        const timeEl = document.getElementById('current-time');
        const dateEl = document.getElementById('current-date');
        if (timeEl) timeEl.textContent = time;
        if (dateEl) dateEl.textContent = date;

        const plantDay = document.getElementById('plant-day');
        if (plantDay) plantDay.textContent = this.gameState.plant.day;
        
        const lettersCount = document.getElementById('letters-count');
        if (lettersCount) lettersCount.textContent = this.gameState.letters.length;
        
        const memoriesCount = document.getElementById('memories-count');
        if (memoriesCount) memoriesCount.textContent = this.gameState.memories.length;

        // Plant modal bars
        const healthBar = document.getElementById('plant-health-bar');
        const healthVal = document.getElementById('plant-health');
        if (healthBar) healthBar.style.width = this.gameState.plant.health + '%';
        if (healthVal) healthVal.textContent = this.gameState.plant.health + '%';

        const growthBar = document.getElementById('plant-growth-bar');
        const growthVal = document.getElementById('plant-growth');
        if (growthBar) growthBar.style.width = Math.round(this.gameState.plant.growth * 100) + '%';
        if (growthVal) growthVal.textContent = Math.round(this.gameState.plant.growth * 100) + '%';

        const daysEl = document.getElementById('plant-days');
        if (daysEl) daysEl.textContent = this.gameState.plant.day;
    }

    // ═══════════════════════════════════════
    // GAME ACTIONS
    // ═══════════════════════════════════════
    startGame() {
        document.getElementById('main-menu').classList.add('hidden');
        this.gameState.started = true;
        this.gameState.paused = false;
        document.getElementById('game-canvas').requestPointerLock();
        this.playSound('success');
    }

    resumeGame() {
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-canvas').requestPointerLock();
        this.gameState.paused = false;
    }

    quitToMenu() {
        document.exitPointerLock();
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-hud').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        this.gameState.started = false;
        this.gameState.paused = true;
    }

    waterPlant() {
        this.gameState.plant.health = Math.min(100, this.gameState.plant.health + 15);
        this.gameState.plant.growth = Math.min(1, this.gameState.plant.growth + 0.05);
        this.gameState.plant.waterCount = (this.gameState.plant.waterCount || 0) + 1;
        this.gameState.plant.lastWatered = new Date().toISOString();
        this.playSound('water');
        this.showNotification('Plant watered! 💧 It looks happier now.', 'success');
        this.saveGame();
    }

    takePhoto() {
        const image = this.renderer.domElement.toDataURL('image/png');
        this.gameState.memories.push({
            id: Date.now(), image, date: new Date().toISOString(), location: 'Sanctuary'
        });
        this.playSound('click');
        this.showNotification('📸 Photo captured! Added to memories.', 'success');
    }

    toggleMusic() {
        if (this.systems.audio.musicPlaying) {
            this.stopMusic();
            this.showNotification('Music paused 🔇', 'info');
        } else {
            this.playMusic();
            this.showNotification('Music playing 🎵', 'info');
        }
    }

    sendLetter() {
        const textarea = document.getElementById('new-letter-content');
        if (!textarea || !textarea.value.trim()) {
            this.showNotification('Write something first! ✍️', 'warning');
            return;
        }
        this.gameState.letters.push({
            id: Date.now(),
            date: new Date().toISOString(),
            title: 'A New Letter ❤️',
            content: textarea.value.trim(),
            read: true
        });
        textarea.value = '';
        this.playSound('paper');
        this.showNotification('Letter sent! 💌', 'success');
        this.loadLetters();
        this.saveGame();
    }

    // ═══════════════════════════════════════
    // MODALS
    // ═══════════════════════════════════════
    showPlantModal() {
        document.getElementById('plant-modal').classList.add('active');
    }

    showTVModal() {
        document.getElementById('tv-modal').classList.add('active');
        this.loadGallery();
    }

    showLetterModal() {
        document.getElementById('letter-modal').classList.add('active');
        this.loadLetters();
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }

    loadLetters() {
        const container = document.getElementById('letters-container');
        if (!container) return;
        container.innerHTML = '';
        
        this.gameState.letters.forEach(letter => {
            const el = document.createElement('div');
            el.className = 'letter';
            el.innerHTML = `
                <div class="letter-date"><i class="fas fa-calendar"></i> ${new Date(letter.date).toLocaleDateString()}</div>
                <h3>${letter.title}</h3>
                <div class="letter-content">${letter.content}</div>
            `;
            container.appendChild(el);
        });
    }

    loadGallery() {
        const thumbContainer = document.getElementById('gallery-thumbnails');
        const mainImg = document.getElementById('current-memory');
        if (!thumbContainer || !mainImg) return;

        thumbContainer.innerHTML = '';
        
        if (this.gameState.memories.length === 0) {
            mainImg.src = '';
            mainImg.alt = 'No memories yet — take photos with the camera button!';
            thumbContainer.innerHTML = '<p style="color:rgba(255,255,255,0.5);padding:20px;">No memories yet. Take photos with 📷!</p>';
            return;
        }

        mainImg.src = this.gameState.memories[0].image;
        this.gameState.memories.forEach((mem, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail' + (i === 0 ? ' active' : '');
            thumb.innerHTML = `<img src="${mem.image}" alt="Memory ${i + 1}">`;
            thumb.addEventListener('click', () => {
                mainImg.src = mem.image;
                thumbContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
            thumbContainer.appendChild(thumb);
        });
    }

    // ═══════════════════════════════════════
    // NOTIFICATIONS & HINTS
    // ═══════════════════════════════════════
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const icons = { success: 'check-circle', warning: 'exclamation-triangle', info: 'info-circle' };
        const el = document.createElement('div');
        el.className = `notification ${type}`;
        el.innerHTML = `<div class="notification-content">
            <div class="notification-icon"><i class="fas fa-${icons[type] || 'bell'}"></i></div>
            <div class="notification-text">${message}</div>
        </div>`;
        container.appendChild(el);

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(100%)';
            setTimeout(() => el.remove(), 300);
        }, 4000);
    }

    showInteractionHint(text) {
        const hint = document.getElementById('interaction-hint');
        const hintText = hint?.querySelector('.hint-text');
        if (hint && hintText) {
            hintText.textContent = text;
            hint.classList.add('visible');
        }
    }

    hideInteractionHint() {
        const hint = document.getElementById('interaction-hint');
        if (hint) hint.classList.remove('visible');
    }

    // ═══════════════════════════════════════
    // SAVE / LOAD
    // ═══════════════════════════════════════
    saveGame() {
        try {
            const data = {
                plant: this.gameState.plant,
                letters: this.gameState.letters,
                memories: [], // Don't save images (too large for localStorage)
                settings: this.gameState.settings,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('tanmai_sanctuary_save', JSON.stringify(data));
            this.showNotification('Game saved! 💾', 'success');
        } catch (e) {
            console.warn('Save failed:', e);
        }
    }

    loadSaveData(saveData) {
        if (saveData.plant) Object.assign(this.gameState.plant, saveData.plant);
        if (saveData.letters) this.gameState.letters = saveData.letters;
        if (saveData.settings) Object.assign(this.gameState.settings, saveData.settings);
    }

    getDefaultLetters() {
        return [
            {
                id: 1, date: new Date().toISOString(),
                title: "Welcome to Our Sanctuary 🏠",
                content: "My dearest Tanmai, this virtual sanctuary is created just for you. Every element here represents something about our love. The bonsai grows with our care, the TV shows our memories, and this entire world exists because of you."
            },
            {
                id: 2, date: new Date(Date.now() - 7 * 86400000).toISOString(),
                title: "A Week of Love 💛",
                content: "Every day with you is a blessing. I created this digital sanctuary so we can always have a place that's just ours, no matter where we are in the real world."
            },
            {
                id: 3, date: new Date(Date.now() - 30 * 86400000).toISOString(),
                title: "Our First Month 🌸",
                content: "It's been a month since I started building this for you. Just like our love, it grows more beautiful every day. Water the plant, write letters, and make this space truly ours."
            },
            {
                id: 4, date: '2024-02-14T09:00:00.000Z',
                title: "Valentine's Day Special ❤️",
                content: "Happy Valentine's Day, my love! Every day with you feels like Valentine's Day. Your love colors my world in ways I never imagined possible. Forever yours, Hemanth ✦"
            }
        ];
    }

    // ═══════════════════════════════════════
    // LOADING UI
    // ═══════════════════════════════════════
    updateLoadingProgress(percent, message) {
        const bar = document.querySelector('.loader-bar');
        const pct = document.querySelector('.loader-percentage');
        const asset = document.querySelector('.loader-asset');
        
        if (bar) bar.style.width = percent + '%';
        if (pct) pct.textContent = Math.round(percent) + '%';
        if (asset) asset.textContent = message;

        if (percent >= 100) {
            setTimeout(() => {
                const ls = document.getElementById('loading-screen');
                if (ls) { ls.style.opacity = '0'; setTimeout(() => ls.style.display = 'none', 500); }
            }, 800);
        }
    }

    updateFPS(delta) {
        this.frameCount++;
        if (Date.now() - this.lastFpsUpdate >= 1000) {
            this.currentFps = Math.round(this.frameCount / (Date.now() - this.lastFpsUpdate) * 1000);
            this.frameCount = 0;
            this.lastFpsUpdate = Date.now();
        }
    }

    showError(message) {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:20px;background:#f44336;color:white;text-align:center;z-index:10000;font-family:sans-serif;';
        div.textContent = message;
        document.body.appendChild(div);
    }
}

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});