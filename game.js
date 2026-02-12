// ═══════════════════════════════════════════════════════════════════════════
// TAN'S HOME — Pure, Personal, Cinematic
// ═══════════════════════════════════════════════════════════════════════════

class TanHome {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.keys = {};

        // Minimal state – only what matters
        this.state = {
            loaded: false,
            started: false,
            paused: false,
            player: {
                pos: new THREE.Vector3(0, 1.6, 3),
                canMove: false,
                canJump: true,
                zone: 'Main Room'
            },
            plant: {
                health: 85,
                growth: 0.3
            },
            settings: {
                bloom: true,
                bloomIntensity: 1.0,
                mouseSens: 0.002,
                masterVol: 0.7
            }
        };

        this.interactiveObjects = [];
        this.animations = [];
        this.loadedModels = {};
        this.physVelY = 0;
        this.flashlightObj = null;

        this.init();
    }

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    progress(pct, msg) {
        const bar = document.getElementById('load-bar');
        const glow = document.getElementById('load-glow');
        const txt = document.getElementById('load-asset');
        const num = document.getElementById('load-pct');
        if (bar) bar.style.width = pct + '%';
        if (glow) glow.style.right = (100 - pct) + '%';
        if (txt) txt.textContent = msg;
        if (num) num.textContent = Math.round(pct) + '%';
    }

    initLoaderParticles() {
        const container = document.getElementById('loader-particles');
        if (!container) return;
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position:absolute; width:${2 + Math.random() * 3}px; height:${2 + Math.random() * 3}px;
                background:rgba(255,${100 + Math.random() * 155},${100 + Math.random() * 155},${0.1 + Math.random() * 0.3});
                border-radius:50%;
                left:${Math.random() * 100}%; top:${Math.random() * 100}%;
                animation: loaderParticle ${5 + Math.random() * 10}s linear infinite;
                animation-delay: ${-Math.random() * 10}s;
            `;
            container.appendChild(p);
        }
        if (!document.getElementById('loader-particle-style')) {
            const style = document.createElement('style');
            style.id = 'loader-particle-style';
            style.textContent = `
                @keyframes loaderParticle {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(${(Math.random() - 0.5) * 200}px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    async init() {
        try {
            this.initLoaderParticles();
            this.progress(3, 'Awakening...');
            await this.sleep(200);

            this.progress(8, 'Starting renderer...');
            this.initRenderer();
            await this.sleep(100);

            this.progress(15, 'Creating scene...');
            this.initScene();
            this.initCamera();
            await this.sleep(100);

            this.progress(25, 'Lighting...');
            this.initLighting();
            await this.sleep(100);

            this.progress(35, 'Loading 3D models...');
            await this.loadAllModels();

            this.progress(55, 'Building your home...');
            this.buildWorld();
            await this.sleep(200);

            this.progress(70, 'Painting the sky...');
            this.createSpaceSky();
            await this.sleep(200);

            this.progress(85, 'Adding birds & fishes...');
            this.createBirdsAndFishes();
            await this.sleep(100);

            this.progress(95, 'Final touches...');
            this.initFlashlight();
            await this.sleep(100);

            this.progress(100, 'Welcome home, Tan ✦');
            this.setupEvents();
            this.state.loaded = true;

            await this.sleep(800);
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('fade-out');
                setTimeout(() => ls.style.display = 'none', 1200);
            }

            this.gameLoop();
            console.log('✅ Tan\'s Home — Ready');
        } catch (e) {
            console.error('Init failed:', e);
            document.body.innerHTML = `<div style="color:#fff;padding:40px;font-family:sans-serif;text-align:center">
                <h2>Failed to load 😔</h2><p>${e.message}</p>
                <p style="margin-top:20px;opacity:0.5">Try refreshing the page</p></div>`;
        }
    }

    // ===== RENDERER =====
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.physicallyCorrectLights = true;
    }

    initPostProcessing() {
        try {
            this.composer = new THREE.EffectComposer(this.renderer);
            this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.0, 0.4, 0.85
            );
            this.composer.addPass(this.bloomPass);
        } catch (e) {
            console.warn('Post-processing unavailable:', e);
            this.composer = null;
        }
    }

    // ===== SCENE & SPACE SKY =====
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020210);
        this.scene.fog = new THREE.FogExp2(0x020210, 0.007);
    }

    createSpaceSky() {
        // Simplified but beautiful star field
        const count = 2500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 160 + Math.random() * 120;
            pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i*3+1] = r * Math.cos(phi);
            pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.4,
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const stars = new THREE.Points(geo, mat);
        this.scene.add(stars);
        this.animations.push({ update: () => { stars.rotation.y += 0.00002; } });

        // Simple moon
        const moonGeo = new THREE.SphereGeometry(12, 32, 16);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xeeddcc, emissive: 0x332211, emissiveIntensity: 0.2 });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(-40, 50, -120);
        this.scene.add(moon);
    }

    // ===== BIRDS & FISHES IN SPACE =====
    createBirdsAndFishes() {
        const count = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const types = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i*3] = (Math.random() - 0.5) * 300;
            positions[i*3+1] = 50 + Math.random() * 150;
            positions[i*3+2] = (Math.random() - 0.5) * 300;
            types[i] = Math.random() > 0.5 ? 0 : 1; // 0 = bird, 1 = fish
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        // Bird silhouette
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.moveTo(32, 16);
        ctx.lineTo(48, 32);
        ctx.lineTo(32, 48);
        ctx.lineTo(16, 32);
        ctx.closePath();
        ctx.fill();
        // Fish silhouette (different color)
        ctx.fillStyle = 'rgba(100,200,255,0.7)';
        ctx.beginPath();
        ctx.ellipse(48, 32, 12, 6, 0, 0, Math.PI*2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.PointsMaterial({
            map: texture,
            size: 1.2,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);

        this.animations.push({
            update: (d) => {
                const pos = geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    pos[i*3] += Math.sin(Date.now() * 0.0005 + i) * 0.02;
                    pos[i*3+1] += Math.cos(Date.now() * 0.0003 + i) * 0.01;
                    pos[i*3+2] += Math.sin(Date.now() * 0.0007 + i) * 0.02;
                }
                geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // ===== CAMERA =====
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.copy(this.state.player.pos);
    }

    // ===== LIGHTING =====
    initLighting() {
        // Moonlight
        const moonLight = new THREE.DirectionalLight(0x8899cc, 0.5);
        moonLight.position.set(-30, 40, -20);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.set(2048, 2048);
        moonLight.shadow.camera.near = 0.5;
        moonLight.shadow.camera.far = 150;
        moonLight.shadow.camera.left = -25;
        moonLight.shadow.camera.right = 25;
        moonLight.shadow.camera.top = 25;
        moonLight.shadow.camera.bottom = -25;
        this.scene.add(moonLight);

        // Ambient
        this.ambientLight = new THREE.AmbientLight(0x221133, 0.4);
        this.scene.add(this.ambientLight);

        // Warm room lights
        const addLight = (x, y, z, color, intensity, dist) => {
            const l = new THREE.PointLight(color, intensity, dist, 2);
            l.position.set(x, y, z);
            l.castShadow = true;
            l.shadow.mapSize.set(1024, 1024);
            this.scene.add(l);
        };
        addLight(-3, 3.5, -5, 0xffe8c8, 2.5, 18);
        addLight(4, 3.5, -5, 0xffe0b2, 2.0, 15);
    }

    initFlashlight() {
        this.flashlightObj = new THREE.SpotLight(0xfff5e6, 0, 30, Math.PI/6, 0.5, 1.5);
        this.flashlightObj.castShadow = true;
        this.flashlightObj.shadow.mapSize.set(512, 512);
        this.camera.add(this.flashlightObj);
        this.flashlightObj.position.set(0, 0, 0);
        this.flashlightObj.target.position.set(0, 0, -1);
        this.camera.add(this.flashlightObj.target);
        this.scene.add(this.camera);
    }

    toggleFlashlight() {
        this.state.flashlight = !this.state.flashlight;
        if (this.flashlightObj) {
            this.flashlightObj.intensity = this.state.flashlight ? 3 : 0;
        }
        this.notify(this.state.flashlight ? '🔦 Flashlight ON' : '🔦 Flashlight OFF', 'info');
    }

    // ===== MODEL LOADING =====
    async loadAllModels() {
        this.gltfLoader = new THREE.GLTFLoader();
        // Only load the essential models: room and your bonsai
        const manifest = {
            room: 'public/assets/models/japanese_style_room.glb',
            bonsai_real: 'public/assets/models/your_real_bonsai.glb'  // YOU PROVIDE THIS FILE
        };
        let loaded = 0;
        const total = Object.keys(manifest).length;
        for (const [name, url] of Object.entries(manifest)) {
            try {
                this.progress(35 + (loaded / total) * 20, `Loading ${name}...`);
                const gltf = await new Promise((resolve, reject) => {
                    this.gltfLoader.load(url, resolve, undefined, reject);
                });
                gltf.scene.traverse(c => {
                    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
                });
                this.loadedModels[name] = gltf.scene;
                console.log(`✅ ${name}`);
            } catch (e) {
                console.warn(`⚠️ ${name} failed, using fallback`);
                this.loadedModels[name] = null;
            }
            loaded++;
        }
    }

    fitModel(model, targetSize) {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const scale = targetSize / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        const sb = new THREE.Box3().setFromObject(model);
        const center = sb.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= sb.min.y;
        return model;
    }

    // ===== BUILD WORLD =====
    buildWorld() {
        this.buildRoom();
        this.addWallPortrait();
        this.addGiantTV();
        this.addBonsai();
        this.addLadder();
        this.addBirdLetterbox();
    }

    buildRoom() {
        if (this.loadedModels.room) {
            const room = this.loadedModels.room.clone();
            this.fitModel(room, 20);
            this.scene.add(room);
        } else {
            // Simple fallback room
            const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a4a32, roughness: 0.9 });
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
            floor.rotation.x = -Math.PI/2;
            floor.receiveShadow = true;
            this.scene.add(floor);

            const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9, side: THREE.DoubleSide });
            const back = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
            back.position.set(0, 3, -10);
            back.receiveShadow = true;
            this.scene.add(back);
            const left = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
            left.rotation.y = Math.PI/2;
            left.position.set(-10, 3, 0);
            left.receiveShadow = true;
            this.scene.add(left);
            const right = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
            right.rotation.y = -Math.PI/2;
            right.position.set(10, 3, 0);
            right.receiveShadow = true;
            this.scene.add(right);
        }
    }

    // ===== FULL-WALL PORTRAIT =====
    addWallPortrait() {
        // Load her image – replace with your own image URL
        const img = new Image();
        img.src = 'assets/images/her_portrait.jpg'; // YOU PROVIDE
        const texture = new THREE.CanvasTexture(img);
        const geometry = new THREE.PlaneGeometry(8, 6);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            side: THREE.DoubleSide,
            emissive: 0x332211,
            emissiveIntensity: 0.1
        });
        const portrait = new THREE.Mesh(geometry, material);
        portrait.position.set(-5, 3, -9.9); // left wall
        portrait.rotation.y = Math.PI / 2;
        this.scene.add(portrait);
    }

    // ===== GIANT SLIDING TV =====
    addGiantTV() {
        const geometry = new THREE.PlaneGeometry(6, 4);
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            emissive: 0x224466,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(geometry, material);
        screen.position.set(4, 2.5, -9.8); // right wall
        screen.rotation.y = -Math.PI / 2;
        this.scene.add(screen);

        // Slideshow – replace with your own image URLs
        const images = [
            'assets/images/photo1.jpg',
            'assets/images/photo2.jpg',
            'assets/images/photo3.jpg'
        ];
        let idx = 0;
        setInterval(() => {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                texture.needsUpdate = true;
            };
            img.src = images[idx % images.length];
            idx++;
        }, 4000);
    }

    // ===== BONSAI (YOUR 3D MODEL) =====
    addBonsai() {
        if (this.loadedModels.bonsai_real) {
            const model = this.loadedModels.bonsai_real.clone();
            this.fitModel(model, 1.2);
            model.position.set(4, 0.6, -8);
            model.userData = { interactive: true, type: 'plant', name: '🌸 Our Bonsai', desc: 'Water it with love.' };
            this.scene.add(model);
            this.interactiveObjects.push(model);
        } else {
            // Simple fallback if model fails to load
            const group = new THREE.Group();
            const potMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.4, 16), potMat);
            pot.position.y = 0.2;
            group.add(pot);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8), trunkMat);
            trunk.position.y = 0.6;
            group.add(trunk);
            const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
            const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), foliageMat);
            foliage.position.y = 1.1;
            group.add(foliage);
            group.position.set(4, 0.6, -8);
            group.userData = { interactive: true, type: 'plant', name: '🌸 Our Bonsai', desc: 'Water it with love.' };
            this.scene.add(group);
            this.interactiveObjects.push(group);
        }
    }

    // ===== LADDER =====
    addLadder() {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
        // Rails
        const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1), woodMat);
        leftRail.position.x = -0.5;
        group.add(leftRail);
        const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3, 0.1), woodMat);
        rightRail.position.x = 0.5;
        group.add(rightRail);
        // Rungs
        for (let i = 0; i < 8; i++) {
            const rung = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.1), woodMat);
            rung.position.y = -1.5 + i * 0.43;
            group.add(rung);
        }
        group.position.set(12, 1.5, -1);
        group.rotation.z = -0.3;
        group.rotation.y = -0.2;
        this.scene.add(group);
    }

    // ===== CARTOON BIRD LETTERBOX (ON ROOF) =====
    createBirdLetterbox() {
        const group = new THREE.Group();
        // Body
        const bodyGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffaa66, roughness: 0.4, emissive: 0x442211, emissiveIntensity: 0.1 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(0.8, 0.6, 0.5);
        group.add(body);
        // Head
        const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffaa66 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0.3, 0.25, 0);
        group.add(head);
        // Beak
        const beakGeo = new THREE.ConeGeometry(0.1, 0.2, 8);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xff8800 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.z = -0.3;
        beak.position.set(0.5, 0.2, 0);
        group.add(beak);
        // Mail slot
        const slotGeo = new THREE.BoxGeometry(0.3, 0.05, 0.1);
        const slotMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.set(0, -0.15, 0.25);
        group.add(slot);
        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(0.35, 0.3, 0.12);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.35, 0.3, -0.12);
        group.add(eyeR);
        return group;
    }

    addBirdLetterbox() {
        const letterbox = this.createBirdLetterbox();
        letterbox.position.set(14, 5.5, 2); // on the roof
        letterbox.rotation.y = -0.2;
        letterbox.userData = {
            interactive: true,
            type: 'roofPostbox',
            name: '💌 Your Valentine Letter',
            desc: 'A message from me, waiting for you.'
        };
        this.scene.add(letterbox);
        this.interactiveObjects.push(letterbox);
    }

    // ===== FIREWORKS =====
    fireworks() {
        const count = 120;
        const colors = [0xff0040, 0xffaa00, 0x00ffff, 0xff00ff, 0xffff00];
        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 4, 4),
                new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending })
            );
            particle.position.copy(this.camera.position).add(new THREE.Vector3(
                (Math.random() - 0.5) * 12,
                Math.random() * 6,
                (Math.random() - 0.5) * 12
            ));
            this.scene.add(particle);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            let life = 1.0;
            const anim = {
                update: (d) => {
                    life -= d * 0.5;
                    particle.position.addScaledVector(vel, d * 2);
                    particle.material.opacity = life;
                    if (life <= 0) {
                        this.scene.remove(particle);
                        this.animations = this.animations.filter(a => a !== anim);
                    }
                }
            };
            this.animations.push(anim);
        }
        this.showValentineMessage();
    }

    showValentineMessage() {
        const msg = document.createElement('div');
        msg.textContent = '💖 Happy Valentine\'s Day 💖';
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            color: white;
            text-shadow: 0 0 30px #ff6b8b, 0 0 60px #ffaa00;
            font-family: 'Cormorant Garamond', serif;
            font-weight: 600;
            z-index: 1000;
            animation: fadeOut 3s forwards;
            pointer-events: none;
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }

    // ===== MUSIC PLAYER =====
    initMusicPlayer() {
        this.music = {
            audio: new Audio(),
            tracks: [
                { name: 'Chinuku Take', artist: 'SenSongs', file: 'public/assets/sounds/Chinuku Take-SenSongsMp3.Co.mp3' }
            ],
            current: 0,
            playing: false
        };
        this.music.audio.volume = 0.6;
        this.music.audio.preload = 'auto';

        const $ = id => document.getElementById(id);
        this.mpEl = {
            title: $('mp-title'), artist: $('mp-artist'),
            play: $('mp-play'), prev: $('mp-prev'), next: $('mp-next'),
            elapsed: $('mp-elapsed'), duration: $('mp-duration'),
            fill: $('mp-fill'), thumb: $('mp-thumb'),
            progressBar: $('mp-progress-bar'),
            volume: $('mp-volume'), volIcon: $('mp-vol-icon')
        };

        if (this.music.tracks.length > 0) this.loadTrack(0);

        this.mpEl.play?.addEventListener('click', () => this.togglePlay());
        this.mpEl.prev?.addEventListener('click', () => this.prevTrack());
        this.mpEl.next?.addEventListener('click', () => this.nextTrack());
        this.mpEl.volume?.addEventListener('input', (e) => {
            this.music.audio.volume = e.target.value / 100;
        });
        this.mpEl.progressBar?.addEventListener('click', (e) => {
            const rect = this.mpEl.progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (this.music.audio.duration) this.music.audio.currentTime = pct * this.music.audio.duration;
        });

        this.music.audio.addEventListener('timeupdate', () => this.updateMusicProgress());
        this.music.audio.addEventListener('ended', () => this.nextTrack());
        this.music.audio.addEventListener('loadedmetadata', () => {
            if (this.mpEl.duration) this.mpEl.duration.textContent = this.fmtTime(this.music.audio.duration);
        });
    }

    loadTrack(index) {
        if (index < 0 || index >= this.music.tracks.length) return;
        this.music.current = index;
        const track = this.music.tracks[index];
        this.music.audio.src = track.file;
        if (this.mpEl.title) this.mpEl.title.textContent = track.name;
        if (this.mpEl.artist) this.mpEl.artist.textContent = track.artist;
    }

    togglePlay() {
        if (this.music.playing) {
            this.music.audio.pause();
            this.music.playing = false;
            if (this.mpEl.play) this.mpEl.play.innerHTML = '<i class="fas fa-play"></i>';
            document.querySelector('.music-player')?.classList.remove('playing');
        } else {
            this.music.audio.play().catch(() => {});
            this.music.playing = true;
            if (this.mpEl.play) this.mpEl.play.innerHTML = '<i class="fas fa-pause"></i>';
            document.querySelector('.music-player')?.classList.add('playing');
        }
    }

    nextTrack() {
        const next = (this.music.current + 1) % this.music.tracks.length;
        this.loadTrack(next);
        if (this.music.playing) this.music.audio.play().catch(() => {});
    }

    prevTrack() {
        if (this.music.audio.currentTime > 3) {
            this.music.audio.currentTime = 0;
        } else {
            const prev = (this.music.current - 1 + this.music.tracks.length) % this.music.tracks.length;
            this.loadTrack(prev);
            if (this.music.playing) this.music.audio.play().catch(() => {});
        }
    }

    updateMusicProgress() {
        const a = this.music.audio;
        if (!a.duration) return;
        const pct = (a.currentTime / a.duration) * 100;
        if (this.mpEl.fill) this.mpEl.fill.style.width = pct + '%';
        if (this.mpEl.thumb) this.mpEl.thumb.style.left = pct + '%';
        if (this.mpEl.elapsed) this.mpEl.elapsed.textContent = this.fmtTime(a.currentTime);
    }

    fmtTime(s) {
        if (!s || !isFinite(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // ===== EVENTS =====
    setupEvents() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('click', () => {
            if (this.state.started && !document.pointerLockElement) canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                this.state.player.canMove = true;
                this.state.paused = false;
                document.getElementById('hud')?.classList.remove('hidden');
                document.getElementById('pause-menu')?.classList.add('hidden');
            } else if (this.state.started) {
                this.state.player.canMove = false;
                this.state.paused = true;
                document.getElementById('pause-menu')?.classList.remove('hidden');
            }
        });

        document.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'Escape') {
                if (document.pointerLockElement) document.exitPointerLock();
            }
            if ((e.key === 'e' || e.key === 'E') && this._currentInteractive) {
                this.interact(this._currentInteractive);
            }
            if (e.key === 'f' || e.key === 'F') this.toggleFlashlight();
        });
        document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

        document.addEventListener('mousemove', e => {
            if (!this.state.player.canMove || !document.pointerLockElement) return;
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y -= (e.movementX || 0) * this.state.settings.mouseSens;
            this.camera.rotation.x -= (e.movementY || 0) * this.state.settings.mouseSens;
            this.camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, this.camera.rotation.x));
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
        });

        // Menu buttons
        document.getElementById('btn-start')?.addEventListener('click', () => this.start());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quit());

        // HUD Actions
        document.getElementById('act-water')?.addEventListener('click', () => this.waterPlant());

        // Plant modal
        document.getElementById('btn-water')?.addEventListener('click', () => this.waterPlant());

        // Close modals
        document.querySelectorAll('[data-close]').forEach(b => {
            b.addEventListener('click', () => this.closeModals());
        });
    }

    // ===== GAME ACTIONS =====
    start() {
        document.getElementById('main-menu')?.classList.add('hidden');
        this.state.started = true;
        this.state.paused = false;
        document.getElementById('game-canvas')?.requestPointerLock();
        this.playFx('success');
        this.initMusicPlayer();
    }

    resume() {
        document.getElementById('pause-menu')?.classList.add('hidden');
        document.getElementById('game-canvas')?.requestPointerLock();
    }

    quit() {
        document.exitPointerLock();
        document.getElementById('pause-menu')?.classList.add('hidden');
        document.getElementById('hud')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');
        this.state.started = false;
        this.state.paused = true;
    }

    waterPlant() {
        this.state.plant.health = Math.min(100, this.state.plant.health + 10);
        this.state.plant.growth = Math.min(1, this.state.plant.growth + 0.03);
        this.playFx('water');
        this.notify('💧 The bonsai looks happier!', 'success');
        this.updateHUD();
    }

    // ===== LETTER & FIREWORKS =====
    showSingleLetter() {
        // Update modal content
        const titleEl = document.getElementById('letter-title-display');
        const contentEl = document.getElementById('letter-content-display');
        const dateEl = document.getElementById('letter-date-stamp');
        if (titleEl) titleEl.textContent = 'For You, on Valentine’s Day 💖';
        if (contentEl) contentEl.textContent = 'My dearest Tan, every star in this sky was placed here for you. You are my universe. Happy Valentine’s Day.';
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        this.showModal('modal-letter');
        
        // Add fireworks and message when modal is closed
        const modal = document.getElementById('modal-letter');
        const closeHandler = () => {
            this.fireworks();
            modal.removeEventListener('close', closeHandler);
        };
        modal.addEventListener('close', closeHandler);
    }

    // ===== INTERACTIONS =====
    updateInteractions() {
        if (!this.state.player.canMove) return;
        const rc = new THREE.Raycaster();
        rc.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const hits = rc.intersectObjects(this.interactiveObjects, true);
        const hint = document.getElementById('interact-hint');
        const text = document.getElementById('interact-text');
        const desc = document.getElementById('interact-desc');
        const crosshair = document.getElementById('crosshair');

        if (hits.length > 0 && hits[0].distance < 5) {
            let obj = hits[0].object;
            while (obj && !obj.userData?.interactive) obj = obj.parent;
            if (obj?.userData?.interactive) {
                this._currentInteractive = obj;
                if (text) text.textContent = obj.userData.name;
                if (desc) desc.textContent = obj.userData.desc;
                if (hint) hint.classList.add('visible');
                if (crosshair) crosshair.classList.add('active');
                return;
            }
        }
        this._currentInteractive = null;
        if (hint) hint.classList.remove('visible');
        if (crosshair) crosshair.classList.remove('active');
    }

    interact(obj) {
        if (!obj?.userData) return;
        this.playFx('click');

        switch (obj.userData.type) {
            case 'plant':
                this.showModal('modal-plant');
                break;
            case 'roofPostbox':
                this.showSingleLetter();
                break;
        }
    }

    // ===== UI =====
    updateHUD() {
        const now = new Date();
        const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        set('hud-clock', now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        set('hud-date', now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        set('hud-plant-health', Math.round(this.state.plant.health));

        const healthBar = document.getElementById('bar-health');
        const healthVal = document.getElementById('val-health');
        if (healthBar) healthBar.style.width = this.state.plant.health + '%';
        if (healthVal) healthVal.textContent = Math.round(this.state.plant.health) + '%';
    }

    showModal(id) {
        document.getElementById(id)?.classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => {
            m.classList.remove('active');
            // Dispatch custom close event for letter modal
            const event = new Event('close');
            m.dispatchEvent(event);
        });
    }

    notify(msg, type = 'info') {
        const c = document.getElementById('notifs');
        if (!c) return;
        const icon = { success: 'check-circle', info: 'info-circle', love: 'heart' }[type] || 'info-circle';
        const n = document.createElement('div');
        n.className = `notif ${type}`;
        n.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
        c.appendChild(n);
        setTimeout(() => {
            n.style.opacity = '0';
            n.style.transform = 'translateX(100%)';
            setTimeout(() => n.remove(), 400);
        }, 3000);
    }

    // ===== PHYSICS =====
    updatePhysics(d) {
        if (!this.state.player.canMove) return;
        const pos = this.camera.position;

        // Gravity
        this.physVelY += -15 * d;
        pos.y += this.physVelY * d;
        if (pos.y <= 1.6) { pos.y = 1.6; this.physVelY = 0; this.state.player.canJump = true; }

        // Movement
        const speed = 5 * d;
        const dir = new THREE.Vector3();
        if (this.keys['w'] || this.keys['arrowup']) dir.z -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dir.z += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dir.x -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dir.x += 1;

        if (dir.length() > 0) {
            dir.normalize();
            const fwd = new THREE.Vector3(); this.camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
            const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
            pos.addScaledVector(fwd, -dir.z * speed);
            pos.addScaledVector(right, dir.x * speed);
            pos.x = Math.max(-9, Math.min(22, pos.x));
            pos.z = Math.max(-9, Math.min(7, pos.z));
        }

        // Jump
        if (this.keys[' '] && this.state.player.canJump) {
            this.physVelY = 6;
            this.state.player.canJump = false;
        }

        this.state.player.pos.copy(pos);
    }

    // ===== GAME LOOP =====
    gameLoop() {
        const loop = () => {
            requestAnimationFrame(loop);
            const d = Math.min(this.clock.getDelta(), 0.1);
            if (!this.state.paused && this.state.started) this.update(d);
            this.render(d);
        };
        loop();
    }

    update(d) {
        this.updatePhysics(d);
        this.updateInteractions();
        this.updateHUD();
        this.animations.forEach(a => a.update && a.update(d));
    }

    render(d) {
        if (this.composer && this.state.settings.bloom) this.composer.render(d);
        else this.renderer.render(this.scene, this.camera);
    }

    // ===== SIMPLE SOUND FX =====
    playFx(name) {
        try {
            if (!this._actx) this._actx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._actx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.connect(ctx.destination);
            osc.connect(gain);
            gain.gain.value = 0.04;
            const now = ctx.currentTime;

            switch (name) {
                case 'click':
                    osc.frequency.value = 800;
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(); osc.stop(now + 0.1);
                    break;
                case 'water':
                    osc.type = 'sine';
                    osc.frequency.value = 400;
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    osc.start(); osc.stop(now + 0.5);
                    break;
                case 'success':
                    osc.frequency.value = 523;
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    osc.start(); osc.stop(now + 0.3);
                    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
                    g2.gain.value = 0.05; g2.connect(ctx.destination); o2.connect(g2);
                    o2.frequency.value = 659;
                    g2.gain.setValueAtTime(0.05, now + 0.15);
                    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
                    o2.start(now + 0.15); o2.stop(now + 0.45);
                    break;
            }
        } catch {}
    }
}

// ═══ LAUNCH ═══
window.addEventListener('DOMContentLoaded', () => { window.game = new TanHome(); });