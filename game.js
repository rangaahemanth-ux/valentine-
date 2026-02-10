// Tanmai's Sanctuary - Core Game Engine (OPTIMIZED)
// Jarvis Status: Online. Systems nominal.

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
                position: new THREE.Vector3(0, 1.6, 5),
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
            memories: [], // Loaded via IndexedDB
            settings: {
                graphics: 'high',
                shadows: true,
                bloom: true,
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
        
        // Database for large assets (Images)
        this.db = null;

        this.init();
    }

    async init() {
        try {
            await this.initDB(); // Initialize IndexedDB first

            this.updateLoadingProgress(5, 'Initializing renderer...');
            await this.initRenderer();
            
            this.updateLoadingProgress(10, 'Creating scene...');
            await this.initScene();
            
            this.updateLoadingProgress(15, 'Setting up camera...');
            await this.initCamera();
            
            this.updateLoadingProgress(20, 'Post-processing...');
            this.setupPostProcessing(); // Bloom enabled
            
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
            
            console.log('✅ Jarvis: Game Engine initialized.');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Critical Failure: ' + error.message);
        }
    }

    // ═══════════════════════════════════════
    // DATABASE (IndexedDB for Memories)
    // ═══════════════════════════════════════
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("TanmaiSanctuaryDB", 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("memories")) {
                    db.createObjectStore("memories", { keyPath: "id" });
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onerror = (event) => reject("DB Error: " + event.target.errorCode);
        });
    }

    async saveMemoryToDB(memory) {
        if (!this.db) return;
        const transaction = this.db.transaction(["memories"], "readwrite");
        transaction.objectStore("memories").add(memory);
    }

    async loadMemoriesFromDB() {
        if (!this.db) return [];
        return new Promise((resolve) => {
            const transaction = this.db.transaction(["memories"], "readonly");
            const request = transaction.objectStore("memories").getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    }

    // ═══════════════════════════════════════
    // RENDERER & POST-PROCESSING
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
    }

    setupPostProcessing() {
        // ACTIVATED: Bloom for dreamy effect
        try {
            this.composer = new THREE.EffectComposer(this.renderer);
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);
            
            // Subtle bloom params
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.4, 0.4, 0.85
            );
            this.composer.addPass(this.bloomPass);
            console.log('✅ Post-processing active');
        } catch (e) {
            console.warn('Post-processing unavailable:', e);
            this.composer = null;
        }
    }

    // ═══════════════════════════════════════
    // SCENE
    // ═══════════════════════════════════════
    async initScene() {
        this.scene = new THREE.Scene();
        
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 512; skyCanvas.height = 512;
        const ctx = skyCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.3, '#1a1a4e');
        gradient.addColorStop(0.6, '#2d1b4e');
        gradient.addColorStop(1, '#0d0d1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Stars
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 300;
            const r = Math.random() * 1.5;
            ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const skyTex = new THREE.CanvasTexture(skyCanvas);
        skyTex.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = skyTex;
        this.scene.fog = new THREE.FogExp2(0x0a0a2e, 0.015);
    }

    // ═══════════════════════════════════════
    // CAMERA
    // ═══════════════════════════════════════
    async initCamera() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.copy(this.gameState.player.position);
        this.scene.add(this.camera);
        
        const cameraLight = new THREE.PointLight(0xffffff, 0.3, 10);
        this.camera.add(cameraLight);
    }

    // ═══════════════════════════════════════
    // LIGHTING
    // ═══════════════════════════════════════
    async initLighting() {
        this.systems.lighting = {
            sun: null, moon: null, ambient: null, pointLights: [],
            update: (time) => this.updateLighting(time)
        };

        this.systems.lighting.moon = new THREE.DirectionalLight(0x88aaff, 1.5);
        this.systems.lighting.moon.position.set(-30, 40, -20);
        this.systems.lighting.moon.castShadow = true;
        this.systems.lighting.moon.shadow.mapSize.set(2048, 2048);
        this.scene.add(this.systems.lighting.moon);

        this.systems.lighting.ambient = new THREE.AmbientLight(0x332244, 1.0);
        this.scene.add(this.systems.lighting.ambient);

        // Room lights
        const createLight = (x, y, z, color, intensity) => {
            const light = new THREE.PointLight(color, intensity, 18, 2);
            light.position.set(x, y, z);
            light.castShadow = true;
            this.scene.add(light);
            this.systems.lighting.pointLights.push(light);
        };

        createLight(-3, 3.5, -5, 0xffe8c8, 5.0);
        createLight(4, 3.5, -5, 0xffe0b2, 4.0);
        createLight(18, 1.5, 2, 0xffcc66, 1.5); // Lantern
    }

    updateLighting(time) {
        const t = Date.now() * 0.001;
        this.systems.lighting.pointLights.forEach((light, i) => {
            const base = light.userData.baseIntensity || light.intensity;
            if (!light.userData.baseIntensity) light.userData.baseIntensity = light.intensity;
            light.intensity = base + Math.sin(t * 2 + i * 1.5) * 0.15;
        });
    }

    // ═══════════════════════════════════════
    // PHYSICS
    // ═══════════════════════════════════════
    async initPhysics() {
        this.systems.physics = {
            gravity: -20,
            playerVelocityY: 0,
            grounded: true,
            raycaster: new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 2),
            update: (delta) => this.updatePhysics(delta)
        };
    }

    updatePhysics(delta) {
        if (!this.gameState.player.canMove) return;
        
        const pos = this.camera.position;
        const phys = this.systems.physics;
        
        // Dynamic Ground Check
        let groundY = 1.6; // Default floor
        phys.raycaster.ray.origin.copy(pos);
        const hits = phys.raycaster.intersectObjects(this.scene.children, true);
        // Filter for floor/terrain meshes if needed, simpler for now:
        if (hits.length > 0 && hits[0].distance < 2.0) {
            // Found ground below
            groundY = hits[0].point.y + 1.6;
        }

        // Gravity
        phys.playerVelocityY += phys.gravity * delta;
        pos.y += phys.playerVelocityY * delta;
        
        // Ground Collision
        if (pos.y <= groundY) {
            pos.y = groundY;
            phys.playerVelocityY = 0;
            phys.grounded = true;
            this.gameState.player.canJump = true;
        }
        
        // WASD Movement
        const moveSpeed = 6 * delta;
        const moveDir = new THREE.Vector3();
        
        if (this.keys['w'] || this.keys['arrowup']) moveDir.z -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) moveDir.z += 1;
        if (this.keys['a'] || this.keys['arrowleft']) moveDir.x -= 1;
        if (this.keys['d'] || this.keys['arrowright']) moveDir.x += 1;
        
        if (moveDir.length() > 0) {
            moveDir.normalize();
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
            
            // Bounds
            pos.x = Math.max(-9, Math.min(19, pos.x));
            pos.z = Math.max(-9, Math.min(6, pos.z));
        }
        
        if (this.keys[' '] && this.gameState.player.canJump && phys.grounded) {
            phys.playerVelocityY = 7;
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
        
        const audio = document.createElement('audio');
        audio.loop = true;
        audio.volume = 0.4;
        audio.src = 'assets/sounds/Chinuku Take-SenSongsMp3.Co.mp3';
        this.systems.audio.musicElement = audio;
    }

    playSound(name) {
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
            
            // Simplified synth sounds
            const now = ctx.currentTime;
            switch(name) {
                case 'click':
                    osc.frequency.setValueAtTime(800, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(); osc.stop(now + 0.1);
                    break;
                case 'water':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.linearRampToValueAtTime(200, now + 0.3);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    osc.start(); osc.stop(now + 0.4);
                    break;
                case 'success':
                    osc.frequency.setValueAtTime(523, now);
                    osc.frequency.setValueAtTime(659, now + 0.2);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
                    osc.start(); osc.stop(now + 0.5);
                    break;
            }
        } catch(e) {}
    }

    playMusic() {
        const el = this.systems.audio.musicElement;
        if (el && el.src) { el.play().catch(() => {}); this.systems.audio.musicPlaying = true; }
    }

    stopMusic() {
        const el = this.systems.audio.musicElement;
        if (el) { el.pause(); this.systems.audio.musicPlaying = false; }
    }

    // ═══════════════════════════════════════
    // LOAD DATA
    // ═══════════════════════════════════════
    async loadGameData() {
        // Load Letters
        try {
            const resp = await fetch('letters.json');
            if (resp.ok) this.gameState.letters = await resp.json();
            else throw new Error('No file');
        } catch {
            this.gameState.letters = this.getDefaultLetters();
        }

        // Load Memories (IndexedDB)
        this.gameState.memories = await this.loadMemoriesFromDB();

        // Load LocalStorage Save (Settings/Plant)
        try {
            const saved = localStorage.getItem('tanmai_sanctuary_save');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.plant) Object.assign(this.gameState.plant, data.plant);
                if (data.settings) Object.assign(this.gameState.settings, data.settings);
            }
        } catch {}

        // Calc Plant Day
        const startDate = new Date('2025-02-15');
        this.gameState.plant.day = Math.max(1, Math.floor((Date.now() - startDate) / 86400000));
    }

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
    // BUILD WORLD
    // ═══════════════════════════════════════
    async buildWorld() {
        this.gltfLoader = new THREE.GLTFLoader();
        
        // Parallel Loading
        this.updateLoadingProgress(62, 'Loading 3D models...');
        const models = ['room', 'bonsai', 'tv', 'postbox', 'lantern', 'cushion', 'table'];
        const paths = {
            room: 'assets/models/japanese_style_room.glb',
            bonsai: 'assets/models/cc0__youko_sakura_prunus_yoko.glb',
            tv: 'assets/models/old_tv.glb',
            postbox: 'assets/models/british_postbox.glb',
            lantern: 'assets/models/spherical_japanese_paper_lantern.glb',
            cushion: 'assets/models/sweetheart_cushion.glb',
            table: 'assets/models/wizard_table.glb'
        };

        this.loadedModels = {};
        await Promise.all(models.map(async (name) => {
            try {
                this.loadedModels[name] = await this.loadModel(paths[name]);
            } catch (e) {
                console.warn(`Fallback for ${name}`);
                this.loadedModels[name] = null;
            }
        }));
        
        this.updateLoadingProgress(75, 'Building sanctuary...');
        await this.createJapaneseRoom();
        await this.createInteractiveObjects();
        this.createParticleSystems();
        
        // Music start trigger
        document.addEventListener('click', () => {
            if (!this.systems.audio.musicPlaying) this.playMusic();
        }, { once: true });
    }
    
    loadModel(url) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(url, (gltf) => {
                gltf.scene.traverse(c => { if(c.isMesh) { c.castShadow=true; c.receiveShadow=true; }});
                resolve(gltf.scene);
            }, undefined, reject);
        });
    }

    // ═══════════════════════════════════════
    // OBJECT CREATION (Shortened for brevity, logic maintained)
    // ═══════════════════════════════════════
    async createJapaneseRoom() {
        const room = new THREE.Group();
        if (this.loadedModels.room) {
            const glbRoom = this.loadedModels.room.clone();
            const box = new THREE.Box3().setFromObject(glbRoom);
            const scale = 20 / Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
            glbRoom.scale.setScalar(scale);
            glbRoom.position.y = -new THREE.Box3().setFromObject(glbRoom).min.y;
            room.add(glbRoom);
        } else {
            // Procedural Floor
            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(20, 20),
                new THREE.MeshStandardMaterial({ color: 0x5a4a32, roughness: 0.9 })
            );
            floor.rotation.x = -Math.PI / 2;
            floor.receiveShadow = true;
            room.add(floor);
        }
        
        // Invisible Collider
        const collider = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshBasicMaterial({visible:false}));
        collider.rotation.x = -Math.PI/2;
        room.add(collider);

        this.addFurniture(room);
        this.scene.add(room);
    }

    addFurniture(room) {
        // Table
        if (this.loadedModels.table) {
            const t = this.loadedModels.table.clone();
            t.scale.setScalar(1.5); t.position.set(0,0,-5);
            room.add(t);
        }
        
        // Cushions
        const pos = [[1.2, -4], [-1.2, -4]];
        pos.forEach(([x,z]) => {
            if (this.loadedModels.cushion) {
                const c = this.loadedModels.cushion.clone();
                c.scale.setScalar(10); // Adjust scale based on model
                c.position.set(x, 0.1, z);
                room.add(c);
            }
        });

        // Paper Lanterns (Procedural Fallback if needed)
        this.createPaperLantern(room, -3, 4, -3, 0xff6b8b);
        this.createPaperLantern(room, 3, 4, -7, 0xffcc00);
    }

    createPaperLantern(parent, x, y, z, color) {
        const group = new THREE.Group();
        // Simple procedural lantern
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 12),
            new THREE.MeshStandardMaterial({ 
                color, emissive: color, emissiveIntensity: 0.4, 
                transparent: true, opacity: 0.9 
            })
        );
        mesh.scale.y = 1.4;
        group.add(mesh);
        
        const light = new THREE.PointLight(color, 1, 8);
        group.add(light);
        
        group.position.set(x,y,z);
        
        this.animations.push({
            update: () => {
                group.position.y = y + Math.sin(Date.now() * 0.001 + x) * 0.05;
            }
        });
        parent.add(group);
    }

    // ═══════════════════════════════════════
    // INTERACTIVE OBJECTS
    // ═══════════════════════════════════════
    async createInteractiveObjects() {
        this.createProp('Bonsai', this.loadedModels.bonsai, 4, 0.6, -8, 'plant', 'Bonsai of Love 🌸', 'Water it daily!');
        this.createProp('TV', this.loadedModels.tv, -5, 0, -9, 'tv', 'Memory Gallery 📺', 'View our photos');
        this.createProp('Postbox', this.loadedModels.postbox, 7, 0, -7, 'postbox', 'Love Letters 💌', 'Read & Write');
    }

    createProp(name, model, x, y, z, type, uiName, uiDesc) {
        const group = new THREE.Group();
        if (model) {
            const m = model.clone();
            const box = new THREE.Box3().setFromObject(m);
            const scale = 1.5 / Math.max(box.max.y - box.min.y);
            m.scale.setScalar(scale);
            m.position.y -= new THREE.Box3().setFromObject(m).min.y;
            group.add(m);
        } else {
            // Box fallback
            const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({color:0x888888}));
            group.add(box);
        }
        
        group.position.set(x,y,z);
        group.userData = { interactive: true, type, name: uiName, description: uiDesc };
        this.scene.add(group);
        this.interactiveObjects.push(group);
    }

    createParticleSystems() {
        // Simple Fireflies
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(150); // 50 particles * 3
        for(let i=0; i<150; i++) pos[i] = (Math.random()-0.5)*30;
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        
        const mat = new THREE.PointsMaterial({color: 0xffff00, size: 0.15, transparent:true, opacity:0.8});
        const sys = new THREE.Points(geo, mat);
        this.scene.add(sys);
        
        this.particles.push({
            update: () => {
                const arr = sys.geometry.attributes.position.array;
                for(let i=0; i<150; i+=3) {
                    arr[i+1] += Math.sin(Date.now()*0.001 + i)*0.01;
                }
                sys.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // ═══════════════════════════════════════
    // CORE LOOPS
    // ═══════════════════════════════════════
    startGameLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = Math.min(this.clock.getDelta(), 0.1);
            this.updateFPS(delta);
            if (!this.gameState.paused && this.gameState.started) {
                this.update(delta);
            }
            if (this.composer && this.gameState.settings.bloom) this.composer.render();
            else this.renderer.render(this.scene, this.camera);
        };
        animate();
    }

    update(delta) {
        this.frameCount++;
        this.systems.physics.update(delta);
        this.systems.lighting.update(this.gameState.time);
        this.particles.forEach(p => p.update(delta));
        this.animations.forEach(a => a.update(delta));
        
        // Throttled raycasting (every 4 frames)
        if (this.frameCount % 4 === 0) this.systems.interactions.update();
        
        this.updateUI();
    }

    updateInteractions() {
        if (!this.gameState.player.canMove) return;
        this.systems.interactions.raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
        const intersects = this.systems.interactions.raycaster.intersectObjects(this.interactiveObjects, true);
        
        if (intersects.length > 0 && intersects[0].distance < 5) {
            let obj = intersects[0].object;
            while(obj && !obj.userData?.interactive) obj = obj.parent;
            if (obj) {
                this.systems.interactions.currentObject = obj;
                this.showInteractionHint(`${obj.userData.name} - [E]`);
                return;
            }
        }
        this.systems.interactions.currentObject = null;
        this.hideInteractionHint();
    }

    // ═══════════════════════════════════════
    // INPUT & EVENTS
    // ═══════════════════════════════════════
    setupEventListeners() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('click', () => {
            if(this.gameState.started) canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            const locked = document.pointerLockElement === canvas;
            this.gameState.player.canMove = locked;
            this.gameState.paused = !locked;
            document.getElementById('game-hud').classList.toggle('hidden', !locked);
            document.getElementById('pause-menu').classList.toggle('hidden', locked);
        });

        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'e' && this.systems.interactions.currentObject) {
                this.handleInteraction(this.systems.interactions.currentObject);
            }
        });
        document.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
        
        document.addEventListener('mousemove', (e) => {
            if(!this.gameState.player.canMove) return;
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y -= e.movementX * this.gameState.settings.mouseSensitivity;
            this.camera.rotation.x -= e.movementY * this.gameState.settings.mouseSensitivity;
            this.camera.rotation.x = Math.max(-1.5, Math.min(1.5, this.camera.rotation.x));
        });

        // UI Buttons
        document.getElementById('start-game')?.addEventListener('click', () => this.startGame());
        document.getElementById('action-camera')?.addEventListener('click', () => this.takePhoto());
        // Add other UI listeners here as needed...
    }

    handleInteraction(obj) {
        this.playSound('click');
        switch(obj.userData.type) {
            case 'plant': document.getElementById('plant-modal').classList.add('active'); break;
            case 'tv': 
                document.getElementById('tv-modal').classList.add('active'); 
                this.loadGallery(); 
                break;
            case 'postbox': 
                document.getElementById('letter-modal').classList.add('active'); 
                this.loadLetters(); 
                break;
        }
    }

    startGame() {
        document.getElementById('main-menu').classList.add('hidden');
        this.gameState.started = true;
        this.renderer.domElement.requestPointerLock();
    }

    // ═══════════════════════════════════════
    // GAMEPLAY LOGIC
    // ═══════════════════════════════════════
    takePhoto() {
        const image = this.renderer.domElement.toDataURL('image/jpeg', 0.8);
        const memory = { id: Date.now(), image, date: new Date().toISOString() };
        this.gameState.memories.push(memory);
        this.saveMemoryToDB(memory); // Save to IndexedDB
        this.playSound('click');
        this.showNotification('📸 Saved to Memory Gallery!', 'success');
    }

    saveGame() {
        // Only save lightweight JSON to localStorage
        const data = {
            plant: this.gameState.plant,
            letters: this.gameState.letters,
            settings: this.gameState.settings
        };
        localStorage.setItem('tanmai_sanctuary_save', JSON.stringify(data));
        this.showNotification('Progress Saved 💾', 'success');
    }

    // ═══════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════
    updateUI() {
        const plant = this.gameState.plant;
        const elHealth = document.getElementById('plant-health-bar');
        if(elHealth) elHealth.style.width = plant.health + '%';
        
        // Add other UI updates here
    }

    showNotification(msg, type) {
        const container = document.getElementById('notification-container');
        if(!container) return;
        const el = document.createElement('div');
        el.className = `notification ${type}`;
        el.innerText = msg;
        container.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }
    
    showInteractionHint(text) {
        const hint = document.getElementById('interaction-hint');
        if(hint) { hint.innerText = text; hint.classList.add('visible'); }
    }
    
    hideInteractionHint() {
        const hint = document.getElementById('interaction-hint');
        if(hint) hint.classList.remove('visible');
    }

    loadGallery() {
        const container = document.getElementById('gallery-thumbnails');
        const main = document.getElementById('current-memory');
        if(!container || !main) return;
        
        container.innerHTML = '';
        if(this.gameState.memories.length === 0) {
            main.src = '';
            main.alt = 'No photos yet';
            return;
        }
        
        main.src = this.gameState.memories[0].image;
        this.gameState.memories.forEach(mem => {
            const img = document.createElement('img');
            img.src = mem.image;
            img.className = 'thumbnail';
            img.onclick = () => main.src = mem.image;
            container.appendChild(img);
        });
    }

    loadLetters() {
        const container = document.getElementById('letters-container');
        if(!container) return;
        container.innerHTML = this.gameState.letters.map(l => 
            `<div class="letter"><h3>${l.title}</h3><p>${l.content}</p></div>`
        ).join('');
    }

    updateFPS(delta) {
        if(Date.now() - this.lastFpsUpdate > 1000) {
            this.currentFps = Math.round(this.frameCount);
            this.frameCount = 0;
            this.lastFpsUpdate = Date.now();
        }
    }
    
    getDefaultLetters() {
        return [{ title: "Welcome", content: "This is your sanctuary.", date: new Date().toISOString() }];
    }
    
    updateLoadingProgress(pct, msg) {
        const el = document.querySelector('.loader-bar');
        if(el) el.style.width = pct + '%';
        if(pct >= 100) document.getElementById('loading-screen')?.remove();
    }
}

// Auto-start
window.addEventListener('DOMContentLoaded', () => { window.game = new GameEngine(); });