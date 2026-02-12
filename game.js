// ═══════════════════════════════════════════════════════════════════════════
// TAN'S HOME — ENHANCED EDITION v7.0
// Ultra-optimized 3D Valentine Sanctuary with Garden Growth System
// ═══════════════════════════════════════════════════════════════════════════

class GameEngine {
    constructor() {
        // Core Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.clock = new THREE.Clock();
        this.keys = {};
        this.delta = 0;

        // Performance optimizations
        this.instancedMeshes = new Map();
        this.objectPool = new Map();
        this.frustumCulling = true;
        this.LODEnabled = true;

        // State management
        this.state = {
            loaded: false,
            started: false,
            paused: false,
            letterRead: false,
            fireworksActive: false,
            valentineShown: false,
            flashlight: false,
            photoMode: false,
            photoFilter: 0,
            onRoof: false,
            musicVisualizerActive: false,
            gardenLevel: 1, // VS Code garden-style growth
            gardenXP: 0,
            dailyStreak: 0,
            achievements: [],
            player: { 
                pos: new THREE.Vector3(0, 1.6, 3), 
                vel: new THREE.Vector3(0, 0, 0),
                canMove: false, 
                canJump: true,
                speed: 0.08,
                jumpPower: 0.15
            },
            settings: { 
                mouseSens: 0.002, 
                bloom: true, 
                particles: true,
                shadows: true,
                quality: 'high' // high, medium, low
            },
            memories: [],
            slideshowIndex: 0,
            slideshowTimer: 0,
            weather: 'stars', // stars, rain, snow, sakura
            timeOfDay: 20 // 0-24 hour
        };

        // Collections
        this.interactiveObjects = [];
        this.animations = [];
        this.fireworks = [];
        this.particles = [];
        this.birds = [];
        this.fish = [];
        this.physVelY = 0;
        this.flashlightObj = null;
        this._currentInteractive = null;
        this.mixer = null;

        // Garden growth system (VS Code style)
        this.gardenStages = [
            { level: 1, name: '🌱 Seedling', xpNeeded: 0, scale: 0.3, color: 0x88ff88 },
            { level: 2, name: '🌿 Sprout', xpNeeded: 100, scale: 0.5, color: 0x66dd66 },
            { level: 3, name: '🌳 Young Tree', xpNeeded: 300, scale: 0.75, color: 0x44bb44 },
            { level: 4, name: '🌸 Blooming', xpNeeded: 600, scale: 1.0, color: 0xffaacc },
            { level: 5, name: '🏵️ Magnificent', xpNeeded: 1000, scale: 1.3, color: 0xff66aa },
            { level: 6, name: '✨ Transcendent', xpNeeded: 2000, scale: 1.6, color: 0xff4488 }
        ];

        // Images configuration
        this.tanImages = [
            'https://picsum.photos/seed/tan1/800/600',
            'https://picsum.photos/seed/tan2/800/600',
            'https://picsum.photos/seed/tan3/800/600',
            'https://picsum.photos/seed/tan4/800/600',
            'https://picsum.photos/seed/tan5/800/600',
            'https://picsum.photos/seed/tan6/800/600'
        ];
        this.bigPortrait = 'https://picsum.photos/seed/tanportrait/600/800';
        
        this.photoFilters = [
            { name: 'Normal', css: 'none' },
            { name: 'Warm Memory', css: 'sepia(0.3) saturate(1.3) brightness(1.05)' },
            { name: 'Rose Tinted', css: 'hue-rotate(-10deg) saturate(1.5) brightness(1.1)' },
            { name: 'Vintage', css: 'sepia(0.5) contrast(1.1) brightness(0.9)' },
            { name: 'Dreamy', css: 'blur(0.5px) saturate(1.4) brightness(1.15)' },
            { name: 'Sakura', css: 'hue-rotate(-20deg) saturate(1.8) brightness(1.05) contrast(0.95)' }
        ];

        this.init();
    }

