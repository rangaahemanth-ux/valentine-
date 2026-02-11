// ═══════════════════════════════════════════════════════════════
// TANMAI'S SANCTUARY — Complete 3D Game Engine v3
// With stunning space visuals, music player, GLB model loading
// ═══════════════════════════════════════════════════════════════

class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.keys = {};
        this.state = {
            loaded: false, started: false, paused: false,
            player: { pos: new THREE.Vector3(0, 1.6, 3), canMove: false, canJump: true },
            plant: { health: 85, growth: 0.3, day: 1, lastWatered: null, waterCount: 0 },
            letters: [], memories: [],
            settings: { bloom: true, mouseSens: 0.002, masterVol: 0.7 }
        };
        this.interactiveObjects = [];
        this.particles = [];
        this.animations = [];
        this.loadedModels = {};
        this.physVelY = 0;
        this.init();
    }

    // ══════════════════════════════════════════════════════
    // INIT
    // ══════════════════════════════════════════════════════
    async init() {
        try {
            this.progress(5, 'Starting renderer...');
            this.initRenderer();
            this.progress(10, 'Creating universe...');
            this.initScene();
            this.initCamera();
            this.progress(20, 'Post-processing...');
            this.initPostProcessing();
            this.progress(25, 'Lighting...');
            this.initLighting();
            this.progress(30, 'Physics...');
            this.progress(35, 'Loading 3D models...');
            await this.loadAllModels();
            this.progress(60, 'Building sanctuary...');
            this.buildWorld();
            this.progress(75, 'Creating sky...');
            this.createSpaceSky();
            this.progress(85, 'Particle effects...');
            this.createParticles();
            this.progress(90, 'Music system...');
            this.initMusicPlayer();
            this.progress(95, 'Loading letters...');
            await this.loadGameData();
            this.progress(100, 'Welcome home, Tanmai ✦');
            this.setupEvents();
            this.state.loaded = true;
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('fade-out');
                setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 800);
            }, 600);
            this.gameLoop();
            console.log('✅ Sanctuary ready');
        } catch(e) {
            console.error('Init failed:', e);
            document.body.innerHTML = `<div style="color:#fff;padding:40px;font-family:sans-serif"><h2>Failed to load 😔</h2><p>${e.message}</p><p>Try refreshing the page.</p></div>`;
        }
    }

    progress(pct, msg) {
        const bar = document.getElementById('load-bar');
        const txt = document.getElementById('load-asset');
        const num = document.getElementById('load-pct');
        if (bar) bar.style.width = pct + '%';
        if (txt) txt.textContent = msg;
        if (num) num.textContent = Math.round(pct) + '%';
    }

    // ══════════════════════════════════════════════════════
    // RENDERER
    // ══════════════════════════════════════════════════════
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true, alpha: false, powerPreference: 'high-performance'
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
                new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.4, 0.85
            );
            this.composer.addPass(this.bloomPass);
        } catch(e) { this.composer = null; }
    }

    // ══════════════════════════════════════════════════════
    // SCENE + SPACE SKY (stars, shooting stars, planets, nebula)
    // ══════════════════════════════════════════════════════
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020210);
        this.scene.fog = new THREE.FogExp2(0x020210, 0.008);
    }

    createSpaceSky() {
        // ── 2500 STARS ──
        const starCount = 2500;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        const starCol = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        const c = new THREE.Color();
        
        for (let i = 0; i < starCount; i++) {
            // Distribute on a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 150 + Math.random() * 100;
            starPos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
            starPos[i*3 + 1] = r * Math.cos(phi);
            starPos[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta);
            
            // Color variety: white, blue-white, yellow, warm
            const hue = Math.random() < 0.7 ? 0.6 + Math.random() * 0.1 : Math.random() * 0.15;
            const sat = Math.random() * 0.3;
            c.setHSL(hue, sat, 0.8 + Math.random() * 0.2);
            starCol[i*3] = c.r; starCol[i*3+1] = c.g; starCol[i*3+2] = c.b;
            starSizes[i] = 0.3 + Math.random() * 1.5;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
        
        const starMat = new THREE.PointsMaterial({
            size: 0.6, vertexColors: true, transparent: true, opacity: 0.9,
            depthWrite: false, blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        const stars = new THREE.Points(starGeo, starMat);
        this.scene.add(stars);
        
        // Slow rotation
        this.animations.push({ update: (d) => { stars.rotation.y += 0.00003; } });

        // ── TWINKLING (bright star layer) ──
        const twinkleCount = 200;
        const twGeo = new THREE.BufferGeometry();
        const twPos = new Float32Array(twinkleCount * 3);
        for (let i = 0; i < twinkleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 140 + Math.random() * 60;
            twPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
            twPos[i*3+1] = r * Math.cos(phi);
            twPos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
        }
        twGeo.setAttribute('position', new THREE.BufferAttribute(twPos, 3));
        const twMat = new THREE.PointsMaterial({
            size: 1.2, color: 0xffffff, transparent: true, opacity: 0.8,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const twinkles = new THREE.Points(twGeo, twMat);
        this.scene.add(twinkles);
        this.animations.push({
            update: () => { twMat.opacity = 0.4 + Math.sin(Date.now() * 0.002) * 0.4; }
        });

        // ── SHOOTING STARS ──
        this.shootingStars = [];
        for (let i = 0; i < 5; i++) this.createShootingStar();
        
        // ── PLANETS ──
        this.createPlanet(80, 55, -120, 8, 0x4a6fa5, 0x6b8fc5, true);   // Blue gas giant
        this.createPlanet(-100, 40, -80, 5, 0xd4956a, 0xe8b898, false);  // Orange planet
        this.createPlanet(50, 70, 80, 3, 0xc0a0d0, 0xe0c8f0, false);    // Lavender moon
        this.createPlanet(-60, 80, -140, 12, 0x8b5e3c, 0xa67c52, true);  // Saturn-like
        
        // ── MOON (close, detailed) ──
        this.createDetailedMoon();

        // ── NEBULA CLOUDS ──
        this.createNebula(40, 60, -100, 0xff6b8b, 30);
        this.createNebula(-50, 50, -80, 0x7c4dff, 25);
        this.createNebula(0, 80, -130, 0x42a5f5, 35);
        this.createNebula(70, 40, -60, 0xffcc00, 20);
        
        // ── AURORA ──
        this.createAurora();
    }

    createShootingStar() {
        const geo = new THREE.BufferGeometry();
        const pts = [];
        for (let i = 0; i < 20; i++) {
            pts.push(i * 0.5, 0, 0);
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
        
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(geo, mat);
        
        // Random start
        const resetStar = () => {
            line.position.set(
                (Math.random() - 0.5) * 200,
                50 + Math.random() * 80,
                -50 - Math.random() * 100
            );
            line.rotation.z = -Math.PI / 6 + (Math.random() - 0.5) * 0.3;
            line.userData.speed = 60 + Math.random() * 80;
            line.userData.life = 0;
            line.userData.maxLife = 1.5 + Math.random() * 2;
            line.userData.delay = Math.random() * 15; // seconds before appearing
            line.userData.waiting = true;
        };
        
        resetStar();
        this.scene.add(line);
        
        this.animations.push({
            update: (d) => {
                if (line.userData.waiting) {
                    line.userData.delay -= d;
                    if (line.userData.delay <= 0) line.userData.waiting = false;
                    return;
                }
                line.userData.life += d;
                const t = line.userData.life / line.userData.maxLife;
                
                if (t > 1) { resetStar(); return; }
                
                // Fade in/out
                mat.opacity = t < 0.1 ? t * 10 : t > 0.7 ? (1 - t) / 0.3 : 1;
                
                // Move
                line.position.x += line.userData.speed * d * Math.cos(line.rotation.z);
                line.position.y -= line.userData.speed * d * Math.abs(Math.sin(line.rotation.z));
            }
        });
    }

    createPlanet(x, y, z, radius, color1, color2, hasRing) {
        const group = new THREE.Group();
        
        // Planet sphere
        const geo = new THREE.SphereGeometry(radius, 32, 24);
        
        // Procedural texture
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 128);
        grad.addColorStop(0, '#' + new THREE.Color(color1).getHexString());
        grad.addColorStop(0.5, '#' + new THREE.Color(color2).getHexString());
        grad.addColorStop(1, '#' + new THREE.Color(color1).getHexString());
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 128);
        // Add bands
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, i * 16, 256, 10);
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({
            map: tex, roughness: 0.8, emissive: new THREE.Color(color1), emissiveIntensity: 0.05
        });
        const planet = new THREE.Mesh(geo, mat);
        group.add(planet);
        
        // Atmosphere glow
        const glowGeo = new THREE.SphereGeometry(radius * 1.08, 32, 24);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color2, transparent: true, opacity: 0.08,
            side: THREE.BackSide, blending: THREE.AdditiveBlending
        });
        group.add(new THREE.Mesh(glowGeo, glowMat));
        
        // Ring
        if (hasRing) {
            const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 2.0, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: color2, transparent: true, opacity: 0.2,
                side: THREE.DoubleSide, blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.5;
            group.add(ring);
        }
        
        group.position.set(x, y, z);
        this.scene.add(group);
        
        // Slow rotation
        this.animations.push({
            update: (d) => { planet.rotation.y += 0.02 * d; }
        });
    }

    createDetailedMoon() {
        const group = new THREE.Group();
        const radius = 15;
        
        // Moon surface
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#d4d4d8';
        ctx.fillRect(0, 0, 512, 256);
        
        // Craters
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 40; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 256;
            const cr = 3 + Math.random() * 20;
            ctx.fillStyle = `rgba(${100+Math.random()*50},${100+Math.random()*50},${110+Math.random()*50},0.4)`;
            ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(180,180,190,0.3)';
            ctx.stroke();
        }
        
        const moonTex = new THREE.CanvasTexture(canvas);
        const moonMat = new THREE.MeshStandardMaterial({
            map: moonTex, roughness: 0.95,
            emissive: 0xccccdd, emissiveIntensity: 0.08
        });
        const moon = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), moonMat);
        group.add(moon);
        
        // Moon glow
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xaabbdd, transparent: true, opacity: 0.06,
            side: THREE.BackSide, blending: THREE.AdditiveBlending
        });
        group.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.12, 32, 24), glowMat));
        
        // Light from moon
        const moonLight = new THREE.DirectionalLight(0x8899bb, 0.4);
        moonLight.position.set(0, 0, 0);
        group.add(moonLight);
        
        group.position.set(-40, 60, -100);
        this.scene.add(group);
        
        this.animations.push({ update: (d) => { moon.rotation.y += 0.005 * d; } });
    }

    createNebula(x, y, z, color, size) {
        // Sprite-based nebula cloud
        const canvas = document.createElement('canvas');
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        const col = new THREE.Color(color);
        grad.addColorStop(0, `rgba(${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)},0.2)`);
        grad.addColorStop(0.4, `rgba(${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)},0.08)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add noise
        ctx.globalAlpha = 0.05;
        for (let i = 0; i < 300; i++) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(Math.random()*256, Math.random()*256, 1, 1);
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({
            map: tex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.5
        });
        
        // Multiple sprites for depth
        for (let i = 0; i < 3; i++) {
            const sprite = new THREE.Sprite(mat.clone());
            sprite.scale.set(size * (0.8 + i * 0.3), size * (0.8 + i * 0.3), 1);
            sprite.position.set(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                z + (Math.random() - 0.5) * 10
            );
            sprite.material.opacity = 0.15 + Math.random() * 0.15;
            this.scene.add(sprite);
        }
    }

    createAurora() {
        // Northern lights effect using thin transparent planes
        const auroraColors = [0x00ff88, 0x00ccff, 0x8844ff, 0x00ffcc];
        
        for (let i = 0; i < 6; i++) {
            const w = 40 + Math.random() * 30;
            const h = 8 + Math.random() * 8;
            const geo = new THREE.PlaneGeometry(w, h, 32, 1);
            
            // Wave the vertices
            const posAttr = geo.attributes.position;
            for (let j = 0; j < posAttr.count; j++) {
                const x = posAttr.getX(j);
                posAttr.setY(j, posAttr.getY(j) + Math.sin(x * 0.1) * 2);
            }
            
            const color = auroraColors[i % auroraColors.length];
            const mat = new THREE.MeshBasicMaterial({
                color, transparent: true, opacity: 0.04 + Math.random() * 0.03,
                side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const plane = new THREE.Mesh(geo, mat);
            plane.position.set(
                (Math.random() - 0.5) * 60,
                45 + Math.random() * 20,
                -80 - Math.random() * 40
            );
            plane.rotation.x = -0.2;
            this.scene.add(plane);
            
            const offset = Math.random() * 100;
            this.animations.push({
                update: (d) => {
                    mat.opacity = 0.02 + Math.sin(Date.now() * 0.0003 + offset) * 0.025;
                    const p = plane.geometry.attributes.position;
                    for (let j = 0; j < p.count; j++) {
                        const x = p.getX(j);
                        p.setY(j, Math.sin(x * 0.08 + Date.now() * 0.0005 + offset) * 3);
                    }
                    plane.geometry.attributes.position.needsUpdate = true;
                }
            });
        }
    }

    // ══════════════════════════════════════════════════════
    // CAMERA
    // ══════════════════════════════════════════════════════
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.copy(this.state.player.pos);
    }

    // ══════════════════════════════════════════════════════
    // LIGHTING
    // ══════════════════════════════════════════════════════
    initLighting() {
        // Moonlight
        const moon = new THREE.DirectionalLight(0x8899cc, 0.5);
        moon.position.set(-30, 40, -20);
        moon.castShadow = true;
        moon.shadow.mapSize.set(2048, 2048);
        moon.shadow.camera.near = 0.5; moon.shadow.camera.far = 150;
        moon.shadow.camera.left = -25; moon.shadow.camera.right = 25;
        moon.shadow.camera.top = 25; moon.shadow.camera.bottom = -25;
        this.scene.add(moon);

        // Warm ambient
        this.scene.add(new THREE.AmbientLight(0x221133, 0.4));

        // Room warm lights
        this.roomLights = [];
        const addLight = (x, y, z, color, intensity, dist) => {
            const l = new THREE.PointLight(color, intensity, dist, 2);
            l.position.set(x, y, z); l.castShadow = true;
            l.shadow.mapSize.set(1024, 1024);
            this.scene.add(l);
            this.roomLights.push(l);
            return l;
        };
        addLight(-3, 3.5, -5, 0xffe8c8, 2.5, 18);
        addLight(4, 3.5, -5, 0xffe0b2, 2.0, 15);
        addLight(18, 1.5, 2, 0xffcc66, 1.5, 12);  // Lantern
        addLight(12, 2, 0, 0x6688cc, 0.4, 20);     // Terrace fill

        // Flicker
        this.animations.push({
            update: () => {
                const t = Date.now() * 0.001;
                this.roomLights.forEach((l, i) => {
                    if (!l.userData.base) l.userData.base = l.intensity;
                    l.intensity = l.userData.base + Math.sin(t * 2 + i * 1.5) * 0.15;
                });
            }
        });
    }

    // ══════════════════════════════════════════════════════
    // MODEL LOADING
    // ══════════════════════════════════════════════════════
    async loadAllModels() {
        this.gltfLoader = new THREE.GLTFLoader();
        
        const manifest = {
            room:    'assets/models/japanese_style_room.glb',
            bonsai:  'assets/models/cc0__youko_sakura_prunus_yoko.glb',
            tv:      'assets/models/old_tv.glb',
            postbox: 'assets/models/british_postbox.glb',
            lantern: 'assets/models/spherical_japanese_paper_lantern.glb',
            cushion: 'assets/models/sweetheart_cushion.glb',
            table:   'assets/models/wizard_table.glb'
        };

        const total = Object.keys(manifest).length;
        let loaded = 0;

        for (const [name, url] of Object.entries(manifest)) {
            try {
                this.progress(35 + (loaded / total) * 25, `Loading ${name}...`);
                const gltf = await new Promise((resolve, reject) => {
                    this.gltfLoader.load(url,
                        (g) => resolve(g),
                        undefined,
                        (e) => reject(e)
                    );
                });
                // Enable shadows
                gltf.scene.traverse(c => {
                    if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
                });
                this.loadedModels[name] = gltf.scene;
                console.log(`✅ ${name}`);
            } catch(e) {
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
        // Re-center and put on ground
        const sb = new THREE.Box3().setFromObject(model);
        const center = sb.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.z -= center.z;
        model.position.y -= sb.min.y;
        return model;
    }

    // ══════════════════════════════════════════════════════
    // BUILD WORLD
    // ══════════════════════════════════════════════════════
    buildWorld() {
        this.buildRoom();
        this.buildFurniture();
        this.buildTerrace();
        this.buildInteractiveObjects();
    }

    buildRoom() {
        if (this.loadedModels.room) {
            const room = this.loadedModels.room.clone();
            this.fitModel(room, 20);
            this.scene.add(room);
            console.log('🏠 GLB room loaded');
        } else {
            // Procedural room
            const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a4a32, roughness: 0.9 });
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat);
            floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
            this.scene.add(floor);

            const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9, side: THREE.DoubleSide });
            const back = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
            back.position.set(0, 3, -10); back.receiveShadow = true;
            this.scene.add(back);
            const left = new THREE.Mesh(new THREE.PlaneGeometry(20, 6), wallMat);
            left.rotation.y = Math.PI / 2; left.position.set(-10, 3, 0); left.receiveShadow = true;
            this.scene.add(left);

            const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 20),
                new THREE.MeshStandardMaterial({ color: 0x6b5b45 }));
            ceil.rotation.x = Math.PI / 2; ceil.position.y = 6;
            this.scene.add(ceil);

            // Beams
            const bm = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
            for (let i = -8; i <= 8; i += 4) {
                const beam = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 20), bm);
                beam.position.set(i, 5.95, 0); beam.castShadow = true;
                this.scene.add(beam);
            }
        }

        // Invisible floor for walking
        const invFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        invFloor.rotation.x = -Math.PI / 2;
        this.scene.add(invFloor);
    }

    buildFurniture() {
        // Table
        if (this.loadedModels.table) {
            const t = this.loadedModels.table.clone();
            this.fitModel(t, 1.5);
            t.position.set(0, 0, -5);
            const sb = new THREE.Box3().setFromObject(t);
            t.position.y -= sb.min.y;
            this.scene.add(t);
        } else {
            const wm = new THREE.MeshStandardMaterial({ color: 0x6d4c2a, roughness: 0.7 });
            const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 2.4), wm);
            top.position.set(0, 0.45, -5); top.castShadow = true; this.scene.add(top);
            for (let x of [-1,1]) for (let z of [-1,1]) {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), wm);
                leg.position.set(x*0.9, 0.22, -5+z*0.9); leg.castShadow = true; this.scene.add(leg);
            }
        }

        // Cushions
        const cPos = [[1.2,-4],[-1.2,-4],[1.2,-6],[-1.2,-6]];
        if (this.loadedModels.cushion) {
            cPos.forEach(([x,z]) => {
                const c = this.loadedModels.cushion.clone();
                this.fitModel(c, 0.6);
                c.position.set(x, 0, z);
                const sb = new THREE.Box3().setFromObject(c);
                c.position.y -= sb.min.y;
                this.scene.add(c);
            });
        } else {
            const cm = new THREE.MeshStandardMaterial({ color: 0x7b1fa2, roughness: 0.85 });
            cPos.forEach(([x,z]) => {
                const c = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), cm);
                c.position.set(x, 0.04, z); c.castShadow = true; this.scene.add(c);
            });
        }

        // Hanging lanterns (GLB)
        this.addLantern(-3, 4, -3, 0xff6b8b);
        this.addLantern(3, 4, -7, 0xffcc00);
        this.addLantern(0, 4.2, -8, 0xff8e53);

        // Tokonoma + scroll
        const pm = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 });
        const plat = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 2), pm);
        plat.position.set(-7, 0.075, -8.5); plat.castShadow = true; this.scene.add(plat);
        const scroll = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.5),
            new THREE.MeshStandardMaterial({ color: 0xfff8e1, side: THREE.DoubleSide }));
        scroll.position.set(-7, 2.5, -9.8); this.scene.add(scroll);
    }

    addLantern(x, y, z, color) {
        const g = new THREE.Group();
        if (this.loadedModels.lantern) {
            const l = this.loadedModels.lantern.clone();
            this.fitModel(l, 0.7);
            l.traverse(c => {
                if (c.isMesh && c.material) {
                    c.material = c.material.clone();
                    c.material.emissive = new THREE.Color(color);
                    c.material.emissiveIntensity = 0.25;
                }
            });
            g.add(l);
        } else {
            const m = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, transparent: true, opacity: 0.85 });
            const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), m);
            b.scale.y = 1.4; b.castShadow = true; g.add(b);
        }
        // String
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.5, 4),
            new THREE.MeshStandardMaterial({ color: 0x333333 }));
        s.position.y = 1.3; g.add(s);
        // Glow
        const gl = new THREE.PointLight(color, 0.8, 6);
        g.add(gl);
        g.position.set(x, y, z);
        this.scene.add(g);
        this.animations.push({
            update: () => {
                g.rotation.z = Math.sin(Date.now() * 0.0008 + x) * 0.03;
                g.rotation.x = Math.cos(Date.now() * 0.0006 + z) * 0.02;
            }
        });
    }

    buildTerrace() {
        // Wooden deck
        const dm = new THREE.MeshStandardMaterial({ color: 0x6d5d3b, roughness: 0.85 });
        const deck = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), dm);
        deck.rotation.x = -Math.PI / 2; deck.position.set(16, 0.01, 0); deck.receiveShadow = true;
        this.scene.add(deck);

        // Bamboo railing
        const rm = new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 0.7 });
        for (let i = -5; i <= 5; i += 1.2) {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), rm);
            p.position.set(16 + i, 0.6, 6); p.castShadow = true; this.scene.add(p);
        }
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 11, 8), rm);
        tr.rotation.z = Math.PI / 2; tr.position.set(16, 1.2, 6); this.scene.add(tr);

        // Bamboo plants
        for (let i = 0; i < 3; i++) {
            this.addBamboo(17 + i * 0.5, 0, 1 + i * 0.4);
        }

        // Rocks
        const rkm = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.9 });
        for (let i = 0; i < 8; i++) {
            const sz = 0.1 + Math.random() * 0.25;
            const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 0), rkm);
            rk.position.set(14 + Math.random() * 6, sz * 0.7, 2 + Math.random() * 3);
            rk.rotation.set(Math.random(), Math.random(), Math.random());
            rk.castShadow = true; this.scene.add(rk);
        }
    }

    addBamboo(x, y, z) {
        const g = new THREE.Group();
        const bm = new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.7 });
        const count = 5 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), bm);
            seg.position.y = i * 0.5 + 0.25; seg.castShadow = true; g.add(seg);
        }
        const lm = new THREE.MeshStandardMaterial({ color: 0x388e3c, side: THREE.DoubleSide });
        for (let i = 0; i < 5; i++) {
            const lf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.4), lm);
            lf.position.set((Math.random()-0.5)*0.3, count*0.5 - Math.random()*0.5, (Math.random()-0.5)*0.3);
            lf.rotation.set(Math.random()*0.5, Math.random()*Math.PI, Math.random()*0.3);
            g.add(lf);
        }
        g.position.set(x, y, z); this.scene.add(g);
    }

    // ══════════════════════════════════════════════════════
    // INTERACTIVE OBJECTS
    // ══════════════════════════════════════════════════════
    buildInteractiveObjects() {
        this.addBonsai();
        this.addTV();
        this.addPostbox();
        this.addTeaSet();
        this.addZenGarden();
    }

    addBonsai() {
        const g = new THREE.Group(); g.name = 'Bonsai';
        if (this.loadedModels.bonsai) {
            const m = this.loadedModels.bonsai.clone();
            this.fitModel(m, 1.2);
            g.add(m);
        } else {
            // Procedural
            const pm = new THREE.MeshStandardMaterial({ color: 0x795548 });
            g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.25,0.3,16), pm), { castShadow: true }));
            const tm = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.1,0.8,8), tm);
            trunk.position.y = 0.55; trunk.castShadow = true; g.add(trunk);
            const fm = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
            const fol = new THREE.Mesh(new THREE.SphereGeometry(0.25,12,8), fm);
            fol.position.y = 1.05; fol.scale.y = 0.7; g.add(fol);
            const fl = new THREE.MeshStandardMaterial({ color: 0xff6b8b, emissive: 0xff6b8b, emissiveIntensity: 0.3 });
            for (let i = 0; i < 8; i++) {
                const f = new THREE.Mesh(new THREE.SphereGeometry(0.025,6,6), fl);
                f.position.set((Math.random()-0.5)*0.4, 0.85+Math.random()*0.25, (Math.random()-0.5)*0.3);
                g.add(f);
            }
        }
        g.position.set(4, 0.6, -8);
        g.userData = { interactive: true, type: 'plant', name: 'Bonsai of Love 🌸', desc: 'Water it daily and watch it grow!' };
        this.scene.add(g); this.interactiveObjects.push(g);
        this.animations.push({ update: () => { g.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05; } });
    }

    addTV() {
        const g = new THREE.Group(); g.name = 'TV';
        if (this.loadedModels.tv) {
            const m = this.loadedModels.tv.clone();
            this.fitModel(m, 1.8);
            g.add(m);
        } else {
            const fm = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.3, metalness: 0.8 });
            g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.4,1.6,0.1), fm), { castShadow: true }));
            const sm = new THREE.MeshStandardMaterial({ color: 0x1a237e, emissive: 0x283593, emissiveIntensity: 0.5 });
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.3), sm);
            scr.position.z = 0.06; g.add(scr);
        }
        g.add(new THREE.PointLight(0x5c6bc0, 0.5, 5));
        g.position.set(-5, 0, -9);
        g.userData = { interactive: true, type: 'tv', name: 'Memory Gallery 📺', desc: 'View our precious memories' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    addPostbox() {
        const g = new THREE.Group(); g.name = 'Postbox';
        if (this.loadedModels.postbox) {
            const m = this.loadedModels.postbox.clone();
            this.fitModel(m, 1.4);
            g.add(m);
        } else {
            const bm = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.5 });
            g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.4), bm), { castShadow: true }));
        }
        g.add(new THREE.PointLight(0xff6b8b, 0.4, 4));
        g.position.set(7, 0, -7);
        g.userData = { interactive: true, type: 'postbox', name: 'Love Letter Box 💌', desc: 'Read and write letters' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    addTeaSet() {
        const g = new THREE.Group();
        const cm = new THREE.MeshStandardMaterial({ color: 0xefebe9, roughness: 0.4 });
        const pot = new THREE.Mesh(new THREE.SphereGeometry(0.2,16,12), cm);
        pot.scale.y = 0.75; pot.castShadow = true; g.add(pot);
        const lid = new THREE.Mesh(new THREE.SphereGeometry(0.12,12,8,0,Math.PI*2,0,Math.PI/2), cm);
        lid.position.y = 0.12; g.add(lid);
        for (let i = 0; i < 2; i++) {
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.05,0.08,12), cm);
            cup.position.set(i*0.25-0.12, -0.04, 0.25); cup.castShadow = true; g.add(cup);
        }
        g.position.set(0, 0.55, -5);
        g.userData = { interactive: true, type: 'teaset', name: 'Tea Ceremony 🍵', desc: 'Share a warm cup of tea' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    addZenGarden() {
        const g = new THREE.Group();
        const sand = new THREE.Mesh(new THREE.PlaneGeometry(3,2),
            new THREE.MeshStandardMaterial({ color: 0xf5e6d3, roughness: 0.95 }));
        sand.rotation.x = -Math.PI/2; sand.position.y = 0.01; sand.receiveShadow = true; g.add(sand);
        const lm = new THREE.MeshStandardMaterial({ color: 0xe8d5b7 });
        for (let i = -0.8; i <= 0.8; i += 0.15) {
            const l = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.005, 0.02), lm);
            l.position.set(0, 0.015, i); g.add(l);
        }
        const rm = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.9 });
        [[0,0.12,0],[-.5,.08,.3],[.6,.1,-.2]].forEach(([x,s,z]) => {
            const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s,0), rm);
            r.position.set(x,s,z); r.castShadow = true; g.add(r);
        });
        g.position.set(-7, 0, -3);
        g.userData = { interactive: true, type: 'zen', name: 'Zen Garden 🪨', desc: 'A place for meditation and peace' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    // ══════════════════════════════════════════════════════
    // PARTICLES
    // ══════════════════════════════════════════════════════
    createParticles() {
        // Cherry blossoms
        const blossomCount = 400;
        const bGeo = new THREE.BufferGeometry();
        const bPos = new Float32Array(blossomCount * 3);
        const bCol = new Float32Array(blossomCount * 3);
        const col = new THREE.Color();
        for (let i = 0; i < blossomCount; i++) {
            bPos[i*3] = (Math.random()-0.5)*40;
            bPos[i*3+1] = Math.random()*15;
            bPos[i*3+2] = (Math.random()-0.5)*40;
            col.setHSL(0.95+Math.random()*0.05, 0.7, 0.75);
            bCol[i*3]=col.r; bCol[i*3+1]=col.g; bCol[i*3+2]=col.b;
        }
        bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
        bGeo.setAttribute('color', new THREE.BufferAttribute(bCol, 3));
        const bMat = new THREE.PointsMaterial({ size:0.15, vertexColors:true, transparent:true, opacity:0.7, depthWrite:false, blending:THREE.AdditiveBlending });
        const blossoms = new THREE.Points(bGeo, bMat);
        this.scene.add(blossoms);
        this.animations.push({
            update: (d) => {
                const p = blossoms.geometry.attributes.position.array;
                for (let i = 0; i < blossomCount; i++) {
                    p[i*3+1] -= 0.3*d;
                    p[i*3] += Math.sin(Date.now()*0.001+i)*0.003;
                    p[i*3+2] += Math.cos(Date.now()*0.0008+i)*0.003;
                    if (p[i*3+1] < -1) { p[i*3+1] = 12+Math.random()*5; p[i*3] = (Math.random()-0.5)*40; }
                }
                blossoms.geometry.attributes.position.needsUpdate = true;
            }
        });

        // Fireflies
        const ffCount = 80;
        const fGeo = new THREE.BufferGeometry();
        const fPos = new Float32Array(ffCount * 3);
        for (let i = 0; i < ffCount; i++) {
            fPos[i*3] = (Math.random()-0.5)*30;
            fPos[i*3+1] = 0.5+Math.random()*4;
            fPos[i*3+2] = (Math.random()-0.5)*30;
        }
        fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
        const fMat = new THREE.PointsMaterial({ size:0.12, color:0xffee58, transparent:true, opacity:0.8, depthWrite:false, blending:THREE.AdditiveBlending });
        const fireflies = new THREE.Points(fGeo, fMat);
        this.scene.add(fireflies);
        this.animations.push({
            update: () => {
                const p = fireflies.geometry.attributes.position.array;
                const t = Date.now()*0.001;
                for (let i = 0; i < ffCount; i++) {
                    p[i*3] += Math.sin(t+i*0.1)*0.005;
                    p[i*3+1] += Math.cos(t*0.5+i*0.1)*0.003;
                    p[i*3+2] += Math.sin(t*0.7+i*0.1)*0.005;
                }
                fireflies.geometry.attributes.position.needsUpdate = true;
                fMat.opacity = 0.5 + Math.sin(t*2)*0.3;
            }
        });

        // Steam above tea
        const sCount = 30;
        const sGeo = new THREE.BufferGeometry();
        const sPos = new Float32Array(sCount * 3);
        for (let i = 0; i < sCount; i++) {
            sPos[i*3] = (Math.random()-0.5)*0.2;
            sPos[i*3+1] = Math.random()*0.5;
            sPos[i*3+2] = (Math.random()-0.5)*0.2;
        }
        sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
        const sMat = new THREE.PointsMaterial({ size:0.06, color:0xffffff, transparent:true, opacity:0.3, depthWrite:false, blending:THREE.AdditiveBlending });
        const steam = new THREE.Points(sGeo, sMat);
        steam.position.set(0, 0.7, -5);
        this.scene.add(steam);
        this.animations.push({
            update: (d) => {
                const p = steam.geometry.attributes.position.array;
                for (let i = 0; i < sCount; i++) {
                    p[i*3+1] += 0.2*d;
                    if (p[i*3+1] > 0.8) { p[i*3+1] = 0; p[i*3] = (Math.random()-0.5)*0.2; p[i*3+2] = (Math.random()-0.5)*0.2; }
                }
                steam.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // ══════════════════════════════════════════════════════
    // MUSIC PLAYER
    // ══════════════════════════════════════════════════════
    initMusicPlayer() {
        this.music = {
            audio: new Audio(),
            tracks: [
                { name: 'Chinuku Take', artist: 'SenSongs', file: 'assets/sounds/Chinuku Take-SenSongsMp3.Co.mp3' }
            ],
            current: 0,
            playing: false,
            shuffle: false,
            repeat: false
        };

        this.music.audio.volume = 0.6;
        this.music.audio.preload = 'auto';

        // UI elements
        const $ = id => document.getElementById(id);
        this.mpEl = {
            title: $('mp-title'), artist: $('mp-artist'),
            play: $('mp-play'), prev: $('mp-prev'), next: $('mp-next'),
            elapsed: $('mp-elapsed'), duration: $('mp-duration'),
            fill: $('mp-fill'), thumb: $('mp-thumb'),
            progressBar: $('mp-progress-bar'),
            volume: $('mp-volume'), volIcon: $('mp-vol-icon'),
            shuffle: $('mp-shuffle'), repeat: $('mp-repeat'),
            listToggle: $('mp-list-toggle'), tracklist: $('mp-tracklist'),
            tracks: $('mp-tracks')
        };

        // Load first track
        if (this.music.tracks.length > 0) {
            this.loadTrack(0);
        }

        // Build track list
        this.renderTrackList();

        // Events
        this.mpEl.play.addEventListener('click', () => this.togglePlay());
        this.mpEl.prev.addEventListener('click', () => this.prevTrack());
        this.mpEl.next.addEventListener('click', () => this.nextTrack());
        this.mpEl.volume.addEventListener('input', (e) => {
            this.music.audio.volume = e.target.value / 100;
        });
        this.mpEl.shuffle.addEventListener('click', () => {
            this.music.shuffle = !this.music.shuffle;
            this.mpEl.shuffle.classList.toggle('active', this.music.shuffle);
        });
        this.mpEl.repeat.addEventListener('click', () => {
            this.music.repeat = !this.music.repeat;
            this.mpEl.repeat.classList.toggle('active', this.music.repeat);
        });
        this.mpEl.listToggle.addEventListener('click', () => {
            this.mpEl.tracklist.classList.toggle('hidden');
        });

        // Progress bar click
        this.mpEl.progressBar.addEventListener('click', (e) => {
            const rect = this.mpEl.progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (this.music.audio.duration) {
                this.music.audio.currentTime = pct * this.music.audio.duration;
            }
        });

        // Audio events
        this.music.audio.addEventListener('timeupdate', () => this.updateMusicProgress());
        this.music.audio.addEventListener('ended', () => {
            if (this.music.repeat) { this.music.audio.currentTime = 0; this.music.audio.play(); }
            else this.nextTrack();
        });
        this.music.audio.addEventListener('loadedmetadata', () => {
            this.mpEl.duration.textContent = this.fmtTime(this.music.audio.duration);
        });
    }

    loadTrack(index) {
        if (index < 0 || index >= this.music.tracks.length) return;
        this.music.current = index;
        const track = this.music.tracks[index];
        this.music.audio.src = track.file;
        this.mpEl.title.textContent = track.name;
        this.mpEl.artist.textContent = track.artist;
        this.renderTrackList();
    }

    togglePlay() {
        if (this.music.playing) {
            this.music.audio.pause();
            this.music.playing = false;
            this.mpEl.play.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.music.audio.play().catch(() => {});
            this.music.playing = true;
            this.mpEl.play.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }

    nextTrack() {
        let next;
        if (this.music.shuffle) {
            next = Math.floor(Math.random() * this.music.tracks.length);
        } else {
            next = (this.music.current + 1) % this.music.tracks.length;
        }
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
        this.mpEl.fill.style.width = pct + '%';
        this.mpEl.thumb.style.left = pct + '%';
        this.mpEl.elapsed.textContent = this.fmtTime(a.currentTime);
    }

    fmtTime(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    renderTrackList() {
        this.mpEl.tracks.innerHTML = '';
        this.music.tracks.forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'mp-track' + (i === this.music.current ? ' playing' : '');
            div.innerHTML = `<span class="mp-track-num">${i+1}</span><span class="mp-track-name">${t.name}</span><span class="mp-track-dur">${t.artist}</span>`;
            div.addEventListener('click', () => {
                this.loadTrack(i);
                this.music.audio.play().catch(() => {});
                this.music.playing = true;
                this.mpEl.play.innerHTML = '<i class="fas fa-pause"></i>';
            });
            this.mpEl.tracks.appendChild(div);
        });
    }

    // ══════════════════════════════════════════════════════
    // GAME DATA
    // ══════════════════════════════════════════════════════
    async loadGameData() {
        try {
            const r = await fetch('letters.json');
            if (r.ok) this.state.letters = await r.json();
            else throw 0;
        } catch { this.state.letters = this.defaultLetters(); }

        try {
            const r = await fetch('plant-data.json');
            if (r.ok) Object.assign(this.state.plant, await r.json());
        } catch {}

        try {
            const s = localStorage.getItem('tanmai_save');
            if (s) { const d = JSON.parse(s); Object.assign(this.state.plant, d.plant||{}); if (d.letters) this.state.letters = d.letters; }
        } catch {}

        const start = new Date('2025-02-15');
        this.state.plant.day = Math.max(1, Math.floor((Date.now() - start) / 86400000));
    }

    defaultLetters() {
        return [
            { id:1, date:'2025-02-15T10:30:00Z', title:'Welcome to Our Sanctuary 🏠', content:'My dearest Tanmai, this virtual sanctuary is created just for you. Every element here represents something about our love. The bonsai grows with our care, the TV shows our memories, and this entire world exists because of you.' },
            { id:2, date:'2025-02-14T09:00:00Z', title:"Valentine's Day Special ❤️", content:"Happy Valentine's Day, my love! Every day with you feels like Valentine's Day. Your love colors my world in ways I never imagined possible. Forever yours." },
            { id:3, date:'2025-02-01T20:15:00Z', title:'Just Because 💛', content:'My beautiful Tanmai, I created this virtual sanctuary for you because you deserve a peaceful place all your own. A place where the stars shine just for you, where flowers bloom in every color, and where our memories play like a beautiful movie.' },
            { id:4, date:'2025-01-20T14:45:00Z', title:'Our Adventures Together 🌸', content:'Remember our moments together? Every laugh, every quiet moment, every silly conversation. I never want it to end.' }
        ];
    }

    // ══════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════
    setupEvents() {
        const canvas = this.renderer.domElement;

        canvas.addEventListener('click', () => {
            if (this.state.started && !document.pointerLockElement) canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                this.state.player.canMove = true;
                this.state.paused = false;
                document.getElementById('hud').classList.remove('hidden');
                document.getElementById('pause-menu').classList.add('hidden');
            } else if (this.state.started) {
                this.state.player.canMove = false;
                this.state.paused = true;
                document.getElementById('pause-menu').classList.remove('hidden');
            }
        });

        document.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'Escape' && document.pointerLockElement) document.exitPointerLock();
            if ((e.key === 'e' || e.key === 'E') && this._currentInteractive) {
                this.interact(this._currentInteractive);
            }
        });
        document.addEventListener('keyup', e => this.keys[e.key.toLowerCase()] = false);

        document.addEventListener('mousemove', e => {
            if (!this.state.player.canMove || !document.pointerLockElement) return;
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y -= (e.movementX || 0) * this.state.settings.mouseSens;
            this.camera.rotation.x -= (e.movementY || 0) * this.state.settings.mouseSens;
            this.camera.rotation.x = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, this.camera.rotation.x));
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
        });

        // Buttons
        document.getElementById('btn-start')?.addEventListener('click', () => this.start());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.start());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());
        document.getElementById('btn-save')?.addEventListener('click', () => this.save());
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quit());

        document.getElementById('act-water')?.addEventListener('click', () => this.waterPlant());
        document.getElementById('act-letter')?.addEventListener('click', () => this.showModal('modal-letter'));
        document.getElementById('act-photo')?.addEventListener('click', () => this.takePhoto());
        document.getElementById('btn-water')?.addEventListener('click', () => this.waterPlant());
        document.getElementById('btn-fert')?.addEventListener('click', () => {
            this.state.plant.growth = Math.min(1, this.state.plant.growth + 0.05);
            this.notify('Fertilizer added! Growth boosted 🌱', 'success');
            this.playFx('success');
        });
        document.getElementById('btn-send-letter')?.addEventListener('click', () => this.sendLetter());

        document.querySelectorAll('[data-close]').forEach(b => {
            b.addEventListener('click', () => this.closeModals());
        });
    }

    // ══════════════════════════════════════════════════════
    // GAME LOOP
    // ══════════════════════════════════════════════════════
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

    // ══════════════════════════════════════════════════════
    // PHYSICS
    // ══════════════════════════════════════════════════════
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
            const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0,1,0));
            pos.addScaledVector(fwd, -dir.z * speed);
            pos.addScaledVector(right, dir.x * speed);
            pos.x = Math.max(-9, Math.min(22, pos.x));
            pos.z = Math.max(-9, Math.min(7, pos.z));
        }

        // Jump
        if (this.keys[' '] && this.state.player.canJump) {
            this.physVelY = 6; this.state.player.canJump = false;
        }

        this.state.player.pos.copy(pos);
    }

    // ══════════════════════════════════════════════════════
    // INTERACTIONS
    // ══════════════════════════════════════════════════════
    updateInteractions() {
        if (!this.state.player.canMove) return;
        const rc = new THREE.Raycaster();
        rc.setFromCamera(new THREE.Vector2(0,0), this.camera);
        const hits = rc.intersectObjects(this.interactiveObjects, true);
        const hint = document.getElementById('interact-hint');
        const text = document.getElementById('interact-text');

        if (hits.length > 0 && hits[0].distance < 5) {
            let obj = hits[0].object;
            while (obj && !obj.userData?.interactive) obj = obj.parent;
            if (obj?.userData?.interactive) {
                this._currentInteractive = obj;
                if (text) text.textContent = `${obj.userData.name} — ${obj.userData.desc}`;
                if (hint) hint.classList.add('visible');
                return;
            }
        }
        this._currentInteractive = null;
        if (hint) hint.classList.remove('visible');
    }

    interact(obj) {
        if (!obj?.userData) return;
        this.playFx('click');
        switch(obj.userData.type) {
            case 'plant': this.showModal('modal-plant'); break;
            case 'tv': this.showModal('modal-tv'); this.loadGallery(); break;
            case 'postbox': this.showModal('modal-letter'); this.loadLetters(); break;
            case 'teaset': this.notify('The tea is still warm... 🍵', 'info'); break;
            case 'zen': this.notify('The zen garden brings peace 🧘', 'info'); break;
        }
    }

    // ══════════════════════════════════════════════════════
    // GAME ACTIONS
    // ══════════════════════════════════════════════════════
    start() {
        document.getElementById('main-menu').classList.add('hidden');
        this.state.started = true;
        document.getElementById('game-canvas').requestPointerLock();
        this.playFx('success');
    }

    resume() {
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('game-canvas').requestPointerLock();
    }

    quit() {
        document.exitPointerLock();
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        this.state.started = false; this.state.paused = true;
    }

    waterPlant() {
        this.state.plant.health = Math.min(100, this.state.plant.health + 15);
        this.state.plant.growth = Math.min(1, this.state.plant.growth + 0.05);
        this.state.plant.waterCount++;
        this.state.plant.lastWatered = new Date().toISOString();
        this.playFx('water');
        this.notify('Plant watered! 💧 It looks happier!', 'success');
        this.save();
    }

    takePhoto() {
        const img = this.renderer.domElement.toDataURL('image/png');
        this.state.memories.push({ id: Date.now(), image: img, date: new Date().toISOString() });
        this.playFx('click');
        this.notify('📸 Photo captured!', 'success');
    }

    sendLetter() {
        const ta = document.getElementById('letter-input');
        if (!ta || !ta.value.trim()) { this.notify('Write something first! ✍️'); return; }
        this.state.letters.push({ id: Date.now(), date: new Date().toISOString(), title: 'A New Letter ❤️', content: ta.value.trim() });
        ta.value = '';
        this.playFx('click');
        this.notify('Letter sent! 💌', 'success');
        this.loadLetters();
        this.save();
    }

    save() {
        try {
            localStorage.setItem('tanmai_save', JSON.stringify({
                plant: this.state.plant, letters: this.state.letters, settings: this.state.settings
            }));
            this.notify('Saved! 💾', 'success');
        } catch {}
    }

    // ══════════════════════════════════════════════════════
    // UI
    // ══════════════════════════════════════════════════════
    updateHUD() {
        const now = new Date();
        const el = id => document.getElementById(id);
        const set = (id, v) => { const e = el(id); if (e) e.textContent = v; };
        set('hud-clock', now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:true }));
        set('hud-date', now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }));
        set('hud-plant-day', this.state.plant.day);
        set('hud-letters', this.state.letters.length);
        set('hud-photos', this.state.memories.length);
        // Plant modal bars
        const hb = el('bar-health'); if (hb) hb.style.width = this.state.plant.health + '%';
        set('val-health', this.state.plant.health + '%');
        const gb = el('bar-growth'); if (gb) gb.style.width = Math.round(this.state.plant.growth*100) + '%';
        set('val-growth', Math.round(this.state.plant.growth*100) + '%');
        set('val-days', this.state.plant.day);
    }

    showModal(id) {
        document.getElementById(id)?.classList.add('active');
        if (id === 'modal-letter') this.loadLetters();
    }
    closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }

    loadLetters() {
        const c = document.getElementById('letters-list');
        if (!c) return;
        c.innerHTML = '';
        this.state.letters.forEach(l => {
            const d = document.createElement('div');
            d.className = 'letter-item';
            d.innerHTML = `<div class="letter-date"><i class="fas fa-calendar"></i> ${new Date(l.date).toLocaleDateString()}</div><h4>${l.title}</h4><div class="letter-content">${l.content}</div>`;
            c.appendChild(d);
        });
    }

    loadGallery() {
        const main = document.getElementById('gallery-main');
        const thumbs = document.getElementById('gallery-thumbs');
        if (!main || !thumbs) return;
        if (this.state.memories.length === 0) {
            main.innerHTML = '<p style="color:rgba(255,255,255,0.4)">Take photos with 📷 to fill this gallery!</p>';
            thumbs.innerHTML = ''; return;
        }
        main.innerHTML = `<img src="${this.state.memories[0].image}" alt="Memory">`;
        thumbs.innerHTML = '';
        this.state.memories.forEach((m, i) => {
            const t = document.createElement('div');
            t.className = 'gallery-thumb' + (i === 0 ? ' active' : '');
            t.innerHTML = `<img src="${m.image}">`;
            t.addEventListener('click', () => {
                main.innerHTML = `<img src="${m.image}">`;
                thumbs.querySelectorAll('.gallery-thumb').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
            });
            thumbs.appendChild(t);
        });
    }

    notify(msg, type='info') {
        const c = document.getElementById('notifs');
        if (!c) return;
        const n = document.createElement('div');
        n.className = `notif ${type}`;
        n.innerHTML = `<i class="fas fa-${type==='success'?'check-circle':'info-circle'}"></i> ${msg}`;
        c.appendChild(n);
        setTimeout(() => { n.style.opacity = '0'; n.style.transform = 'translateX(100%)'; setTimeout(() => n.remove(), 300); }, 4000);
    }

    playFx(name) {
        try {
            if (!this._actx) this._actx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._actx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.connect(ctx.destination); osc.connect(gain);
            gain.gain.value = 0.05;
            switch(name) {
                case 'click': osc.frequency.value=800; gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1); osc.start(); osc.stop(ctx.currentTime+0.1); break;
                case 'water': osc.type='sine'; osc.frequency.value=400; osc.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.3); gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4); osc.start(); osc.stop(ctx.currentTime+0.4); break;
                case 'success': osc.frequency.value=523; gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3); osc.start(); osc.stop(ctx.currentTime+0.3);
                    const o2=ctx.createOscillator(),g2=ctx.createGain(); g2.gain.value=0.06; g2.connect(ctx.destination); o2.connect(g2); o2.frequency.value=659;
                    g2.gain.setValueAtTime(0.06,ctx.currentTime+0.15); g2.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.45);
                    o2.start(ctx.currentTime+0.15); o2.stop(ctx.currentTime+0.45); break;
            }
        } catch {}
    }
}

// ═══ LAUNCH ═══
window.addEventListener('DOMContentLoaded', () => { window.game = new GameEngine(); });