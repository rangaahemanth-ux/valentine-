// ═══════════════════════════════════════════════════════════════════════════
// TANMAI'S SANCTUARY — Ultra Premium 3D Game Engine v5.0
// A love letter rendered in code — Every pixel whispers your name
// ═══════════════════════════════════════════════════════════════════════════

class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.keys = {};
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

        this.state = {
            loaded: false,
            started: false,
            paused: false,
            photoMode: false,
            photoFilter: 0,
            flashlight: false,
            player: {
                pos: new THREE.Vector3(0, 1.6, 3),
                canMove: false,
                canJump: true,
                zone: 'Main Room'
            },
            plant: {
                health: 85,
                growth: 0.3,
                hydration: 50,
                day: 1,
                lastWatered: null,
                waterCount: 0,
                bloomCount: 0,
                stage: 'seedling' // seedling, sprout, young, mature, blooming, legendary
            },
            letters: [],
            sentLetters: [],
            memories: [],
            wishes: [],
            diary: [],
            achievements: [],
            settings: {
                bloom: true,
                bloomIntensity: 1.0,
                mouseSens: 0.002,
                masterVol: 0.7,
                particleDensity: 7,
                dynamicWeather: true,
                ambientSounds: true
            },
            weather: {
                current: 'clear', // clear, rain, snow, fireflies, aurora
                intensity: 0.5,
                transitionTimer: 0
            },
            time: {
                gameHour: 22, // Start at 10PM
                gameMinute: 0,
                dayNightCycle: true
            },
            stats: {
                totalPlayTime: 0,
                stepsWalked: 0,
                interactionsCount: 0,
                photosTotal: 0
            }
        };

        this.interactiveObjects = [];
        this.particles = [];
        this.animations = [];
        this.loadedModels = {};
        this.physVelY = 0;
        this.flashlightObj = null;
        this.weatherParticles = null;
        this.ambientSounds = {};
        this._lastStepPos = new THREE.Vector3();

        // Achievement definitions
        this.achievementDefs = {
            first_steps: { name: 'First Steps', icon: '👣', desc: 'Enter the sanctuary for the first time' },
            green_thumb: { name: 'Green Thumb', icon: '🌱', desc: 'Water the plant 10 times' },
            poet: { name: 'Love Poet', icon: '✍️', desc: 'Write your first love letter' },
            photographer: { name: 'Memory Maker', icon: '📸', desc: 'Take your first photo' },
            stargazer: { name: 'Stargazer', icon: '🌠', desc: 'Make your first wish' },
            diarist: { name: 'Dear Diary', icon: '📖', desc: 'Write your first diary entry' },
            devoted: { name: 'Devoted', icon: '💕', desc: 'Visit the sanctuary 7 days in a row' },
            bloom: { name: 'First Bloom', icon: '🌸', desc: 'Watch the bonsai bloom for the first time' },
            explorer: { name: 'Explorer', icon: '🗺️', desc: 'Visit every area of the sanctuary' },
            musician: { name: 'Serenade', icon: '🎵', desc: 'Sing to the plant' },
            collector: { name: 'Memory Collector', icon: '🖼️', desc: 'Capture 10 photos' },
            letter_master: { name: 'Letter Master', icon: '💌', desc: 'Write 10 love letters' },
            wishing_well: { name: 'Wishing Well', icon: '⭐', desc: 'Make 5 wishes on stars' },
            night_owl: { name: 'Night Owl', icon: '🦉', desc: 'Spend 30 minutes in the sanctuary' },
            legendary_plant: { name: 'Legendary Bloom', icon: '🏆', desc: 'Grow the bonsai to legendary status' }
        };

        // Photo filters
        this.photoFilters = [
            { name: 'Normal', css: 'none' },
            { name: 'Warm Memory', css: 'sepia(0.3) saturate(1.3) brightness(1.05)' },
            { name: 'Cool Twilight', css: 'hue-rotate(20deg) saturate(0.8) brightness(0.95)' },
            { name: 'Rose Tinted', css: 'hue-rotate(-10deg) saturate(1.5) brightness(1.1)' },
            { name: 'Vintage', css: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
            { name: 'Dreamy', css: 'blur(1px) saturate(1.4) brightness(1.15)' },
            { name: 'Noir', css: 'grayscale(1) contrast(1.3)' },
            { name: 'Golden Hour', css: 'sepia(0.2) saturate(1.6) hue-rotate(-15deg) brightness(1.1)' },
            { name: 'Sakura', css: 'hue-rotate(-20deg) saturate(1.8) brightness(1.05) contrast(0.95)' }
        ];

        // Love quotes for loading screen
        this.loveQuotes = [
            '"Every love story is beautiful, but ours is my favorite"',
            '"In all the world, there is no heart for me like yours"',
            '"You are my today and all of my tomorrows"',
            '"I love you not only for what you are, but for what I am when I am with you"',
            '"Wherever you go, whatever you do, I will be right here waiting for you"',
            '"My heart is, and always will be, yours"',
            '"You are the finest, loveliest, tenderest person I have ever known"',
            '"I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more"'
        ];

        this.init();
    }

    // ══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ══════════════════════════════════════════════════════════════════
    async init() {
        try {
            this.initLoaderParticles();
            this.cycleQuotes();
            this.progress(3, 'Awakening the universe...');
            await this.sleep(200);

            this.progress(8, 'Starting renderer...');
            this.initRenderer();
            await this.sleep(100);

            this.progress(12, 'Creating cosmos...');
            this.initScene();
            this.initCamera();
            await this.sleep(100);

            this.progress(18, 'Post-processing magic...');
            this.initPostProcessing();
            await this.sleep(100);

            this.progress(24, 'Painting light...');
            this.initLighting();
            await this.sleep(100);

            this.progress(30, 'Loading 3D models...');
            await this.loadAllModels();

            this.progress(55, 'Building your sanctuary...');
            this.buildWorld();
            await this.sleep(200);

            this.progress(68, 'Crafting the cosmos...');
            this.createSpaceSky();
            await this.sleep(200);

            this.progress(78, 'Summoning particles...');
            this.createParticles();
            await this.sleep(100);

            this.progress(84, 'Tuning music...');
            this.initMusicPlayer();
            await this.sleep(100);

            this.progress(88, 'Creating ambient world...');
            this.initAmbientSounds();
            this.initWeatherSystem();
            await this.sleep(100);

            this.progress(92, 'Loading memories...');
            await this.loadGameData();
            await this.sleep(100);

            this.progress(95, 'Preparing achievements...');
            this.initFlashlight();
            await this.sleep(100);

            this.progress(98, 'Final touches...');
            this.updateLoveCounter();
            await this.sleep(200);

            this.progress(100, 'Welcome home, Tanmai ✦');
            this.setupEvents();
            this.state.loaded = true;

            await this.sleep(800);
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('fade-out');
                setTimeout(() => ls.style.display = 'none', 1200);
            }

            this.gameLoop();
            console.log('✅ Sanctuary v5 — Ready');
        } catch (e) {
            console.error('Init failed:', e);
            document.body.innerHTML = `<div style="color:#fff;padding:40px;font-family:sans-serif;text-align:center">
                <h2>Failed to load 😔</h2><p>${e.message}</p>
                <p style="margin-top:20px;opacity:0.5">Try refreshing the page</p></div>`;
        }
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
        // Add keyframes
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

    cycleQuotes() {
        const el = document.getElementById('loader-quote');
        if (!el) return;
        let i = 0;
        el.textContent = this.loveQuotes[0];
        this._quoteInterval = setInterval(() => {
            i = (i + 1) % this.loveQuotes.length;
            el.style.opacity = '0';
            setTimeout(() => {
                el.textContent = this.loveQuotes[i];
                el.style.opacity = '1';
            }, 500);
        }, 4000);
    }

    updateLoveCounter() {
        const el = document.getElementById('days-together');
        if (!el) return;
        const start = new Date('2025-01-01'); // Adjust to actual anniversary
        const now = new Date();
        const days = Math.max(1, Math.floor((now - start) / 86400000));
        el.textContent = `${days} days of love ✦`;
        // Update in letter date stamp too
        const stamp = document.getElementById('letter-date-stamp');
        if (stamp) stamp.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // ══════════════════════════════════════════════════════════════════
    // RENDERER & POST PROCESSING
    // ══════════════════════════════════════════════════════════════════
    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true // needed for screenshots
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

    // ══════════════════════════════════════════════════════════════════
    // SCENE & SPACE SKY
    // ══════════════════════════════════════════════════════════════════
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020210);
        this.scene.fog = new THREE.FogExp2(0x020210, 0.007);
    }

    createSpaceSky() {
        this.createStarField();
        this.createTwinklingStars();
        this.createShootingStars();
        this.createConstellations();
        this.createPlanets();
        this.createDetailedMoon();
        this.createNebulae();
        this.createAurora();
        this.createMilkyWay();
    }

    createStarField() {
        const count = 3500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const c = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 160 + Math.random() * 120;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi);
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

            const hue = Math.random() < 0.7 ? 0.6 + Math.random() * 0.1 : Math.random() * 0.15;
            const sat = Math.random() * 0.3;
            c.setHSL(hue, sat, 0.8 + Math.random() * 0.2);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
            sizes[i] = 0.2 + Math.random() * 1.8;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.6, vertexColors: true, transparent: true, opacity: 0.9,
            depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
        });
        const stars = new THREE.Points(geo, mat);
        this.scene.add(stars);
        this.animations.push({ update: () => { stars.rotation.y += 0.000025; } });
    }

    createTwinklingStars() {
        const count = 300;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 140 + Math.random() * 60;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi);
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        const mat = new THREE.PointsMaterial({
            size: 1.4, color: 0xffffff, transparent: true, opacity: 0.8,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const twinkles = new THREE.Points(geo, mat);
        this.scene.add(twinkles);

        this.animations.push({
            update: () => {
                mat.opacity = 0.3 + Math.sin(Date.now() * 0.002) * 0.4;
                mat.size = 1.2 + Math.sin(Date.now() * 0.003) * 0.4;
            }
        });
    }

    createShootingStars() {
        this.shootingStars = [];
        for (let i = 0; i < 6; i++) this._addShootingStar();
    }

    _addShootingStar() {
        const geo = new THREE.BufferGeometry();
        const pts = [];
        for (let i = 0; i < 25; i++) pts.push(i * 0.5, 0, 0);
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));

        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const line = new THREE.Line(geo, mat);

        // Add a glow head
        const headGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const headMat = new THREE.MeshBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const head = new THREE.Mesh(headGeo, headMat);
        line.add(head);

        const resetStar = () => {
            line.position.set(
                (Math.random() - 0.5) * 250,
                50 + Math.random() * 100,
                -50 - Math.random() * 120
            );
            line.rotation.z = -Math.PI / 6 + (Math.random() - 0.5) * 0.4;
            line.userData.speed = 70 + Math.random() * 100;
            line.userData.life = 0;
            line.userData.maxLife = 1.5 + Math.random() * 2.5;
            line.userData.delay = Math.random() * 20;
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

                const alpha = t < 0.1 ? t * 10 : t > 0.7 ? (1 - t) / 0.3 : 1;
                mat.opacity = alpha;
                headMat.opacity = alpha * 0.6;

                line.position.x += line.userData.speed * d * Math.cos(line.rotation.z);
                line.position.y -= line.userData.speed * d * Math.abs(Math.sin(line.rotation.z));
            }
        });
    }

    createConstellations() {
        // Draw faint constellation lines
        const constellations = [
            // Heart constellation
            { points: [[0,80,-150],[3,83,-148],[6,80,-146],[3,76,-148],[0,80,-150],[-3,83,-148],[-6,80,-146],[-3,76,-148],[0,80,-150]], color: 0xff6b8b },
            // Small dipper
            { points: [[-30,90,-130],[-33,92,-128],[-36,91,-126],[-38,93,-124],[-35,95,-122]], color: 0x8899cc },
        ];

        constellations.forEach(c => {
            const points = c.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: c.color, transparent: true, opacity: 0.15,
                blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(geo, mat);
            this.scene.add(line);

            // Star points at each vertex
            points.forEach(p => {
                const starGeo = new THREE.SphereGeometry(0.5, 8, 8);
                const starMat = new THREE.MeshBasicMaterial({
                    color: c.color, transparent: true, opacity: 0.6,
                    blending: THREE.AdditiveBlending
                });
                const star = new THREE.Mesh(starGeo, starMat);
                star.position.copy(p);
                this.scene.add(star);
            });

            this.animations.push({
                update: () => {
                    mat.opacity = 0.08 + Math.sin(Date.now() * 0.0008) * 0.07;
                }
            });
        });
    }

    createPlanets() {
        this._addPlanet(80, 55, -120, 8, 0x4a6fa5, 0x6b8fc5, true);   // Blue gas giant
        this._addPlanet(-100, 40, -80, 5, 0xd4956a, 0xe8b898, false);  // Orange planet
        this._addPlanet(50, 70, 80, 3, 0xc0a0d0, 0xe0c8f0, false);    // Lavender moon
        this._addPlanet(-60, 80, -140, 12, 0x8b5e3c, 0xa67c52, true);  // Saturn-like
        this._addPlanet(120, 60, -100, 4, 0x66bb6a, 0x81c784, false);  // Emerald world
    }

    _addPlanet(x, y, z, radius, color1, color2, hasRing) {
        const group = new THREE.Group();

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
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, i * 13, 256, 8);
        }
        // Add storm spots
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.ellipse(Math.random() * 256, Math.random() * 128, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshStandardMaterial({
            map: tex, roughness: 0.8,
            emissive: new THREE.Color(color1), emissiveIntensity: 0.05
        });
        const planet = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), mat);
        group.add(planet);

        // Atmosphere
        const glowMat = new THREE.MeshBasicMaterial({
            color: color2, transparent: true, opacity: 0.1,
            side: THREE.BackSide, blending: THREE.AdditiveBlending
        });
        group.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.1, 32, 24), glowMat));

        if (hasRing) {
            const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 2.0, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: color2, transparent: true, opacity: 0.18,
                side: THREE.DoubleSide, blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.5;
            group.add(ring);
        }

        group.position.set(x, y, z);
        this.scene.add(group);
        this.animations.push({ update: (d) => { planet.rotation.y += 0.02 * d; } });
    }

    createDetailedMoon() {
        const group = new THREE.Group();
        const radius = 15;

        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#d4d4d8';
        ctx.fillRect(0, 0, 512, 256);

        // Craters with more detail
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 50; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 256;
            const cr = 3 + Math.random() * 22;
            const shade = 100 + Math.random() * 50;
            ctx.fillStyle = `rgba(${shade},${shade},${shade + 10},0.4)`;
            ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = `rgba(180,180,190,0.25)`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
        // Lunar maria (dark patches)
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#555';
        ctx.beginPath(); ctx.ellipse(200, 130, 80, 50, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(350, 100, 60, 40, -0.2, 0, Math.PI * 2); ctx.fill();

        const moonTex = new THREE.CanvasTexture(canvas);
        const moonMat = new THREE.MeshStandardMaterial({
            map: moonTex, roughness: 0.95,
            emissive: 0xccccdd, emissiveIntensity: 0.08
        });
        const moon = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), moonMat);
        group.add(moon);

        // Multi-layer glow
        [1.08, 1.15, 1.25].forEach((s, i) => {
            const gm = new THREE.MeshBasicMaterial({
                color: 0xaabbdd, transparent: true, opacity: 0.04 - i * 0.01,
                side: THREE.BackSide, blending: THREE.AdditiveBlending
            });
            group.add(new THREE.Mesh(new THREE.SphereGeometry(radius * s, 32, 24), gm));
        });

        const moonLight = new THREE.DirectionalLight(0x8899bb, 0.4);
        group.add(moonLight);

        group.position.set(-40, 60, -100);
        this.scene.add(group);
        this.animations.push({ update: (d) => { moon.rotation.y += 0.005 * d; } });
    }

    createNebulae() {
        const nebulae = [
            { x: 40, y: 60, z: -100, color: 0xff6b8b, size: 35 },
            { x: -50, y: 50, z: -80, color: 0x7c4dff, size: 28 },
            { x: 0, y: 80, z: -130, color: 0x42a5f5, size: 40 },
            { x: 70, y: 40, z: -60, color: 0xffcc00, size: 22 },
            { x: -80, y: 70, z: -110, color: 0x66bb6a, size: 25 },
            { x: 30, y: 90, z: -90, color: 0xce93d8, size: 30 }
        ];

        nebulae.forEach(n => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
            const col = new THREE.Color(n.color);
            grad.addColorStop(0, `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},0.25)`);
            grad.addColorStop(0.3, `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},0.1)`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);

            // Noise
            ctx.globalAlpha = 0.06;
            for (let i = 0; i < 400; i++) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
            }

            const tex = new THREE.CanvasTexture(canvas);

            for (let i = 0; i < 4; i++) {
                const mat = new THREE.SpriteMaterial({
                    map: tex, transparent: true, blending: THREE.AdditiveBlending,
                    opacity: 0.12 + Math.random() * 0.12
                });
                const sprite = new THREE.Sprite(mat);
                sprite.scale.set(n.size * (0.7 + i * 0.3), n.size * (0.7 + i * 0.3), 1);
                sprite.position.set(
                    n.x + (Math.random() - 0.5) * 12,
                    n.y + (Math.random() - 0.5) * 12,
                    n.z + (Math.random() - 0.5) * 12
                );
                this.scene.add(sprite);
            }
        });
    }

    createAurora() {
        const colors = [0x00ff88, 0x00ccff, 0x8844ff, 0x00ffcc, 0xff6b8b];

        for (let i = 0; i < 8; i++) {
            const w = 40 + Math.random() * 40;
            const h = 6 + Math.random() * 10;
            const geo = new THREE.PlaneGeometry(w, h, 40, 1);

            const posAttr = geo.attributes.position;
            for (let j = 0; j < posAttr.count; j++) {
                const x = posAttr.getX(j);
                posAttr.setY(j, posAttr.getY(j) + Math.sin(x * 0.08) * 2.5);
            }

            const color = colors[i % colors.length];
            const mat = new THREE.MeshBasicMaterial({
                color, transparent: true, opacity: 0.03 + Math.random() * 0.03,
                side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
            });
            const plane = new THREE.Mesh(geo, mat);
            plane.position.set(
                (Math.random() - 0.5) * 80,
                42 + Math.random() * 25,
                -80 - Math.random() * 50
            );
            plane.rotation.x = -0.15 + Math.random() * 0.1;
            this.scene.add(plane);

            const offset = Math.random() * 100;
            this.animations.push({
                update: () => {
                    mat.opacity = 0.015 + Math.sin(Date.now() * 0.0003 + offset) * 0.02;
                    const p = plane.geometry.attributes.position;
                    for (let j = 0; j < p.count; j++) {
                        const x = p.getX(j);
                        p.setY(j, Math.sin(x * 0.06 + Date.now() * 0.0004 + offset) * 3.5);
                    }
                    p.needsUpdate = true;
                }
            });
        }
    }

    createMilkyWay() {
        // Band of dense stars across the sky
        const count = 800;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const c = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() - 0.5) * 0.8; // narrow band
            const spread = (Math.random() - 0.5) * Math.PI * 2;
            const r = 170 + Math.random() * 50;

            pos[i * 3] = r * Math.cos(spread) * Math.cos(angle);
            pos[i * 3 + 1] = r * Math.sin(angle) + 40; // offset upward
            pos[i * 3 + 2] = r * Math.sin(spread) * Math.cos(angle);

            c.setHSL(0.6 + Math.random() * 0.15, 0.15, 0.7 + Math.random() * 0.3);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.35, vertexColors: true, transparent: true, opacity: 0.5,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        this.scene.add(new THREE.Points(geo, mat));
    }

    // ══════════════════════════════════════════════════════════════════
    // CAMERA
    // ══════════════════════════════════════════════════════════════════
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.copy(this.state.player.pos);
    }

    // ══════════════════════════════════════════════════════════════════
    // LIGHTING
    // ══════════════════════════════════════════════════════════════════
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

        // Ambient
        this.ambientLight = new THREE.AmbientLight(0x221133, 0.4);
        this.scene.add(this.ambientLight);

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
        addLight(18, 1.5, 2, 0xffcc66, 1.5, 12);
        addLight(12, 2, 0, 0x6688cc, 0.4, 20);

        // Color accent lights
        addLight(-7, 1.5, -3, 0xff6b8b, 0.3, 8); // Zen garden accent
        addLight(7, 1.5, -7, 0xff6b8b, 0.3, 6);  // Postbox accent

        // Flicker animation
        this.animations.push({
            update: () => {
                const t = Date.now() * 0.001;
                this.roomLights.forEach((l, i) => {
                    if (!l.userData.base) l.userData.base = l.intensity;
                    l.intensity = l.userData.base + Math.sin(t * 2 + i * 1.7) * 0.15 + Math.sin(t * 5.3 + i) * 0.05;
                });
            }
        });
    }

    initFlashlight() {
        this.flashlightObj = new THREE.SpotLight(0xfff5e6, 0, 30, Math.PI / 6, 0.5, 1.5);
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

    // ══════════════════════════════════════════════════════════════════
    // MODEL LOADING
    // ══════════════════════════════════════════════════════════════════
    async loadAllModels() {
        this.gltfLoader = new THREE.GLTFLoader();

        const manifest = {
            room: 'public/assets/models/japanese_style_room.glb',
            bonsai: 'public/assets/models/cc0__youko_sakura_prunus_yoko.glb',
            tv: 'public/assets/models/old_tv.glb',
            postbox: 'public/assets/models/british_postbox.glb',
            lantern: 'public/assets/models/spherical_japanese_paper_lantern.glb',
            cushion: 'public/assets/models/sweetheart_cushion.glb',
            table: 'public/assets/models/wizard_table.glb'
        };

        const total = Object.keys(manifest).length;
        let loaded = 0;

        for (const [name, url] of Object.entries(manifest)) {
            try {
                this.progress(30 + (loaded / total) * 25, `Loading ${name}...`);
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

    // ══════════════════════════════════════════════════════════════════
    // BUILD WORLD
    // ══════════════════════════════════════════════════════════════════
    buildWorld() {
        this.buildRoom();
        this.buildFurniture();
        this.buildTerrace();
        this.buildGarden();
        this.buildInteractiveObjects();
    }

    buildRoom() {
        if (this.loadedModels.room) {
            const room = this.loadedModels.room.clone();
            this.fitModel(room, 20);
            this.scene.add(room);
        } else {
            // Procedural fallback
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

            // Shoji screen (right wall partial)
            const shojiMat = new THREE.MeshStandardMaterial({
                color: 0xfff8e1, roughness: 0.95, transparent: true, opacity: 0.85,
                side: THREE.DoubleSide
            });
            const shoji = new THREE.Mesh(new THREE.PlaneGeometry(8, 5.5), shojiMat);
            shoji.rotation.y = -Math.PI / 2; shoji.position.set(10, 2.8, -5);
            this.scene.add(shoji);

            // Shoji grid lines
            const gridMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            for (let i = 0; i < 4; i++) {
                const h = new THREE.Mesh(new THREE.BoxGeometry(0.04, 5.5, 0.02), gridMat);
                h.rotation.y = -Math.PI / 2;
                h.position.set(10, 2.8, -5 + (i - 1.5) * 2);
                this.scene.add(h);
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
            for (let x of [-1, 1]) for (let z of [-1, 1]) {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), wm);
                leg.position.set(x * 0.9, 0.22, -5 + z * 0.9); leg.castShadow = true; this.scene.add(leg);
            }
        }

        // Cushions
        const cPos = [[1.2, -4], [-1.2, -4], [1.2, -6], [-1.2, -6]];
        if (this.loadedModels.cushion) {
            cPos.forEach(([x, z]) => {
                const c = this.loadedModels.cushion.clone();
                this.fitModel(c, 0.6);
                c.position.set(x, 0, z);
                const sb = new THREE.Box3().setFromObject(c);
                c.position.y -= sb.min.y;
                this.scene.add(c);
            });
        } else {
            const cm = new THREE.MeshStandardMaterial({ color: 0x7b1fa2, roughness: 0.85 });
            cPos.forEach(([x, z]) => {
                const c = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), cm);
                c.position.set(x, 0.04, z); c.castShadow = true; this.scene.add(c);
            });
        }

        // Hanging lanterns
        this.addLantern(-3, 4, -3, 0xff6b8b);
        this.addLantern(3, 4, -7, 0xffcc00);
        this.addLantern(0, 4.2, -8, 0xff8e53);
        this.addLantern(6, 3.8, -2, 0xce93d8);

        // Tokonoma + scroll
        const pm = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 });
        const plat = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 2), pm);
        plat.position.set(-7, 0.075, -8.5); plat.castShadow = true; this.scene.add(plat);
        const scroll = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.5),
            new THREE.MeshStandardMaterial({ color: 0xfff8e1, side: THREE.DoubleSide }));
        scroll.position.set(-7, 2.5, -9.8); this.scene.add(scroll);

        // Bookshelf
        this.addBookshelf(8, 0, -9);
    }

    addBookshelf(x, y, z) {
        const g = new THREE.Group();
        const wood = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });

        // Frame
        const back = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 0.05), wood);
        back.position.y = 1.5; g.add(back);

        // Shelves
        for (let i = 0; i < 4; i++) {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 0.4), wood);
            shelf.position.set(0, i * 0.75 + 0.1, 0.18);
            shelf.castShadow = true;
            g.add(shelf);
        }

        // Books
        const bookColors = [0xc62828, 0x1565c0, 0x2e7d32, 0x6a1b9a, 0xff8f00, 0x4e342e, 0x00838f];
        for (let s = 0; s < 3; s++) {
            const shelfY = s * 0.75 + 0.15;
            let bx = -0.85;
            while (bx < 0.8) {
                const bw = 0.08 + Math.random() * 0.1;
                const bh = 0.4 + Math.random() * 0.25;
                const bc = bookColors[Math.floor(Math.random() * bookColors.length)];
                const book = new THREE.Mesh(
                    new THREE.BoxGeometry(bw, bh, 0.25),
                    new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 })
                );
                book.position.set(bx + bw / 2, shelfY + bh / 2, 0.2);
                book.castShadow = true;
                // Slight random lean
                book.rotation.z = (Math.random() - 0.5) * 0.08;
                g.add(book);
                bx += bw + 0.02;
            }
        }

        g.position.set(x, y, z);
        this.scene.add(g);
    }

    addLantern(x, y, z, color) {
        const g = new THREE.Group();
        if (this.loadedModels.lantern) {
            const m = this.loadedModels.lantern.clone();
            this.fitModel(m, 0.6);
            g.add(m);
        } else {
            // Procedural lantern
            const body = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 12, 10),
                new THREE.MeshStandardMaterial({
                    color, emissive: color, emissiveIntensity: 0.5,
                    transparent: true, opacity: 0.85
                })
            );
            body.scale.y = 1.4; g.add(body);

            // Wire
            const wire = new THREE.Mesh(
                new THREE.CylinderGeometry(0.005, 0.005, 0.8, 4),
                new THREE.MeshBasicMaterial({ color: 0x333333 })
            );
            wire.position.y = 0.55; g.add(wire);
        }

        const light = new THREE.PointLight(color, 0.8, 6, 2);
        g.add(light);
        g.position.set(x, y, z);
        this.scene.add(g);

        // Gentle sway
        const offset = Math.random() * 10;
        this.animations.push({
            update: () => {
                g.rotation.z = Math.sin(Date.now() * 0.001 + offset) * 0.03;
                g.rotation.x = Math.sin(Date.now() * 0.0008 + offset) * 0.02;
            }
        });
    }

    buildTerrace() {
        // Wooden deck
        const deckMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.85 });
        const deck = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), deckMat);
        deck.rotation.x = -Math.PI / 2; deck.position.set(14, 0.05, 0);
        deck.receiveShadow = true; this.scene.add(deck);

        // Railing
        const railMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
        for (let i = 0; i < 8; i++) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), railMat);
            post.position.set(8 + i * 1.5, 0.6, 4); post.castShadow = true; this.scene.add(post);
        }
        const rail = new THREE.Mesh(new THREE.BoxGeometry(12, 0.05, 0.08), railMat);
        rail.position.set(14, 1.1, 4); this.scene.add(rail);

        // Bamboo plants
        for (let i = 0; i < 5; i++) {
            this.addBamboo(8 + i * 3, 0, 5 + Math.random() * 2);
        }

        // Stone path
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.95 });
        for (let i = 0; i < 6; i++) {
            const stone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3 + Math.random() * 0.15, 0.3, 0.05, 12),
                stoneMat
            );
            stone.position.set(
                10 + i * 1.5 + (Math.random() - 0.5) * 0.4,
                0.03,
                -2 + (Math.random() - 0.5) * 0.5
            );
            stone.receiveShadow = true;
            this.scene.add(stone);
        }
    }

    addBamboo(x, y, z) {
        const g = new THREE.Group();
        const bm = new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.7 });
        const count = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), bm);
            seg.position.y = i * 0.5 + 0.25; seg.castShadow = true; g.add(seg);
            // Joint
            if (i > 0 && i < count - 1) {
                const joint = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 8),
                    new THREE.MeshStandardMaterial({ color: 0x4caf50 }));
                joint.position.y = i * 0.5; g.add(joint);
            }
        }
        const lm = new THREE.MeshStandardMaterial({ color: 0x388e3c, side: THREE.DoubleSide });
        for (let i = 0; i < 6; i++) {
            const lf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.5), lm);
            lf.position.set((Math.random() - 0.5) * 0.4, count * 0.5 - Math.random() * 0.6, (Math.random() - 0.5) * 0.3);
            lf.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.3);
            g.add(lf);
        }
        g.position.set(x, y, z); this.scene.add(g);
    }

    buildGarden() {
        // Stepping stones in a curve
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8d8d8d, roughness: 0.95 });
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 0.4 - 0.2;
            const r = 4 + i * 0.5;
            const stone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25 + Math.random() * 0.1, 0.25, 0.04, 10),
                stoneMat
            );
            stone.position.set(-7 + Math.cos(angle) * r, 0.02, -3 + Math.sin(angle) * r);
            stone.receiveShadow = true;
            this.scene.add(stone);
        }

        // Small pond
        const pondMat = new THREE.MeshStandardMaterial({
            color: 0x1a237e, roughness: 0.1, metalness: 0.3,
            transparent: true, opacity: 0.7
        });
        const pond = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), pondMat);
        pond.rotation.x = -Math.PI / 2;
        pond.position.set(-5, 0.02, 2);
        this.scene.add(pond);

        // Pond ripple animation
        this.animations.push({
            update: () => {
                pondMat.opacity = 0.6 + Math.sin(Date.now() * 0.002) * 0.1;
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // INTERACTIVE OBJECTS
    // ══════════════════════════════════════════════════════════════════
    buildInteractiveObjects() {
        this.addBonsai();
        this.addTV();
        this.addPostbox();
        this.addTeaSet();
        this.addZenGarden();
        this.addWishingSpot();
    }

    addBonsai() {
        const g = new THREE.Group(); g.name = 'Bonsai';
        if (this.loadedModels.bonsai) {
            const m = this.loadedModels.bonsai.clone();
            this.fitModel(m, 1.2);
            g.add(m);
        } else {
            const pm = new THREE.MeshStandardMaterial({ color: 0x795548 });
            g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.3, 16), pm), { castShadow: true }));
            const tm = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.8, 8), tm);
            trunk.position.y = 0.55; trunk.castShadow = true; g.add(trunk);
            const fm = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
            const fol = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), fm);
            fol.position.y = 1.05; fol.scale.y = 0.7; g.add(fol);
            const fl = new THREE.MeshStandardMaterial({ color: 0xff6b8b, emissive: 0xff6b8b, emissiveIntensity: 0.3 });
            for (let i = 0; i < 10; i++) {
                const f = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), fl);
                f.position.set((Math.random() - 0.5) * 0.4, 0.85 + Math.random() * 0.3, (Math.random() - 0.5) * 0.3);
                g.add(f);
            }
        }

        // Glow ring beneath
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff6b8b, transparent: true, opacity: 0.08,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), glowMat);
        glow.rotation.x = -Math.PI / 2; glow.position.y = 0.01; g.add(glow);

        g.position.set(4, 0.6, -8);
        g.userData = { interactive: true, type: 'plant', name: 'Bonsai of Love 🌸', desc: 'Water it daily and watch it grow!' };
        this.scene.add(g); this.interactiveObjects.push(g);
        this.animations.push({
            update: () => {
                g.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
                glowMat.opacity = 0.05 + Math.sin(Date.now() * 0.002) * 0.03;
            }
        });
    }

    addTV() {
        const g = new THREE.Group(); g.name = 'TV';
        if (this.loadedModels.tv) {
            const m = this.loadedModels.tv.clone();
            this.fitModel(m, 1.8);
            g.add(m);
        } else {
            const fm = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.3, metalness: 0.8 });
            g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.1), fm), { castShadow: true }));

            // Animated screen
            const screenCanvas = document.createElement('canvas');
            screenCanvas.width = 256; screenCanvas.height = 160;
            this._tvCanvas = screenCanvas;
            this._tvCtx = screenCanvas.getContext('2d');
            const scrTex = new THREE.CanvasTexture(screenCanvas);
            this._tvTexture = scrTex;

            const sm = new THREE.MeshStandardMaterial({
                map: scrTex, emissive: 0x283593, emissiveIntensity: 0.5
            });
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.3), sm);
            scr.position.z = 0.06; g.add(scr);
        }

        g.add(new THREE.PointLight(0x5c6bc0, 0.5, 5));
        g.position.set(-5, 0, -9);
        g.userData = { interactive: true, type: 'tv', name: 'Memory Gallery 📺', desc: 'View our precious memories' };
        this.scene.add(g); this.interactiveObjects.push(g);

        // TV screen animation
        if (this._tvCtx) {
            this.animations.push({
                update: () => {
                    const ctx = this._tvCtx;
                    const t = Date.now() * 0.001;
                    ctx.fillStyle = `hsl(${(t * 20) % 360}, 30%, 15%)`;
                    ctx.fillRect(0, 0, 256, 160);

                    // Draw hearts
                    ctx.font = '20px sans-serif';
                    ctx.fillStyle = `rgba(255,107,139,${0.3 + Math.sin(t) * 0.2})`;
                    ctx.fillText('❤️', 100 + Math.sin(t * 0.5) * 30, 80 + Math.cos(t * 0.7) * 20);

                    ctx.font = '14px sans-serif';
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.fillText('Our Memories', 80, 140);

                    this._tvTexture.needsUpdate = true;
                }
            });
        }
    }

    addPostbox() {
        const g = new THREE.Group(); g.name = 'Postbox';
        if (this.loadedModels.postbox) {
            const m = this.loadedModels.postbox.clone();
            this.fitModel(m, 1.4);
            g.add(m);
        } else {
            const bm = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.5 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), bm);
            body.castShadow = true; g.add(body);
            // Top cap
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.45),
                new THREE.MeshStandardMaterial({ color: 0xb71c1c }));
            cap.position.y = 0.44; g.add(cap);
            // Mail slot
            const slot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
            slot.position.set(0, 0.15, 0.21); g.add(slot);
        }
        g.add(new THREE.PointLight(0xff6b8b, 0.4, 4));
        g.position.set(7, 0, -7);
        g.userData = { interactive: true, type: 'postbox', name: 'Love Letter Box 💌', desc: 'Read and write letters' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    addTeaSet() {
        const g = new THREE.Group();
        const cm = new THREE.MeshStandardMaterial({ color: 0xefebe9, roughness: 0.4 });
        const pot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), cm);
        pot.scale.y = 0.75; pot.castShadow = true; g.add(pot);
        const lid = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), cm);
        lid.position.y = 0.12; g.add(lid);
        // Spout
        const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.15, 8),
            new THREE.MeshStandardMaterial({ color: 0xefebe9 }));
        spout.position.set(0.2, 0.05, 0);
        spout.rotation.z = -Math.PI / 4;
        g.add(spout);

        for (let i = 0; i < 3; i++) {
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 12), cm);
            cup.position.set(i * 0.22 - 0.22, -0.04, 0.28); cup.castShadow = true; g.add(cup);
        }
        g.position.set(0, 0.55, -5);
        g.userData = { interactive: true, type: 'teaset', name: 'Tea Ceremony 🍵', desc: 'Share a warm cup of tea' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    addZenGarden() {
        const g = new THREE.Group();
        const sand = new THREE.Mesh(new THREE.PlaneGeometry(3, 2),
            new THREE.MeshStandardMaterial({ color: 0xf5e6d3, roughness: 0.95 }));
        sand.rotation.x = -Math.PI / 2; sand.position.y = 0.01; sand.receiveShadow = true; g.add(sand);
        const lm = new THREE.MeshStandardMaterial({ color: 0xe8d5b7 });
        for (let i = -0.8; i <= 0.8; i += 0.12) {
            const l = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.005, 0.015), lm);
            l.position.set(0, 0.015, i); g.add(l);
        }
        const rm = new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.9 });
        [[0, 0.12, 0], [-.5, .08, .3], [.6, .1, -.2], [-.3, .06, -.4]].forEach(([x, s, z]) => {
            const r = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), rm);
            r.position.set(x, s, z); r.castShadow = true; g.add(r);
        });
        g.position.set(-7, 0, -3);
        g.userData = { interactive: true, type: 'zen', name: 'Zen Garden 🪨', desc: 'A place for meditation and peace' };
        this.scene.add(g); this.interactiveObjects.push(g);
    }

    addWishingSpot() {
        const g = new THREE.Group(); g.name = 'WishingSpot';

        // Glowing circle on the ground
        const circleMat = new THREE.MeshBasicMaterial({
            color: 0xffcc00, transparent: true, opacity: 0.08,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending
        });
        const circle = new THREE.Mesh(new THREE.CircleGeometry(1, 32), circleMat);
        circle.rotation.x = -Math.PI / 2; circle.position.y = 0.02; g.add(circle);

        // Floating star
        const starMat = new THREE.MeshBasicMaterial({
            color: 0xffcc00, transparent: true, opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), starMat);
        star.position.y = 1.5; g.add(star);

        // Star glow
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffcc00, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), glowMat);
        glow.position.y = 1.5; g.add(glow);

        g.add(new THREE.PointLight(0xffcc00, 0.6, 6));

        g.position.set(15, 0, -2);
        g.userData = { interactive: true, type: 'wish', name: 'Wishing Star 🌠', desc: 'Make a wish on a fallen star' };
        this.scene.add(g); this.interactiveObjects.push(g);

        this.animations.push({
            update: () => {
                star.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.3;
                star.rotation.y += 0.02;
                glow.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.2);
                circleMat.opacity = 0.05 + Math.sin(Date.now() * 0.002) * 0.04;
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // PARTICLES
    // ══════════════════════════════════════════════════════════════════
    createParticles() {
        this.createCherryBlossoms();
        this.createFireflies();
        this.createSteam();
        this.createDust();
    }

    createCherryBlossoms() {
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const c = new THREE.Color();
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = Math.random() * 15;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
            c.setHSL(0.95 + Math.random() * 0.05, 0.6 + Math.random() * 0.2, 0.7 + Math.random() * 0.15);
            col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.15, vertexColors: true, transparent: true, opacity: 0.7,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const blossoms = new THREE.Points(geo, mat);
        this.scene.add(blossoms);
        this.animations.push({
            update: (d) => {
                const p = blossoms.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    p[i * 3 + 1] -= 0.25 * d;
                    p[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.004;
                    p[i * 3 + 2] += Math.cos(Date.now() * 0.0008 + i) * 0.004;
                    if (p[i * 3 + 1] < -1) {
                        p[i * 3 + 1] = 12 + Math.random() * 5;
                        p[i * 3] = (Math.random() - 0.5) * 50;
                    }
                }
                blossoms.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    createFireflies() {
        const count = 100;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 35;
            pos[i * 3 + 1] = 0.3 + Math.random() * 5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.12, color: 0xffee58, transparent: true, opacity: 0.8,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const fireflies = new THREE.Points(geo, mat);
        this.scene.add(fireflies);
        this.animations.push({
            update: () => {
                const p = fireflies.geometry.attributes.position.array;
                const t = Date.now() * 0.001;
                for (let i = 0; i < count; i++) {
                    p[i * 3] += Math.sin(t + i * 0.1) * 0.006;
                    p[i * 3 + 1] += Math.cos(t * 0.5 + i * 0.1) * 0.004;
                    p[i * 3 + 2] += Math.sin(t * 0.7 + i * 0.1) * 0.006;
                }
                fireflies.geometry.attributes.position.needsUpdate = true;
                mat.opacity = 0.4 + Math.sin(t * 2) * 0.35;
            }
        });
    }

    createSteam() {
        const count = 40;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 0.25;
            pos[i * 3 + 1] = Math.random() * 0.6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.07, color: 0xffffff, transparent: true, opacity: 0.25,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        const steam = new THREE.Points(geo, mat);
        steam.position.set(0, 0.7, -5);
        this.scene.add(steam);
        this.animations.push({
            update: (d) => {
                const p = steam.geometry.attributes.position.array;
                for (let i = 0; i < count; i++) {
                    p[i * 3 + 1] += 0.25 * d;
                    p[i * 3] += (Math.random() - 0.5) * 0.002;
                    if (p[i * 3 + 1] > 0.9) {
                        p[i * 3 + 1] = 0;
                        p[i * 3] = (Math.random() - 0.5) * 0.25;
                        p[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
                    }
                }
                steam.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    createDust() {
        const count = 60;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = 0.5 + Math.random() * 5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.04, color: 0xffffff, transparent: true, opacity: 0.15,
            depthWrite: false
        });
        const dust = new THREE.Points(geo, mat);
        this.scene.add(dust);
        this.animations.push({
            update: () => {
                const p = dust.geometry.attributes.position.array;
                const t = Date.now() * 0.0005;
                for (let i = 0; i < count; i++) {
                    p[i * 3] += Math.sin(t + i) * 0.002;
                    p[i * 3 + 1] += Math.cos(t * 0.5 + i) * 0.001;
                    p[i * 3 + 2] += Math.sin(t * 0.3 + i) * 0.002;
                }
                dust.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // WEATHER SYSTEM
    // ══════════════════════════════════════════════════════════════════
    initWeatherSystem() {
        // Rain particles (hidden by default)
        const rainCount = 300;
        const rGeo = new THREE.BufferGeometry();
        const rPos = new Float32Array(rainCount * 3);
        for (let i = 0; i < rainCount; i++) {
            rPos[i * 3] = (Math.random() - 0.5) * 40;
            rPos[i * 3 + 1] = Math.random() * 20;
            rPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
        rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
        const rMat = new THREE.PointsMaterial({
            size: 0.05, color: 0x8899cc, transparent: true, opacity: 0,
            depthWrite: false, blending: THREE.AdditiveBlending
        });
        this.rainParticles = new THREE.Points(rGeo, rMat);
        this.scene.add(this.rainParticles);

        this.animations.push({
            update: (d) => {
                if (this.state.weather.current !== 'rain') {
                    rMat.opacity = Math.max(0, rMat.opacity - d * 0.5);
                    return;
                }
                rMat.opacity = Math.min(0.5, rMat.opacity + d * 0.5);
                const p = this.rainParticles.geometry.attributes.position.array;
                for (let i = 0; i < rainCount; i++) {
                    p[i * 3 + 1] -= 12 * d;
                    if (p[i * 3 + 1] < -1) {
                        p[i * 3 + 1] = 18 + Math.random() * 5;
                        p[i * 3] = (Math.random() - 0.5) * 40;
                    }
                }
                this.rainParticles.geometry.attributes.position.needsUpdate = true;
            }
        });

        // Random weather changes
        if (this.state.settings.dynamicWeather) {
            setInterval(() => {
                const weathers = ['clear', 'clear', 'clear', 'rain', 'fireflies', 'aurora'];
                this.state.weather.current = weathers[Math.floor(Math.random() * weathers.length)];
            }, 120000); // Every 2 minutes
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // AMBIENT SOUNDS
    // ══════════════════════════════════════════════════════════════════
    initAmbientSounds() {
        // Using Web Audio API for procedural ambient
        try {
            this._ambCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return; }
    }

    playAmbientCrickets() {
        if (!this._ambCtx || !this.state.settings.ambientSounds) return;
        // Procedural cricket chirp
        const ctx = this._ambCtx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 4000 + Math.random() * 1000;
        gain.gain.value = 0.008;
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.1);
    }

    // ══════════════════════════════════════════════════════════════════
    // MUSIC PLAYER
    // ══════════════════════════════════════════════════════════════════
    initMusicPlayer() {
        this.music = {
            audio: new Audio(),
            tracks: [
                { name: 'Chinuku Take', artist: 'SenSongs', file: 'public/assets/sounds/Chinuku Take-SenSongsMp3.Co.mp3' }
            ],
            current: 0,
            playing: false,
            shuffle: false,
            repeat: false
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
            volume: $('mp-volume'), volIcon: $('mp-vol-icon'),
            shuffle: $('mp-shuffle'), repeat: $('mp-repeat'),
            listToggle: $('mp-list-toggle'), tracklist: $('mp-tracklist'),
            tracks: $('mp-tracks')
        };

        if (this.music.tracks.length > 0) this.loadTrack(0);
        this.renderTrackList();

        this.mpEl.play?.addEventListener('click', () => this.togglePlay());
        this.mpEl.prev?.addEventListener('click', () => this.prevTrack());
        this.mpEl.next?.addEventListener('click', () => this.nextTrack());
        this.mpEl.volume?.addEventListener('input', (e) => {
            this.music.audio.volume = e.target.value / 100;
        });
        this.mpEl.shuffle?.addEventListener('click', () => {
            this.music.shuffle = !this.music.shuffle;
            this.mpEl.shuffle.classList.toggle('active', this.music.shuffle);
        });
        this.mpEl.repeat?.addEventListener('click', () => {
            this.music.repeat = !this.music.repeat;
            this.mpEl.repeat.classList.toggle('active', this.music.repeat);
        });
        this.mpEl.listToggle?.addEventListener('click', () => {
            this.mpEl.tracklist.classList.toggle('hidden');
        });
        this.mpEl.progressBar?.addEventListener('click', (e) => {
            const rect = this.mpEl.progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (this.music.audio.duration) this.music.audio.currentTime = pct * this.music.audio.duration;
        });

        this.music.audio.addEventListener('timeupdate', () => this.updateMusicProgress());
        this.music.audio.addEventListener('ended', () => {
            if (this.music.repeat) { this.music.audio.currentTime = 0; this.music.audio.play(); }
            else this.nextTrack();
        });
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
        this.renderTrackList();
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
        let next = this.music.shuffle
            ? Math.floor(Math.random() * this.music.tracks.length)
            : (this.music.current + 1) % this.music.tracks.length;
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

    renderTrackList() {
        if (!this.mpEl.tracks) return;
        this.mpEl.tracks.innerHTML = '';
        this.music.tracks.forEach((t, i) => {
            const d = document.createElement('div');
            d.className = 'mp-track' + (i === this.music.current ? ' playing' : '');
            d.innerHTML = `<span class="mp-track-num">${i + 1}</span><span class="mp-track-name">${t.name}</span><span class="mp-track-dur">${t.artist}</span>`;
            d.addEventListener('click', () => {
                this.loadTrack(i);
                this.music.audio.play().catch(() => {});
                this.music.playing = true;
                if (this.mpEl.play) this.mpEl.play.innerHTML = '<i class="fas fa-pause"></i>';
                document.querySelector('.music-player')?.classList.add('playing');
            });
            this.mpEl.tracks.appendChild(d);
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // GAME DATA — LOAD / SAVE
    // ══════════════════════════════════════════════════════════════════
    async loadGameData() {
        // Load letters from JSON
        try {
            const r = await fetch('letters.json');
            if (r.ok) {
                const letters = await r.json();
                this.state.letters = letters;
            }
        } catch {
            this.state.letters = this.defaultLetters();
        }

        // Load plant data
        try {
            const r = await fetch('plant-data.json');
            if (r.ok) Object.assign(this.state.plant, await r.json());
        } catch {}

        // Load saved data
        try {
            const s = localStorage.getItem('tanmai_save_v5');
            if (s) {
                const d = JSON.parse(s);
                if (d.plant) Object.assign(this.state.plant, d.plant);
                if (d.letters) this.state.letters = d.letters;
                if (d.sentLetters) this.state.sentLetters = d.sentLetters;
                if (d.wishes) this.state.wishes = d.wishes;
                if (d.diary) this.state.diary = d.diary;
                if (d.achievements) this.state.achievements = d.achievements;
                if (d.stats) Object.assign(this.state.stats, d.stats);
                if (d.settings) Object.assign(this.state.settings, d.settings);
            }
        } catch {}

        // Calculate days alive
        const start = new Date('2025-02-15');
        this.state.plant.day = Math.max(1, Math.floor((Date.now() - start) / 86400000));

        // Update plant stage
        this.updatePlantStage();
    }

    defaultLetters() {
        return [
            { id: 1, date: '2025-02-15T10:30:00Z', title: 'Welcome to Our Sanctuary 🏠', content: 'My dearest Tanmai, this virtual sanctuary is created just for you. Every element here represents something about our love. The bonsai grows with our care, the TV shows our memories, and this entire world exists because of you.', mood: 'love' },
            { id: 2, date: '2025-02-14T09:00:00Z', title: "Valentine's Day Special ❤️", content: "Happy Valentine's Day, my love! Every day with you feels like Valentine's Day. Your love colors my world in ways I never imagined possible. Forever yours.", mood: 'love' },
            { id: 3, date: '2025-02-01T20:15:00Z', title: 'Just Because 💛', content: 'My beautiful Tanmai, I created this virtual sanctuary for you because you deserve a peaceful place all your own.', mood: 'grateful' },
            { id: 4, date: '2025-01-20T14:45:00Z', title: 'Our Adventures Together 🌸', content: 'Remember our moments together? Every laugh, every quiet moment, every silly conversation. I never want it to end.', mood: 'happy' }
        ];
    }

    save() {
        try {
            localStorage.setItem('tanmai_save_v5', JSON.stringify({
                plant: this.state.plant,
                letters: this.state.letters,
                sentLetters: this.state.sentLetters,
                wishes: this.state.wishes,
                diary: this.state.diary,
                achievements: this.state.achievements,
                stats: this.state.stats,
                settings: this.state.settings
            }));
            this.notify('Journey saved! 💾', 'success');
        } catch {}
    }

    // ══════════════════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════════════════
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
                if (!this.state.photoMode) {
                    document.getElementById('pause-menu')?.classList.remove('hidden');
                }
            }
        });

        document.addEventListener('keydown', e => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'Escape') {
                if (this.state.photoMode) {
                    this.exitPhotoMode();
                } else if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
            }
            if ((e.key === 'e' || e.key === 'E') && this._currentInteractive) {
                this.interact(this._currentInteractive);
            }
            if (e.key === 'f' || e.key === 'F') this.toggleFlashlight();
            if (e.key === 'Tab') { e.preventDefault(); this.showModal('modal-diary'); this.loadDiary(); }
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

        // Menu Buttons
        document.getElementById('btn-start')?.addEventListener('click', () => this.start());
        document.getElementById('btn-continue')?.addEventListener('click', () => this.start());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.resume());
        document.getElementById('btn-save')?.addEventListener('click', () => this.save());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.showModal('settings-panel'));
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quit());

        // HUD Actions
        document.getElementById('act-water')?.addEventListener('click', () => this.waterPlant());
        document.getElementById('act-letter')?.addEventListener('click', () => { this.showModal('modal-letter'); this.loadLetters(); });
        document.getElementById('act-photo')?.addEventListener('click', () => this.enterPhotoMode());
        document.getElementById('act-wish')?.addEventListener('click', () => { this.showModal('modal-wish'); this.loadWishes(); });
        document.getElementById('act-diary')?.addEventListener('click', () => { this.showModal('modal-diary'); this.loadDiary(); });
        document.getElementById('act-flashlight')?.addEventListener('click', () => this.toggleFlashlight());

        // Plant modal
        document.getElementById('btn-water')?.addEventListener('click', () => this.waterPlant());
        document.getElementById('btn-fert')?.addEventListener('click', () => {
            this.state.plant.growth = Math.min(1, this.state.plant.growth + 0.05);
            this.updatePlantStage();
            this.notify('Fertilizer added! Growth boosted 🌱', 'success');
            this.playFx('success');
        });
        document.getElementById('btn-sing')?.addEventListener('click', () => this.singToPlant());

        // Letter modal
        document.getElementById('btn-send-letter')?.addEventListener('click', () => this.sendLetter());

        // Letter tabs
        document.querySelectorAll('.ltab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.ltab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.letter-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                if (target === 'received') document.getElementById('letters-list')?.classList.add('active');
                else if (target === 'sent') { document.getElementById('letters-sent')?.classList.add('active'); this.loadSentLetters(); }
                else if (target === 'compose') document.getElementById('letters-compose')?.classList.add('active');
            });
        });

        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Wish
        document.getElementById('btn-make-wish')?.addEventListener('click', () => this.makeWish());

        // Diary
        document.getElementById('btn-diary-save')?.addEventListener('click', () => this.saveDiaryEntry());

        // Photo mode
        document.getElementById('photo-snap')?.addEventListener('click', () => this.takePhotoInMode());
        document.getElementById('photo-filter')?.addEventListener('click', () => this.cyclePhotoFilter());
        document.getElementById('photo-exit')?.addEventListener('click', () => this.exitPhotoMode());

        // Close modals
        document.querySelectorAll('[data-close]').forEach(b => {
            b.addEventListener('click', () => this.closeModals());
        });

        // Settings
        document.getElementById('set-sens')?.addEventListener('input', (e) => {
            this.state.settings.mouseSens = e.target.value * 0.001;
        });
        document.getElementById('set-bloom')?.addEventListener('input', (e) => {
            if (this.bloomPass) this.bloomPass.strength = e.target.value / 10;
        });
        document.getElementById('set-weather')?.addEventListener('change', (e) => {
            this.state.settings.dynamicWeather = e.target.checked;
        });
        document.getElementById('set-ambient')?.addEventListener('change', (e) => {
            this.state.settings.ambientSounds = e.target.checked;
        });

        // Ambient cricket chirps
        this._cricketTimer = setInterval(() => {
            if (this.state.started && !this.state.paused) this.playAmbientCrickets();
        }, 3000 + Math.random() * 5000);
    }

    // ══════════════════════════════════════════════════════════════════
    // GAME ACTIONS
    // ══════════════════════════════════════════════════════════════════
    start() {
        document.getElementById('main-menu')?.classList.add('hidden');
        this.state.started = true;
        this.state.paused = false;
        document.getElementById('game-canvas')?.requestPointerLock();
        this.playFx('success');
        this.checkAchievement('first_steps');

        // Cinematic intro
        this.playCinematic(() => {
            this.notify('Welcome to your sanctuary, Tanmai 🌸', 'love');
        });
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
        this.save();
    }

    playCinematic(callback) {
        const top = document.getElementById('cinema-top');
        const bottom = document.getElementById('cinema-bottom');
        if (top) top.classList.add('active');
        if (bottom) bottom.classList.add('active');
        setTimeout(() => {
            if (top) top.classList.remove('active');
            if (bottom) bottom.classList.remove('active');
            if (callback) callback();
        }, 2500);
    }

    // Plant
    waterPlant() {
        this.state.plant.health = Math.min(100, this.state.plant.health + 12);
        this.state.plant.growth = Math.min(1, this.state.plant.growth + 0.04);
        this.state.plant.hydration = Math.min(100, this.state.plant.hydration + 30);
        this.state.plant.waterCount++;
        this.state.plant.lastWatered = new Date().toISOString();
        this.updatePlantStage();
        this.playFx('water');
        this.notify('Plant watered! 💧 It looks happier!', 'success');
        if (this.state.plant.waterCount >= 10) this.checkAchievement('green_thumb');
        this.save();
    }

    singToPlant() {
        this.state.plant.health = Math.min(100, this.state.plant.health + 5);
        this.state.plant.growth = Math.min(1, this.state.plant.growth + 0.02);
        this.playFx('success');
        this.notify('🎵 You sang a sweet melody... The plant dances gently!', 'love');
        this.checkAchievement('musician');
        this.updatePlantStage();
    }

    updatePlantStage() {
        const g = this.state.plant.growth;
        let stage = 'seedling';
        if (g >= 0.9) stage = 'legendary';
        else if (g >= 0.75) stage = 'blooming';
        else if (g >= 0.55) stage = 'mature';
        else if (g >= 0.35) stage = 'young';
        else if (g >= 0.15) stage = 'sprout';

        if (stage !== this.state.plant.stage) {
            this.state.plant.stage = stage;
            if (stage === 'blooming') {
                this.state.plant.bloomCount++;
                this.checkAchievement('bloom');
                this.notify('🌸 The bonsai has BLOOMED! Beautiful!', 'love');
            }
            if (stage === 'legendary') {
                this.checkAchievement('legendary_plant');
                this.notify('🏆 LEGENDARY BLOOM! The bonsai has reached its ultimate form!', 'love');
            }
        }

        const stageEl = document.getElementById('plant-stage');
        if (stageEl) {
            const labels = {
                seedling: 'Seedling Stage 🌱',
                sprout: 'Sprout Stage 🌿',
                young: 'Young Tree 🌳',
                mature: 'Mature Bonsai 🎋',
                blooming: 'Blooming! 🌸',
                legendary: '✨ Legendary Bloom ✨'
            };
            stageEl.textContent = labels[stage] || stage;
        }
    }

    // Photo Mode
    enterPhotoMode() {
        this.state.photoMode = true;
        this.state.photoFilter = 0;
        document.getElementById('photo-mode')?.classList.remove('hidden');
        document.getElementById('photo-filter-name').textContent = this.photoFilters[0].name;
        this.renderer.domElement.style.filter = this.photoFilters[0].css;
        this.playCinematic();
    }

    exitPhotoMode() {
        this.state.photoMode = false;
        document.getElementById('photo-mode')?.classList.add('hidden');
        this.renderer.domElement.style.filter = 'none';
    }

    cyclePhotoFilter() {
        this.state.photoFilter = (this.state.photoFilter + 1) % this.photoFilters.length;
        const f = this.photoFilters[this.state.photoFilter];
        this.renderer.domElement.style.filter = f.css;
        document.getElementById('photo-filter-name').textContent = f.name;
    }

    takePhotoInMode() {
        // Temporarily remove filter for clean capture, then re-apply
        const canvas = this.renderer.domElement;
        const currentFilter = canvas.style.filter;
        // Apply filter via canvas
        const img = canvas.toDataURL('image/png');
        this.state.memories.push({
            id: Date.now(), image: img, date: new Date().toISOString(),
            filter: this.photoFilters[this.state.photoFilter].name
        });
        this.playFx('click');
        this.notify('📸 Memory captured!', 'success');
        this.state.stats.photosTotal++;
        if (this.state.stats.photosTotal === 1) this.checkAchievement('photographer');
        if (this.state.stats.photosTotal >= 10) this.checkAchievement('collector');
        this.save();
    }

    takePhoto() {
        const img = this.renderer.domElement.toDataURL('image/png');
        this.state.memories.push({ id: Date.now(), image: img, date: new Date().toISOString(), filter: 'Normal' });
        this.playFx('click');
        this.notify('📸 Photo captured!', 'success');
        this.state.stats.photosTotal++;
        if (this.state.stats.photosTotal === 1) this.checkAchievement('photographer');
    }

    // Letters
    sendLetter() {
        const titleInput = document.getElementById('letter-title');
        const ta = document.getElementById('letter-input');
        const activeMood = document.querySelector('.mood-btn.active');
        if (!ta || !ta.value.trim()) { this.notify('Write something first! ✍️', 'info'); return; }

        const letter = {
            id: Date.now(),
            date: new Date().toISOString(),
            title: (titleInput?.value.trim()) || 'A Love Letter ❤️',
            content: ta.value.trim(),
            mood: activeMood?.dataset.mood || 'love'
        };

        this.state.sentLetters.push(letter);
        if (ta) ta.value = '';
        if (titleInput) titleInput.value = '';

        this.playFx('success');
        this.notify('Letter sealed and sent with love! 💌', 'love');

        if (this.state.sentLetters.length === 1) this.checkAchievement('poet');
        if (this.state.sentLetters.length >= 10) this.checkAchievement('letter_master');

        this.save();
    }

    // Wishes
    makeWish() {
        const input = document.getElementById('wish-input');
        if (!input || !input.value.trim()) { this.notify('Write your wish first! ⭐', 'info'); return; }

        this.state.wishes.push({
            id: Date.now(),
            text: input.value.trim(),
            date: new Date().toISOString()
        });

        input.value = '';
        this.playFx('success');
        this.notify('🌠 Your wish has been released into the stars!', 'love');

        if (this.state.wishes.length === 1) this.checkAchievement('stargazer');
        if (this.state.wishes.length >= 5) this.checkAchievement('wishing_well');

        this.loadWishes();
        this.save();

        // Visual: spawn a particle going up
        this.spawnWishParticle();
    }

    spawnWishParticle() {
        const geo = new THREE.SphereGeometry(0.2, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffcc00, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const star = new THREE.Mesh(geo, mat);
        star.position.copy(this.camera.position);
        star.position.y += 0.5;
        this.scene.add(star);

        let life = 0;
        const anim = {
            update: (d) => {
                life += d;
                star.position.y += 3 * d;
                star.position.x += Math.sin(life * 3) * 0.02;
                mat.opacity = Math.max(0, 0.9 - life * 0.3);
                if (life > 3) {
                    this.scene.remove(star);
                    this.animations = this.animations.filter(a => a !== anim);
                }
            }
        };
        this.animations.push(anim);
    }

    // Diary
    saveDiaryEntry() {
        const input = document.getElementById('diary-input');
        if (!input || !input.value.trim()) { this.notify('Write something first! ✍️', 'info'); return; }

        this.state.diary.push({
            id: Date.now(),
            text: input.value.trim(),
            date: new Date().toISOString()
        });

        input.value = '';
        this.playFx('success');
        this.notify('📖 Diary entry saved!', 'success');
        if (this.state.diary.length === 1) this.checkAchievement('diarist');
        this.loadDiary();
        this.save();
    }

    // ══════════════════════════════════════════════════════════════════
    // ACHIEVEMENTS
    // ══════════════════════════════════════════════════════════════════
    checkAchievement(id) {
        if (this.state.achievements.includes(id)) return;
        const def = this.achievementDefs[id];
        if (!def) return;

        this.state.achievements.push(id);
        this.save();

        // Show toast
        const toast = document.getElementById('achievement-toast');
        const icon = document.getElementById('ach-icon');
        const name = document.getElementById('ach-name');
        if (toast && icon && name) {
            toast.classList.remove('hidden');
            icon.textContent = def.icon;
            name.textContent = def.name;
            setTimeout(() => toast.classList.add('show'), 50);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.classList.add('hidden'), 500);
            }, 4000);
        }

        this.playFx('achievement');
        console.log(`🏆 Achievement: ${def.name}`);
    }

    // ══════════════════════════════════════════════════════════════════
    // UI RENDERING
    // ══════════════════════════════════════════════════════════════════
    updateHUD() {
        const now = new Date();
        const el = id => document.getElementById(id);
        const set = (id, v) => { const e = el(id); if (e) e.textContent = v; };

        set('hud-clock', now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
        set('hud-date', now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        set('hud-plant-day', this.state.plant.day);
        set('hud-letters', this.state.letters.length + this.state.sentLetters.length);
        set('hud-photos', this.state.memories.length);
        set('hud-wishes', this.state.wishes.length);

        // Plant modal bars
        const hb = el('bar-health'); if (hb) hb.style.width = this.state.plant.health + '%';
        set('val-health', Math.round(this.state.plant.health) + '%');
        const gb = el('bar-growth'); if (gb) gb.style.width = Math.round(this.state.plant.growth * 100) + '%';
        set('val-growth', Math.round(this.state.plant.growth * 100) + '%');
        const hyb = el('bar-hydration'); if (hyb) hyb.style.width = Math.round(this.state.plant.hydration) + '%';
        set('val-hydration', Math.round(this.state.plant.hydration) + '%');
        set('val-days', this.state.plant.day);
        set('val-waters', this.state.plant.waterCount);
        set('val-blooms', this.state.plant.bloomCount);

        // Zone detection
        const px = this.camera.position.x;
        const pz = this.camera.position.z;
        let zone = 'Main Room';
        if (px > 8) zone = 'Terrace';
        else if (px < -5 && pz > -5) zone = 'Zen Garden';
        else if (pz < -7) zone = 'Study Nook';
        this.state.player.zone = zone;
        set('hud-location', { 'Main Room': '🏠 Main Room', 'Terrace': '🌙 Terrace', 'Zen Garden': '🪨 Zen Garden', 'Study Nook': '📚 Study Nook' }[zone] || zone);

        // Compass
        const arrow = el('compass-arrow');
        if (arrow) {
            const yaw = this.camera.rotation.y * (180 / Math.PI);
            arrow.style.transform = `rotate(${yaw}deg)`;
        }

        // Hydration decay
        this.state.plant.hydration = Math.max(0, this.state.plant.hydration - 0.001);

        // Weather icon
        const wi = el('hud-weather-icon');
        if (wi) {
            const icons = { clear: '🌙', rain: '🌧️', snow: '❄️', fireflies: '✨', aurora: '🌌' };
            wi.innerHTML = icons[this.state.weather.current] || '🌙';
        }

        // Play time tracking
        this.state.stats.totalPlayTime += 1 / 60; // Approx per frame at 60fps
        if (this.state.stats.totalPlayTime > 30) this.checkAchievement('night_owl');
    }

    showModal(id) {
        document.getElementById(id)?.classList.add('active');
        if (id === 'modal-letter') this.loadLetters();
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    }

    loadLetters() {
        const c = document.getElementById('letters-list');
        if (!c) return;
        c.innerHTML = '';
        this.state.letters.forEach(l => {
            const d = document.createElement('div');
            d.className = 'letter-item';
            const moodEmoji = { love: '❤️', happy: '😊', miss: '🥺', grateful: '🙏', excited: '🎉' };
            d.innerHTML = `
                <div class="letter-date"><i class="fas fa-calendar"></i> ${new Date(l.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <h4>${l.title}</h4>
                <div class="letter-content">${l.content}</div>
                ${l.mood ? `<span class="letter-mood-tag">${moodEmoji[l.mood] || ''} ${l.mood}</span>` : ''}
            `;
            c.appendChild(d);
        });
    }

    loadSentLetters() {
        const c = document.getElementById('letters-sent');
        if (!c) return;
        c.innerHTML = '';
        if (this.state.sentLetters.length === 0) {
            c.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:40px">No letters sent yet. Write one! ✍️</p>';
            return;
        }
        this.state.sentLetters.forEach(l => {
            const d = document.createElement('div');
            d.className = 'letter-item';
            const moodEmoji = { love: '❤️', happy: '😊', miss: '🥺', grateful: '🙏', excited: '🎉' };
            d.innerHTML = `
                <div class="letter-date"><i class="fas fa-calendar"></i> ${new Date(l.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <h4>${l.title}</h4>
                <div class="letter-content">${l.content}</div>
                ${l.mood ? `<span class="letter-mood-tag">${moodEmoji[l.mood] || ''} ${l.mood}</span>` : ''}
            `;
            c.appendChild(d);
        });
    }

    loadGallery() {
        const main = document.getElementById('gallery-main');
        const thumbs = document.getElementById('gallery-thumbs');
        if (!main || !thumbs) return;
        if (this.state.memories.length === 0) {
            main.innerHTML = `<div class="gallery-empty"><i class="fas fa-camera-retro"></i><p>Take photos with 📷 to fill this gallery!</p></div>`;
            thumbs.innerHTML = '';
            return;
        }
        const latest = this.state.memories[this.state.memories.length - 1];
        main.innerHTML = `<img src="${latest.image}" alt="Memory">`;
        thumbs.innerHTML = '';
        this.state.memories.forEach((m, i) => {
            const t = document.createElement('div');
            t.className = 'gallery-thumb' + (i === this.state.memories.length - 1 ? ' active' : '');
            t.innerHTML = `<img src="${m.image}">`;
            t.addEventListener('click', () => {
                main.innerHTML = `<img src="${m.image}" alt="Memory">`;
                thumbs.querySelectorAll('.gallery-thumb').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
            });
            thumbs.appendChild(t);
        });
    }

    loadWishes() {
        const c = document.getElementById('wish-list');
        if (!c) return;
        c.innerHTML = '';
        this.state.wishes.slice().reverse().forEach(w => {
            const d = document.createElement('div');
            d.className = 'wish-item';
            d.innerHTML = `${w.text}<div class="wish-item-date">${new Date(w.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>`;
            c.appendChild(d);
        });
    }

    loadDiary() {
        const c = document.getElementById('diary-timeline');
        if (!c) return;
        c.innerHTML = '';
        if (this.state.diary.length === 0) {
            c.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:20px">No diary entries yet. Start writing! ✍️</p>';
            return;
        }
        this.state.diary.slice().reverse().forEach(entry => {
            const d = new Date(entry.date);
            const div = document.createElement('div');
            div.className = 'diary-entry';
            div.innerHTML = `
                <div class="diary-date-badge">
                    <span class="ddb-day">${d.getDate()}</span>
                    <span class="ddb-month">${d.toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div class="diary-text">${entry.text}</div>
            `;
            c.appendChild(div);
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
        }, 4000);
    }

    // ══════════════════════════════════════════════════════════════════
    // INTERACTIONS
    // ══════════════════════════════════════════════════════════════════
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
        this.state.stats.interactionsCount++;

        switch (obj.userData.type) {
            case 'plant': this.showModal('modal-plant'); break;
            case 'tv': this.showModal('modal-tv'); this.loadGallery(); break;
            case 'postbox': this.showModal('modal-letter'); this.loadLetters(); break;
            case 'wish': this.showModal('modal-wish'); this.loadWishes(); break;
            case 'teaset':
                this.notify('The tea is still warm... 🍵 A moment of peace with you.', 'love');
                break;
            case 'zen':
                this.notify('The zen garden brings peace 🧘 Breathe deeply...', 'info');
                // Brief meditation effect
                if (this.bloomPass) {
                    const orig = this.bloomPass.strength;
                    this.bloomPass.strength = 2.0;
                    setTimeout(() => { if (this.bloomPass) this.bloomPass.strength = orig; }, 2000);
                }
                break;
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // PHYSICS
    // ══════════════════════════════════════════════════════════════════
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

            // Head bob
            const bobSpeed = 8;
            const bobAmount = 0.03;
            this.camera.position.y = 1.6 + Math.sin(Date.now() * 0.001 * bobSpeed) * bobAmount;

            // Step counting
            if (pos.distanceTo(this._lastStepPos) > 2) {
                this.state.stats.stepsWalked++;
                this._lastStepPos.copy(pos);
            }
        }

        // Jump
        if (this.keys[' '] && this.state.player.canJump) {
            this.physVelY = 6; this.state.player.canJump = false;
        }

        this.state.player.pos.copy(pos);
    }

    // ══════════════════════════════════════════════════════════════════
    // GAME LOOP
    // ══════════════════════════════════════════════════════════════════
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

    // ══════════════════════════════════════════════════════════════════
    // SOUND EFFECTS
    // ══════════════════════════════════════════════════════════════════
    playFx(name) {
        try {
            if (!this._actx) this._actx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._actx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.connect(ctx.destination); osc.connect(gain);
            gain.gain.value = 0.04;
            const now = ctx.currentTime;

            switch (name) {
                case 'click':
                    osc.frequency.value = 800;
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.start(); osc.stop(now + 0.1);
                    break;
                case 'water':
                    osc.type = 'sine'; osc.frequency.value = 400;
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
                case 'achievement':
                    // Fanfare
                    [523, 659, 784, 1046].forEach((freq, i) => {
                        const o = ctx.createOscillator(), g = ctx.createGain();
                        o.frequency.value = freq; g.gain.value = 0.04;
                        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15 * i + 0.3);
                        o.connect(g); g.connect(ctx.destination);
                        o.start(now + 0.12 * i); o.stop(now + 0.12 * i + 0.3);
                    });
                    break;
            }
        } catch {}
    }
}

// ═══ LAUNCH ═══
window.addEventListener('DOMContentLoaded', () => { window.game = new GameEngine(); });