    // ══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ══════════════════════════════════════════════════════════════════
    async init() {
        try {
            this.initLoaderParticles();
            this.progress(5, 'Waking up the universe...');
            await this.sleep(150);
            
            this.progress(10, 'Creating renderer...');
            this.initRenderer();
            
            this.progress(15, 'Building the cosmos...');
            this.initScene();
            this.initCamera();
            
            this.progress(20, 'Post-processing magic...');
            this.initPostProcessing();
            
            this.progress(25, 'Painting light...');
            this.initLighting();
            
            this.progress(35, 'Building Tan\'s Home...');
            this.buildWorld();
            
            this.progress(50, 'Painting the sky...');
            this.createEnhancedSky();
            
            this.progress(60, 'Releasing the creatures...');
            this.createEnhancedBirds();
            this.createEnhancedFish();
            
            this.progress(70, 'Cherry blossoms falling...');
            this.createEnhancedParticles();
            
            this.progress(78, 'Growing the garden...');
            this.initGardenSystem();
            
            this.progress(84, 'Tuning music...');
            this.initMusicPlayer();
            this.initMusicVisualizer();
            
            this.progress(90, 'Loading slideshow...');
            this.initSlideshow();
            
            this.progress(95, 'Preparing magic...');
            this.initFlashlight();
            this.initPhotoMode();
            
            this.progress(100, 'Welcome home, Tan ♥');
            this.setupEvents();
            this.loadSavedProgress();
            
            this.state.loaded = true;
            await this.sleep(800);
            
            const ls = document.getElementById('loading-screen');
            if (ls) {
                ls.classList.add('fade-out');
                setTimeout(() => ls.style.display = 'none', 1200);
            }
            
            this.gameLoop();
            this.showWelcomeMessage();
            
        } catch (e) {
            console.error('Init failed:', e);
            document.body.innerHTML = `<div style="color:#fff;padding:40px;font-family:sans-serif;text-align:center"><h2>Failed to load</h2><p>${e.message}</p></div>`;
        }
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: window.devicePixelRatio < 2,
            powerPreference: 'high-performance',
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.shadowMap.enabled = this.state.settings.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x05051a, 0.015);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.copy(this.state.player.pos);
        this.camera.rotation.order = 'YXZ';
    }

    initPostProcessing() {
        if (!this.state.settings.bloom) return;
        
        this.composer = new THREE.EffectComposer(this.renderer);
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,  // strength
            0.4,  // radius
            0.85  // threshold
        );
        this.composer.addPass(bloomPass);
    }

    initLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x4466aa, 0.3);
        this.scene.add(ambient);

        // Moon light (directional)
        const moonLight = new THREE.DirectionalLight(0xaaccff, 0.8);
        moonLight.position.set(20, 40, 10);
        moonLight.castShadow = this.state.settings.shadows;
        if (this.state.settings.shadows) {
            moonLight.shadow.mapSize.width = 2048;
            moonLight.shadow.mapSize.height = 2048;
            moonLight.shadow.camera.near = 0.5;
            moonLight.shadow.camera.far = 100;
            moonLight.shadow.camera.left = -30;
            moonLight.shadow.camera.right = 30;
            moonLight.shadow.camera.top = 30;
            moonLight.shadow.camera.bottom = -30;
        }
        this.scene.add(moonLight);

        // Warm point lights
        const warmLight1 = new THREE.PointLight(0xff8866, 1.5, 15);
        warmLight1.position.set(-5, 3, 0);
        this.scene.add(warmLight1);

        const warmLight2 = new THREE.PointLight(0xffaa77, 1.2, 12);
        warmLight2.position.set(5, 2.5, -5);
        this.scene.add(warmLight2);

        // Romantic glow
        const glowLight = new THREE.PointLight(0xff6b8b, 2, 8);
        glowLight.position.set(0, 2, -3);
        this.scene.add(glowLight);
    }

    // ══════════════════════════════════════════════════════════════════
    // WORLD BUILDING - Enhanced & Optimized
    // ══════════════════════════════════════════════════════════════════
    buildWorld() {
        this.createFloor();
        this.createWalls();
        this.createFurniture();
        this.createBonsaiPlant();
        this.createTV();
        this.createPortrait();
        this.createRoof();
        this.createLetterbox();
        this.createDecorations();
    }

    createFloor() {
        const geometry = new THREE.PlaneGeometry(50, 50);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add subtle grid pattern
        const gridHelper = new THREE.GridHelper(50, 50, 0x2a2a3e, 0x1a1a2e);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    createWalls() {
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x16162a,
            roughness: 0.9,
            metalness: 0.05
        });

        // Back wall
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 0.3), wallMaterial);
        backWall.position.set(0, 4, -10);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // Side walls
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 20), wallMaterial);
        leftWall.position.set(-10, 4, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 20), wallMaterial);
        rightWall.position.set(10, 4, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }

    createFurniture() {
        // Couch
        const couchGroup = new THREE.Group();
        const couchBody = new THREE.Mesh(
            new THREE.BoxGeometry(4, 0.8, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x4a3c5a, roughness: 0.7 })
        );
        couchBody.position.y = 0.4;
        couchBody.castShadow = true;
        couchGroup.add(couchBody);

        const couchBack = new THREE.Mesh(
            new THREE.BoxGeometry(4, 1.2, 0.3),
            new THREE.MeshStandardMaterial({ color: 0x3a2c4a, roughness: 0.7 })
        );
        couchBack.position.set(0, 1.2, -0.75);
        couchBack.castShadow = true;
        couchGroup.add(couchBack);

        couchGroup.position.set(0, 0, 5);
        this.scene.add(couchGroup);

        // Coffee table
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.1, 1),
            new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.4, metalness: 0.2 })
        );
        table.position.set(0, 0.5, 3);
        table.castShadow = true;
        table.receiveShadow = true;
        this.scene.add(table);

        // Table legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.6 });
        
        [[-0.8, -0.4], [0.8, -0.4], [-0.8, 0.4], [0.8, 0.4]].forEach(([x, z]) => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(x, 0.25, 3 + z);
            leg.castShadow = true;
            this.scene.add(leg);
        });
    }

    createBonsaiPlant() {
        const bonsaiGroup = new THREE.Group();
        
        // Pot
        const potGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.3, 8);
        const potMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513, 
            roughness: 0.8 
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.y = 0.15;
        pot.castShadow = true;
        bonsaiGroup.add(pot);

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a3428, 
            roughness: 0.9 
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.7;
        trunk.rotation.z = 0.1;
        trunk.castShadow = true;
        bonsaiGroup.add(trunk);

        // Canopy (will be animated based on growth level)
        const canopyGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const canopyMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ff88,
            emissive: 0x224422,
            emissiveIntensity: 0.2,
            roughness: 0.7
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.set(0.15, 1.3, 0);
        canopy.scale.set(0.8, 0.8, 0.8);
        canopy.castShadow = true;
        bonsaiGroup.add(canopy);

        this.bonsaiCanopy = canopy; // Reference for growth animation

        // Glow effect
        const glowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ff88,
            transparent: true,
            opacity: 0.1
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(canopy.position);
        bonsaiGroup.add(glow);

        bonsaiGroup.position.set(-3, 0.5, 2);
        this.scene.add(bonsaiGroup);
        this.bonsaiGroup = bonsaiGroup;

        // Make interactive
        this.interactiveObjects.push({
            object: bonsaiGroup,
            type: 'plant',
            name: 'Bonsai Garden',
            description: 'Water and nurture your love',
            onInteract: () => this.openPlantModal()
        });
    }

    createTV() {
        const tvGroup = new THREE.Group();
        
        // TV Stand
        const standGeometry = new THREE.BoxGeometry(3, 0.6, 1);
        const standMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 });
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.y = 0.3;
        stand.castShadow = true;
        tvGroup.add(stand);

        // TV Frame
        const frameGeometry = new THREE.BoxGeometry(2.8, 1.8, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = 1.5;
        frame.castShadow = true;
        tvGroup.add(frame);

        // TV Screen (will show slideshow)
        const screenGeometry = new THREE.PlaneGeometry(2.6, 1.6);
        const screenMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000,
            emissive: 0x333333,
            emissiveIntensity: 0.5
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 1.5, 0.06);
        tvGroup.add(screen);
        this.tvScreen = screen;

        tvGroup.position.set(6, 0, -8);
        tvGroup.rotation.y = -Math.PI * 0.15;
        this.scene.add(tvGroup);

        // Make interactive
        this.interactiveObjects.push({
            object: tvGroup,
            type: 'tv',
            name: 'Memory Slideshow',
            description: 'Watch our moments together',
            onInteract: () => this.cycleSlideshow()
        });
    }

    createPortrait() {
        const portraitGroup = new THREE.Group();
        
        // Frame
        const frameGeometry = new THREE.BoxGeometry(1.2, 1.8, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b6914, 
            roughness: 0.4,
            metalness: 0.6
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.castShadow = true;
        portraitGroup.add(frame);

        // Portrait image
        const portraitGeometry = new THREE.PlaneGeometry(1, 1.6);
        const portraitMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            emissive: 0x222222,
            emissiveIntensity: 0.3
        });
        const portrait = new THREE.Mesh(portraitGeometry, portraitMaterial);
        portrait.position.z = 0.06;
        portraitGroup.add(portrait);

        // Glow
        const glowGeometry = new THREE.PlaneGeometry(1.3, 1.9);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6b8b,
            transparent: true,
            opacity: 0.05
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.01;
        portraitGroup.add(glow);

        portraitGroup.position.set(-8, 4, -5);
        portraitGroup.rotation.y = Math.PI * 0.1;
        this.scene.add(portraitGroup);

        this.portrait = portrait;
    }

    createRoof() {
        const roofGeometry = new THREE.BoxGeometry(22, 0.3, 22);
        const roofMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0a0a1a, 
            roughness: 0.8 
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 8.15, 0);
        roof.receiveShadow = true;
        this.scene.add(roof);

        // Ladder
        const ladderGroup = new THREE.Group();
        const railMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
        
        // Rails
        for (let i = 0; i < 2; i++) {
            const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5), railMaterial);
            rail.position.set(i * 0.5 - 0.25, 2.5, 0);
            ladderGroup.add(rail);
        }

        // Rungs
        for (let i = 0; i < 10; i++) {
            const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5), railMaterial);
            rung.rotation.z = Math.PI / 2;
            rung.position.set(0, i * 0.5, 0);
            ladderGroup.add(rung);
        }

        ladderGroup.position.set(9.5, 0, -8);
        this.scene.add(ladderGroup);
        this.ladder = ladderGroup;
    }

    createLetterbox() {
        const letterboxGroup = new THREE.Group();
        
        // Mailbox body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff6b8b, 
            roughness: 0.3,
            metalness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        letterboxGroup.add(body);

        // Flag
        const flagGeometry = new THREE.BoxGeometry(0.05, 0.2, 0.15);
        const flagMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(0.35, 0.15, 0);
        letterboxGroup.add(flag);

        // Bird decoration
        const birdGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffaaaa });
        const bird = new THREE.Mesh(birdGeometry, birdMaterial);
        bird.position.set(0, 0.3, 0);
        letterboxGroup.add(bird);

        letterboxGroup.position.set(0, 9, 0);
        this.scene.add(letterboxGroup);
        this.letterbox = letterboxGroup;

        // Make interactive
        this.interactiveObjects.push({
            object: letterboxGroup,
            type: 'letterbox',
            name: 'Love Letters',
            description: 'Read a special message',
            onInteract: () => this.openLetterModal()
        });
    }

    createDecorations() {
        // Floating hearts
        for (let i = 0; i < 15; i++) {
            const heartGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const heartMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6b8b,
                transparent: true,
                opacity: 0.6
            });
            const heart = new THREE.Mesh(heartGeometry, heartMaterial);
            heart.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 6 + 1,
                (Math.random() - 0.5) * 20
            );
            this.scene.add(heart);
            
            // Animate
            this.animations.push({
                object: heart,
                type: 'float',
                speed: 0.5 + Math.random(),
                offset: Math.random() * Math.PI * 2
            });
        }

        // Candles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 6;
            const candleGroup = new THREE.Group();
            
            const candleBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.1, 0.5, 8),
                new THREE.MeshStandardMaterial({ color: 0xffeedd, roughness: 0.6 })
            );
            candleBody.position.y = 0.25;
            candleBody.castShadow = true;
            candleGroup.add(candleBody);

            const flame = new THREE.PointLight(0xffaa55, 1, 3);
            flame.position.y = 0.6;
            candleGroup.add(flame);

            candleGroup.position.set(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            );
            this.scene.add(candleGroup);

            // Animate flame flicker
            this.animations.push({
                object: flame,
                type: 'flicker',
                baseIntensity: 1,
                speed: 2 + Math.random()
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // ENHANCED SKY SYSTEM
    // ══════════════════════════════════════════════════════════════════
    createEnhancedSky() {
        // Starfield with better distribution
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 3000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 100 + Math.random() * 100;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Color variation (white to blue-white)
            const colorVariation = 0.8 + Math.random() * 0.2;
            colors[i * 3] = colorVariation;
            colors[i * 3 + 1] = colorVariation;
            colors[i * 3 + 2] = 1;

            sizes[i] = 1 + Math.random() * 2;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starsMaterial = new THREE.PointsMaterial({
            size: 1.5,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
        this.stars = stars;

        // Moon
        const moonGeometry = new THREE.SphereGeometry(8, 32, 32);
        const moonMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffee,
            emissive: 0xffffee,
            emissiveIntensity: 0.4
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(50, 60, -80);
        this.scene.add(moon);

        // Moon glow
        const glowGeometry = new THREE.SphereGeometry(9, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffee,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const moonGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        moonGlow.position.copy(moon.position);
        this.scene.add(moonGlow);

        // Animate stars twinkling
        this.animations.push({
            object: stars,
            type: 'twinkle',
            speed: 1
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // ENHANCED CREATURES - Instanced for Performance
    // ══════════════════════════════════════════════════════════════════
    createEnhancedBirds() {
        const birdCount = 60; // Increased from typical
        const birdGeometry = new THREE.ConeGeometry(0.15, 0.4, 4);
        const birdMaterial = new THREE.MeshStandardMaterial({
            color: 0xffccee,
            emissive: 0xff88cc,
            emissiveIntensity: 0.2
        });

        // Use instanced mesh for performance
        const instancedBirds = new THREE.InstancedMesh(birdGeometry, birdMaterial, birdCount);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < birdCount; i++) {
            const bird = {
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    10 + Math.random() * 30,
                    (Math.random() - 0.5) * 60
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.05
                ),
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random()
            };

            dummy.position.copy(bird.position);
            dummy.updateMatrix();
            instancedBirds.setMatrixAt(i, dummy.matrix);

            this.birds.push(bird);
        }

        this.scene.add(instancedBirds);
        this.instancedBirds = instancedBirds;
    }

    createEnhancedFish() {
        const fishCount = 40;
        const fishGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.6);
        const fishMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            emissive: 0x4488cc,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.7
        });

        const instancedFish = new THREE.InstancedMesh(fishGeometry, fishMaterial, fishCount);
        const dummy = new THREE.Object3D();

        for (let i = 0; i < fishCount; i++) {
            const fish = {
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 40,
                    3 + Math.random() * 4,
                    (Math.random() - 0.5) * 40
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.04,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.04
                ),
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.5
            };

            dummy.position.copy(fish.position);
            dummy.updateMatrix();
            instancedFish.setMatrixAt(i, dummy.matrix);

            this.fish.push(fish);
        }

        this.scene.add(instancedFish);
        this.instancedFish = instancedFish;
    }

    // ══════════════════════════════════════════════════════════════════
    // ENHANCED PARTICLE SYSTEM
    // ══════════════════════════════════════════════════════════════════
    createEnhancedParticles() {
        if (!this.state.settings.particles) return;

        // Cherry blossom petals
        const petalCount = 200;
        const petalGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(petalCount * 3);
        const velocities = new Float32Array(petalCount * 3);

        for (let i = 0; i < petalCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = Math.random() * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = -0.01 - Math.random() * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }

        petalGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const petalMaterial = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xffccee,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            map: this.createPetalTexture()
        });

        const petals = new THREE.Points(petalGeometry, petalMaterial);
        this.scene.add(petals);
        this.petals = petals;
        this.petalVelocities = velocities;

        // Sparkles
        const sparkleCount = 100;
        const sparkleGeometry = new THREE.BufferGeometry();
        const sparklePositions = new Float32Array(sparkleCount * 3);

        for (let i = 0; i < sparkleCount; i++) {
            sparklePositions[i * 3] = (Math.random() - 0.5) * 30;
            sparklePositions[i * 3 + 1] = Math.random() * 8;
            sparklePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }

        sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
        
        const sparkleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffaa,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
        this.scene.add(sparkles);
        this.sparkles = sparkles;
    }

    createPetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 204, 238, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 204, 238, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 204, 238, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // ══════════════════════════════════════════════════════════════════
    // GARDEN GROWTH SYSTEM (VS Code Style)
    // ══════════════════════════════════════════════════════════════════
    initGardenSystem() {
        this.loadGardenProgress();
        this.updateGardenVisuals();
    }

    loadGardenProgress() {
        const saved = localStorage.getItem('tanmai_garden_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.gardenLevel = data.level || 1;
            this.state.gardenXP = data.xp || 0;
            this.state.dailyStreak = data.streak || 0;
        }
    }

    saveGardenProgress() {
        const data = {
            level: this.state.gardenLevel,
            xp: this.state.gardenXP,
            streak: this.state.dailyStreak,
            lastVisit: Date.now()
        };
        localStorage.setItem('tanmai_garden_progress', JSON.stringify(data));
    }

    addGardenXP(amount) {
        this.state.gardenXP += amount;
        
        // Check for level up
        const currentStage = this.gardenStages.find(s => s.level === this.state.gardenLevel);
        const nextStage = this.gardenStages.find(s => s.level === this.state.gardenLevel + 1);
        
        if (nextStage && this.state.gardenXP >= nextStage.xpNeeded) {
            this.levelUpGarden();
        }
        
        this.updateGardenVisuals();
        this.saveGardenProgress();
    }

    levelUpGarden() {
        this.state.gardenLevel++;
        this.showNotification(`🌟 Garden Level Up! ${this.gardenStages[this.state.gardenLevel - 1].name}`);
        this.triggerLevelUpEffect();
    }

    updateGardenVisuals() {
        if (!this.bonsaiCanopy) return;
        
        const stage = this.gardenStages[this.state.gardenLevel - 1];
        if (!stage) return;

        // Animate scale change
        this.animateScale(this.bonsaiCanopy, stage.scale, 2000);
        
        // Update color
        this.bonsaiCanopy.material.color.setHex(stage.color);
        this.bonsaiCanopy.material.emissive.setHex(stage.color);
        this.bonsaiCanopy.material.emissiveIntensity = 0.2 + (this.state.gardenLevel * 0.05);

        // Update HUD
        const levelDisplay = document.getElementById('garden-level');
        if (levelDisplay) {
            levelDisplay.textContent = stage.name;
        }
    }

    triggerLevelUpEffect() {
        // Particle burst
        const burstCount = 50;
        const burstGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(burstCount * 3);
        
        const bonsaiPos = this.bonsaiGroup.position;
        
        for (let i = 0; i < burstCount; i++) {
            positions[i * 3] = bonsaiPos.x;
            positions[i * 3 + 1] = bonsaiPos.y + 1.5;
            positions[i * 3 + 2] = bonsaiPos.z;
        }
        
        burstGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const burstMaterial = new THREE.PointsMaterial({
            size: 0.2,
            color: 0xffaa00,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });
        
        const burst = new THREE.Points(burstGeometry, burstMaterial);
        this.scene.add(burst);
        
        // Animate burst
        let life = 0;
        const animate = () => {
            life += 0.02;
            if (life > 1) {
                this.scene.remove(burst);
                return;
            }
            
            const positions = burst.geometry.attributes.position.array;
            for (let i = 0; i < burstCount; i++) {
                positions[i * 3] += (Math.random() - 0.5) * 0.1;
                positions[i * 3 + 1] += 0.05;
                positions[i * 3 + 2] += (Math.random() - 0.5) * 0.1;
            }
            burst.geometry.attributes.position.needsUpdate = true;
            burst.material.opacity = 1 - life;
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    // ══════════════════════════════════════════════════════════════════
    // MUSIC SYSTEM
    // ══════════════════════════════════════════════════════════════════
    initMusicPlayer() {
        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.audioDataArray = new Uint8Array(this.analyser.frequencyBinCount);

        // Setup controls
        const playBtn = document.getElementById('mp-play');
        const prevBtn = document.getElementById('mp-prev');
        const nextBtn = document.getElementById('mp-next');
        const volumeSlider = document.getElementById('mp-volume');
        const progressBar = document.getElementById('mp-progress-bar');

        if (playBtn) playBtn.addEventListener('click', () => this.toggleMusic());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevTrack());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextTrack());
        if (volumeSlider) volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
        if (progressBar) progressBar.addEventListener('click', (e) => this.seekMusic(e));

        this.currentTrack = 0;
        this.musicPlaying = false;
    }

    initMusicVisualizer() {
        // Create visualizer bars
        const visualizerContainer = document.getElementById('music-visualizer');
        if (!visualizerContainer) return;

        this.visualizerBars = [];
        const barCount = 32;
        
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            visualizerContainer.appendChild(bar);
            this.visualizerBars.push(bar);
        }
    }

    updateMusicVisualizer() {
        if (!this.state.musicVisualizerActive || !this.analyser) return;

        this.analyser.getByteFrequencyData(this.audioDataArray);

        const barCount = this.visualizerBars.length;
        const step = Math.floor(this.audioDataArray.length / barCount);

        for (let i = 0; i < barCount; i++) {
            const value = this.audioDataArray[i * step];
            const height = (value / 255) * 100;
            if (this.visualizerBars[i]) {
                this.visualizerBars[i].style.height = `${height}%`;
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // SLIDESHOW SYSTEM
    // ══════════════════════════════════════════════════════════════════
    initSlideshow() {
        this.loadImage(this.tanImages[0], (texture) => {
            if (this.tvScreen) {
                this.tvScreen.material.map = texture;
                this.tvScreen.material.needsUpdate = true;
            }
        });

        this.loadImage(this.bigPortrait, (texture) => {
            if (this.portrait) {
                this.portrait.material.map = texture;
                this.portrait.material.needsUpdate = true;
            }
        });
    }

    cycleSlideshow() {
        this.state.slideshowIndex = (this.state.slideshowIndex + 1) % this.tanImages.length;
        this.loadImage(this.tanImages[this.state.slideshowIndex], (texture) => {
            if (this.tvScreen) {
                this.tvScreen.material.map = texture;
                this.tvScreen.material.needsUpdate = true;
            }
        });
        this.showNotification('📺 Next memory');
    }

    loadImage(url, callback) {
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            callback,
            undefined,
            () => console.warn('Failed to load image:', url)
        );
    }

    // ══════════════════════════════════════════════════════════════════
    // FLASHLIGHT & PHOTO MODE
    // ══════════════════════════════════════════════════════════════════
    initFlashlight() {
        const flashlight = new THREE.SpotLight(0xffffff, 2, 20, Math.PI / 6, 0.5, 1);
        flashlight.castShadow = false;
        flashlight.visible = false;
        this.camera.add(flashlight);
        this.flashlightObj = flashlight;
    }

    toggleFlashlight() {
        this.state.flashlight = !this.state.flashlight;
        if (this.flashlightObj) {
            this.flashlightObj.visible = this.state.flashlight;
        }
        this.showNotification(this.state.flashlight ? '🔦 Flashlight ON' : '🔦 Flashlight OFF');
    }

    initPhotoMode() {
        // Photo mode will freeze game and add filters
    }

    togglePhotoMode() {
        this.state.photoMode = !this.state.photoMode;
        
        if (this.state.photoMode) {
            this.state.paused = true;
            document.getElementById('crosshair')?.classList.add('hidden');
            this.showNotification('📸 Photo Mode - Use number keys for filters');
        } else {
            this.state.paused = false;
            document.getElementById('crosshair')?.classList.remove('hidden');
        }
    }

    cyclePhotoFilter() {
        this.state.photoFilter = (this.state.photoFilter + 1) % this.photoFilters.length;
        const filter = this.photoFilters[this.state.photoFilter];
        
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.style.filter = filter.css;
        }
        
        this.showNotification(`📸 ${filter.name}`);
    }

    // ══════════════════════════════════════════════════════════════════
    // GAME LOOP & UPDATES
    // ══════════════════════════════════════════════════════════════════
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        if (!this.state.loaded) return;

        this.delta = this.clock.getDelta();
        
        if (!this.state.paused && this.state.started) {
            this.updatePlayer();
            this.updateAnimations();
            this.updateBirds();
            this.updateFish();
            this.updateParticles();
            this.updateInteractions();
            this.updateMusicVisualizer();
        }

        this.render();
    }

    updatePlayer() {
        if (!this.state.player.canMove) return;

        const speed = this.state.player.speed;
        const camera = this.camera;

        // Movement
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        
        forward.y = 0;
        forward.normalize();
        right.y = 0;
        right.normalize();

        if (this.keys['w'] || this.keys['W']) this.state.player.pos.add(forward.multiplyScalar(speed));
        if (this.keys['s'] || this.keys['S']) this.state.player.pos.add(forward.multiplyScalar(-speed));
        if (this.keys['a'] || this.keys['A']) this.state.player.pos.add(right.multiplyScalar(-speed));
        if (this.keys['d'] || this.keys['D']) this.state.player.pos.add(right.multiplyScalar(speed));

        // Gravity and jumping
        if (this.keys[' '] && this.state.player.canJump) {
            this.physVelY = this.state.player.jumpPower;
            this.state.player.canJump = false;
        }

        this.physVelY -= 0.006; // Gravity
        this.state.player.pos.y += this.physVelY;

        if (this.state.player.pos.y <= 1.6) {
            this.state.player.pos.y = 1.6;
            this.physVelY = 0;
            this.state.player.canJump = true;
        }

        // Boundaries
        this.state.player.pos.x = Math.max(-24, Math.min(24, this.state.player.pos.x));
        this.state.player.pos.z = Math.max(-24, Math.min(24, this.state.player.pos.z));

        // Update camera position
        this.camera.position.copy(this.state.player.pos);
    }

    updateAnimations() {
        const time = Date.now() * 0.001;

        this.animations.forEach(anim => {
            switch (anim.type) {
                case 'float':
                    anim.object.position.y += Math.sin(time * anim.speed + anim.offset) * 0.002;
                    break;
                case 'flicker':
                    anim.object.intensity = anim.baseIntensity + Math.sin(time * anim.speed) * 0.3;
                    break;
                case 'twinkle':
                    // Handled in updateParticles
                    break;
            }
        });
    }

    updateBirds() {
        if (!this.instancedBirds) return;

        const dummy = new THREE.Object3D();
        const time = Date.now() * 0.001;

        this.birds.forEach((bird, i) => {
            // Update position
            bird.position.add(bird.velocity);

            // Sine wave motion
            bird.position.y += Math.sin(time * bird.speed + bird.phase) * 0.02;

            // Boundary wrapping
            if (Math.abs(bird.position.x) > 30) bird.position.x *= -0.9;
            if (Math.abs(bird.position.z) > 30) bird.position.z *= -0.9;
            if (bird.position.y > 40) bird.position.y = 10;
            if (bird.position.y < 10) bird.position.y = 40;

            // Update instance
            dummy.position.copy(bird.position);
            dummy.lookAt(
                bird.position.x + bird.velocity.x * 10,
                bird.position.y + bird.velocity.y * 10,
                bird.position.z + bird.velocity.z * 10
            );
            dummy.updateMatrix();
            this.instancedBirds.setMatrixAt(i, dummy.matrix);
        });

        this.instancedBirds.instanceMatrix.needsUpdate = true;
    }

    updateFish() {
        if (!this.instancedFish) return;

        const dummy = new THREE.Object3D();
        const time = Date.now() * 0.001;

        this.fish.forEach((fish, i) => {
            // Update position
            fish.position.add(fish.velocity);

            // Sine wave motion
            fish.position.y += Math.sin(time * fish.speed + fish.phase) * 0.01;

            // Boundary wrapping
            if (Math.abs(fish.position.x) > 20) fish.position.x *= -0.9;
            if (Math.abs(fish.position.z) > 20) fish.position.z *= -0.9;
            if (fish.position.y > 7) fish.position.y = 3;
            if (fish.position.y < 3) fish.position.y = 7;

            // Update instance
            dummy.position.copy(fish.position);
            dummy.lookAt(
                fish.position.x + fish.velocity.x * 10,
                fish.position.y,
                fish.position.z + fish.velocity.z * 10
            );
            dummy.updateMatrix();
            this.instancedFish.setMatrixAt(i, dummy.matrix);
        });

        this.instancedFish.instanceMatrix.needsUpdate = true;
    }

    updateParticles() {
        // Update petals
        if (this.petals) {
            const positions = this.petals.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3] += this.petalVelocities[i * 3];
                positions[i * 3 + 1] += this.petalVelocities[i * 3 + 1];
                positions[i * 3 + 2] += this.petalVelocities[i * 3 + 2];

                // Reset when falling too low
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 15;
                    positions[i * 3] = (Math.random() - 0.5) * 40;
                    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
                }
            }

            this.petals.geometry.attributes.position.needsUpdate = true;
        }

        // Update stars twinkling
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }

        // Update sparkles
        if (this.sparkles) {
            this.sparkles.rotation.y += 0.002;
        }
    }

    updateInteractions() {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

        let closestInteractive = null;
        let closestDistance = 5; // Max interaction distance

        this.interactiveObjects.forEach(item => {
            const intersects = raycaster.intersectObject(item.object, true);
            if (intersects.length > 0 && intersects[0].distance < closestDistance) {
                closestDistance = intersects[0].distance;
                closestInteractive = item;
            }
        });

        if (closestInteractive !== this._currentInteractive) {
            this._currentInteractive = closestInteractive;
            this.updateInteractHint();
        }
    }

    updateInteractHint() {
        const hint = document.getElementById('interact-hint');
        if (!hint) return;

        if (this._currentInteractive) {
            hint.style.display = 'flex';
            document.getElementById('interact-text').textContent = this._currentInteractive.name;
            document.getElementById('interact-desc').textContent = this._currentInteractive.description;
        } else {
            hint.style.display = 'none';
        }
    }

    render() {
        if (this.composer && this.state.settings.bloom) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // EVENT HANDLERS
    // ══════════════════════════════════════════════════════════════════
    setupEvents() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Mouse
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', () => this.onClick());

        // UI Buttons
        document.getElementById('btn-start')?.addEventListener('click', () => this.startGame());
        document.getElementById('btn-resume')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-quit')?.addEventListener('click', () => this.quitToMenu());
        document.getElementById('btn-water')?.addEventListener('click', () => this.waterPlant());
        document.querySelectorAll('.modal-x').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Window resize
        window.addEventListener('resize', () => this.onResize());

        // Pointer lock
        document.getElementById('game-canvas').addEventListener('click', () => {
            if (this.state.started && !this.state.paused) {
                document.getElementById('game-canvas').requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.state.player.canMove = document.pointerLockElement === document.getElementById('game-canvas');
        });
    }

    onKeyDown(e) {
        this.keys[e.key] = true;

        // ESC - Pause
        if (e.key === 'Escape') {
            e.preventDefault();
            if (this.state.started) this.togglePause();
        }

        // E - Interact
        if (e.key === 'e' || e.key === 'E') {
            if (this._currentInteractive && this.state.started && !this.state.paused) {
                this._currentInteractive.onInteract();
            }
        }

        // F - Flashlight
        if (e.key === 'f' || e.key === 'F') {
            this.toggleFlashlight();
        }

        // P - Photo mode
        if (e.key === 'p' || e.key === 'P') {
            this.togglePhotoMode();
        }

        // Number keys - Photo filters
        if (this.state.photoMode && e.key >= '1' && e.key <= '6') {
            this.state.photoFilter = parseInt(e.key) - 1;
            const filter = this.photoFilters[this.state.photoFilter];
            document.getElementById('game-canvas').style.filter = filter.css;
            this.showNotification(`📸 ${filter.name}`);
        }

        // M - Music visualizer
        if (e.key === 'm' || e.key === 'M') {
            this.state.musicVisualizerActive = !this.state.musicVisualizerActive;
        }
    }

    onKeyUp(e) {
        this.keys[e.key] = false;
    }

    onMouseMove(e) {
        if (!this.state.player.canMove) return;

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.camera.rotation.y -= movementX * this.state.settings.mouseSens;
        this.camera.rotation.x -= movementY * this.state.settings.mouseSens;

        // Clamp vertical rotation
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }

    onClick() {
        if (this._currentInteractive && this.state.started && !this.state.paused) {
            this._currentInteractive.onInteract();
        }
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.composer) {
            this.composer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // GAME STATE MANAGEMENT
    // ══════════════════════════════════════════════════════════════════
    startGame() {
        this.state.started = true;
        this.state.paused = false;
        document.getElementById('main-menu')?.classList.add('hidden');
        document.getElementById('hud')?.classList.remove('hidden');
        document.getElementById('game-canvas').requestPointerLock();
        this.showNotification('Welcome to your sanctuary, Tan ♥');
        this.addGardenXP(10); // XP for visiting
    }

    togglePause() {
        this.state.paused = !this.state.paused;
        document.getElementById('pause-menu')?.classList.toggle('hidden');
        if (!this.state.paused) {
            document.getElementById('game-canvas').requestPointerLock();
        } else {
            document.exitPointerLock();
        }
    }

    resumeGame() {
        this.togglePause();
    }

    quitToMenu() {
        this.state.started = false;
        this.state.paused = false;
        document.getElementById('pause-menu')?.classList.add('hidden');
        document.getElementById('hud')?.classList.add('hidden');
        document.getElementById('main-menu')?.classList.remove('hidden');
        document.exitPointerLock();
    }

    // ══════════════════════════════════════════════════════════════════
    // MODALS & UI
    // ══════════════════════════════════════════════════════════════════
    openPlantModal() {
        document.getElementById('modal-plant')?.classList.remove('hidden');
        this.state.paused = true;
        document.exitPointerLock();
    }

    openLetterModal() {
        const modal = document.getElementById('modal-letter');
        if (!modal) return;

        modal.classList.remove('hidden');
        this.loadRandomLetter();
        this.state.paused = true;
        document.exitPointerLock();

        if (!this.state.letterRead) {
            this.state.letterRead = true;
            setTimeout(() => this.triggerFireworks(), 1000);
        }

        this.addGardenXP(50); // XP for reading letter
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            this.state.paused = false;
            if (this.state.started) {
                document.getElementById('game-canvas').requestPointerLock();
            }
        }
    }

    loadRandomLetter() {
        fetch('letters.json')
            .then(r => r.json())
            .then(letters => {
                const letter = letters[Math.floor(Math.random() * letters.length)];
                document.getElementById('letter-title-display').textContent = letter.title;
                document.getElementById('letter-content-display').textContent = letter.content;
                document.getElementById('letter-date-stamp').textContent = new Date(letter.date).toLocaleDateString();
            })
            .catch(() => {
                document.getElementById('letter-content-display').textContent = 'My dearest Tan, you are my everything. ♥';
            });
    }

    waterPlant() {
        this.addGardenXP(20);
        this.showNotification('💧 Bonsai watered! +20 XP');
        this.closeModal(document.getElementById('modal-plant'));
        
        // Visual effect
        this.createWaterEffect();
    }

    createWaterEffect() {
        const dropletCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dropletCount * 3);
        
        const bonsaiPos = this.bonsaiGroup.position;
        
        for (let i = 0; i < dropletCount; i++) {
            positions[i * 3] = bonsaiPos.x + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = bonsaiPos.y + 2;
            positions[i * 3 + 2] = bonsaiPos.z + (Math.random() - 0.5) * 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x88ccff,
            transparent: true,
            opacity: 0.8
        });
        
        const droplets = new THREE.Points(geometry, material);
        this.scene.add(droplets);
        
        // Animate
        let life = 0;
        const animate = () => {
            life += 0.05;
            if (life > 1) {
                this.scene.remove(droplets);
                return;
            }
            
            const positions = droplets.geometry.attributes.position.array;
            for (let i = 0; i < dropletCount; i++) {
                positions[i * 3 + 1] -= 0.1;
            }
            droplets.geometry.attributes.position.needsUpdate = true;
            droplets.material.opacity = 0.8 - (life * 0.8);
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    triggerFireworks() {
        if (this.state.fireworksActive) return;
        this.state.fireworksActive = true;

        const fireworksCount = 20;
        for (let i = 0; i < fireworksCount; i++) {
            setTimeout(() => this.createFirework(), i * 400);
        }

        this.showValentineMessage();
    }

    createFirework() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        const startPos = new THREE.Vector3(
            (Math.random() - 0.5) * 30,
            10 + Math.random() * 10,
            (Math.random() - 0.5) * 30
        );

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = startPos.x;
            positions[i * 3 + 1] = startPos.y;
            positions[i * 3 + 2] = startPos.z;

            velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const colors = [0xff6b8b, 0xff8ea8, 0xffcc00, 0xff8e53];
        const material = new THREE.PointsMaterial({
            size: 0.2,
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const firework = new THREE.Points(geometry, material);
        this.scene.add(firework);

        // Animate explosion
        let life = 0;
        const animate = () => {
            life += 0.02;
            if (life > 1) {
                this.scene.remove(firework);
                return;
            }

            const positions = firework.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                velocities[i].y -= 0.01; // Gravity
            }
            
            firework.geometry.attributes.position.needsUpdate = true;
            firework.material.opacity = 1 - life;

            requestAnimationFrame(animate);
        };
        animate();
    }

    showValentineMessage() {
        if (this.state.valentineShown) return;
        this.state.valentineShown = true;

        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Cormorant Garamond', serif;
            font-size: 4rem;
            font-weight: 600;
            color: #ff6b8b;
            text-align: center;
            z-index: 1000;
            text-shadow: 0 0 20px rgba(255,107,139,0.8);
            animation: fadeInOut 5s ease-in-out;
        `;
        message.textContent = "Happy Valentine's Day, Tan! ♥";
        document.body.appendChild(message);

        setTimeout(() => message.remove(), 5000);
    }

    showNotification(text) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = text;
        document.getElementById('notifs')?.appendChild(notif);

        setTimeout(() => {
            notif.classList.add('fade-out');
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    }

    showWelcomeMessage() {
        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, rgba(13,8,37,0.95), rgba(5,5,26,0.98));
            backdrop-filter: blur(10px);
            z-index: 9998;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeOut 3s ease-in-out forwards;
        `;

        const welcomeText = document.createElement('div');
        welcomeText.style.cssText = `
            font-family: 'Cormorant Garamond', serif;
            font-size: 3rem;
            font-weight: 600;
            color: #ff6b8b;
            text-align: center;
            animation: fadeIn 1s ease-in;
        `;
        welcomeText.innerHTML = `
            <div style="font-size: 1.5rem; color: rgba(255,255,255,0.6); margin-bottom: 20px;">Your Personal Sanctuary</div>
            <div>Welcome Home, Tan</div>
            <div style="font-size: 1.2rem; color: rgba(255,255,255,0.5); margin-top: 20px;">Built with ♥ just for you</div>
        `;

        welcomeOverlay.appendChild(welcomeText);
        document.body.appendChild(welcomeOverlay);

        setTimeout(() => welcomeOverlay.remove(), 3000);
    }

    // ══════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ══════════════════════════════════════════════════════════════════
    progress(pct, msg) {
        const bar = document.getElementById('load-bar');
        const pctEl = document.getElementById('load-pct');
        const asset = document.getElementById('load-asset');
        if (bar) bar.style.width = `${pct}%`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (asset) asset.textContent = msg;
    }

    initLoaderParticles() {
        const container = document.getElementById('loader-particles');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'loader-particle';
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: radial-gradient(circle, rgba(255,107,139,0.8), transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${3 + Math.random() * 3}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(particle);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    animateScale(object, targetScale, duration) {
        const startScale = object.scale.x;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);
            
            const scale = startScale + (targetScale - startScale) * eased;
            object.scale.set(scale, scale, scale);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    loadSavedProgress() {
        const saved = localStorage.getItem('tanmai_garden_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.gardenLevel = data.level || 1;
            this.state.gardenXP = data.xp || 0;
            this.state.dailyStreak = data.streak || 0;
        }
    }

    toggleMusic() {
        this.musicPlaying = !this.musicPlaying;
        const icon = document.querySelector('#mp-play i');
        if (icon) {
            icon.className = this.musicPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    prevTrack() {
        this.showNotification('⏮️ Previous track');
    }

    nextTrack() {
        this.showNotification('⏭️ Next track');
    }

    setVolume(vol) {
        // Set audio volume
        this.showNotification(`🔊 Volume: ${Math.round(vol * 100)}%`);
    }

    seekMusic(e) {
        // Seek to position in track
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// START THE EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    window.game = game; // For debugging
});