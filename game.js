// ═══════════════════════════════════════════════════════════════════════════
// TAN'S HOME — ULTIMATE EDITION v150.0
// The most romantic 3D sanctuary ever created
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

        // Enhanced state management
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
            inBasement: false,
            sitting: false,
            sittingPosition: null,
            musicVisualizerActive: false,
            customLetterOpen: false,
            photoUploadOpen: false,
            player: { 
                pos: new THREE.Vector3(0, 1.6, 3), 
                vel: new THREE.Vector3(0, 0, 0),
                canMove: true, 
                canJump: true,
                speed: 0.12, // Smoother, faster movement
                jumpPower: 0.18,
                rotation: new THREE.Euler(0, 0, 0),
                yaw: 0,
                pitch: 0
            },
            settings: { 
                mouseSens: 0.0015, // Smoother look
                bloom: true, 
                particles: true,
                shadows: true,
                quality: 'ultra'
            },
            memories: [],
            uploadedPhotos: [],
            customLetter: '',
            slideshowIndex: 0,
            slideshowTimer: 0,
            weather: 'space',
            timeOfDay: 20
        };

        // Collections
        this.interactiveObjects = [];
        this.animations = [];
        this.fireworks = [];
        this.particles = [];
        this.birds = [];
        this.fish = [];
        this.stingrays = [];
        this.candles = [];
        this.snowflakes = [];
        this.planets = [];
        this.shootingStars = [];
        this.sitPoints = [];
        this.physVelY = 0;
        this.flashlightObj = null;
        this._currentInteractive = null;
        this.mixer = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Default images (will be replaced by uploaded ones)
        this.tanImages = [
            'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
            'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=800',
            'https://images.unsplash.com/photo-1502898125287-0be8fbef8542?w=800'
        ];
        this.bigPortrait = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600';

        // Smooth camera movement
        this.targetCameraRotation = { yaw: 0, pitch: 0 };
        this.smoothRotation = { yaw: 0, pitch: 0 };
        
        // Elevator system
        this.elevator = {
            moving: false,
            targetFloor: 0, // 0 = main, 1 = roof, -1 = basement
            currentFloor: 0,
            position: 0,
            speed: 0.02
        };

        this.init();
    }

    async init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        await this.loadAssets();
        this.createWorld();
        this.createEnhancedParticleSystems();
        this.createCandles();
        this.createPlanetsAndStars();
        this.createSpaceCreatures();
        this.createElevatorSystem();
        this.createSitPoints();
        this.setupControls();
        this.setupUI();
        this.animate();
        this.finishLoading();
    }

    setupRenderer() {
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas, 
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
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000510, 0.02);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.copy(this.state.player.pos);
    }

    setupLights() {
        // Ambient light for base visibility
        const ambient = new THREE.AmbientLight(0x404060, 0.4);
        this.scene.add(ambient);

        // Moon light
        const moonLight = new THREE.DirectionalLight(0xaaccff, 0.6);
        moonLight.position.set(20, 30, 10);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 2048;
        moonLight.shadow.mapSize.height = 2048;
        moonLight.shadow.camera.far = 100;
        this.scene.add(moonLight);

        // Warm interior light
        const interiorLight = new THREE.PointLight(0xffddaa, 1.5, 20);
        interiorLight.position.set(0, 3, 0);
        this.scene.add(interiorLight);
    }

    async loadAssets() {
        // Simulate loading
        const loadBar = document.getElementById('load-bar');
        const loadGlow = document.getElementById('load-glow');
        const loadPct = document.getElementById('load-pct');
        const loadAsset = document.getElementById('load-asset');

        const assets = [
            'Textures', 'Models', 'Particles', 'Shaders', 
            'Audio', 'Environment', 'Creatures', 'Effects'
        ];

        for (let i = 0; i < assets.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const pct = ((i + 1) / assets.length * 100).toFixed(0);
            loadBar.style.width = pct + '%';
            loadGlow.style.width = pct + '%';
            loadPct.textContent = pct + '%';
            loadAsset.textContent = `Loading ${assets[i]}...`;
        }

        this.state.loaded = true;
    }

    createWorld() {
        // Space skybox with stars
        this.createSpaceSkybox();
        
        // Main floor (inside)
        const floorGeom = new THREE.BoxGeometry(20, 0.2, 20);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x2a1f3d,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Walls with windows
        this.createWalls();

        // Basement floor
        const basementFloor = new THREE.Mesh(
            new THREE.BoxGeometry(15, 0.2, 15),
            new THREE.MeshStandardMaterial({ color: 0x1a1520 })
        );
        basementFloor.position.set(0, -8, 0);
        basementFloor.receiveShadow = true;
        this.scene.add(basementFloor);

        // Roof platform
        const roofFloor = new THREE.Mesh(
            new THREE.BoxGeometry(18, 0.2, 18),
            new THREE.MeshStandardMaterial({ color: 0x2a2040 })
        );
        roofFloor.position.set(0, 8, 0);
        roofFloor.receiveShadow = true;
        this.scene.add(roofFloor);

        // Furniture
        this.createFurniture();
        this.createBonsai();
        this.createTV();
        this.createPortrait();
        this.createPostBox();
    }

    createSpaceSkybox() {
        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 8000; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 1.5,
            transparent: true,
            opacity: 0.9,
            sizeAttenuation: true
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);

        // Moon
        const moonGeom = new THREE.SphereGeometry(8, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffee,
            emissive: 0xffffcc,
            emissiveIntensity: 0.5
        });
        const moon = new THREE.Mesh(moonGeom, moonMat);
        moon.position.set(50, 40, -80);
        this.scene.add(moon);
    }

    createWalls() {
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a2f4d,
            roughness: 0.7,
            metalness: 0.1,
            transparent: true,
            opacity: 0.95
        });

        // North wall
        const northWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.2), wallMat);
        northWall.position.set(0, 2.5, -10);
        northWall.castShadow = true;
        northWall.receiveShadow = true;
        this.scene.add(northWall);

        // South wall (with window)
        const southWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.2), wallMat);
        southWall.position.set(0, 2.5, 10);
        southWall.castShadow = true;
        this.scene.add(southWall);

        // East wall
        const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 20), wallMat);
        eastWall.position.set(10, 2.5, 0);
        eastWall.castShadow = true;
        this.scene.add(eastWall);

        // West wall
        const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 20), wallMat);
        westWall.position.set(-10, 2.5, 0);
        westWall.castShadow = true;
        this.scene.add(westWall);
    }

    createFurniture() {
        // Couch for sitting
        const couchGeom = new THREE.BoxGeometry(3, 0.8, 1.5);
        const couchMat = new THREE.MeshStandardMaterial({ color: 0x8b5a7d });
        const couch = new THREE.Mesh(couchGeom, couchMat);
        couch.position.set(-5, 0.4, -5);
        couch.castShadow = true;
        this.scene.add(couch);

        // Table
        const tableGeom = new THREE.BoxGeometry(2, 0.1, 1.5);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x4a3a3a });
        const table = new THREE.Mesh(tableGeom, tableMat);
        table.position.set(0, 0.6, -3);
        table.castShadow = true;
        this.scene.add(table);
    }

    createBonsai() {
        // Pot
        const potGeom = new THREE.CylinderGeometry(0.3, 0.25, 0.4, 16);
        const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const pot = new THREE.Mesh(potGeom, potMat);
        pot.position.set(0, 0.8, -3);
        pot.castShadow = true;
        this.scene.add(pot);

        // Tree trunk
        const trunkGeom = new THREE.CylinderGeometry(0.05, 0.08, 0.6, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3020 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.set(0, 1.2, -3);
        trunk.castShadow = true;
        this.scene.add(trunk);

        // Foliage (cherry blossoms)
        const foliageGeom = new THREE.SphereGeometry(0.4, 16, 16);
        const foliageMat = new THREE.MeshStandardMaterial({ 
            color: 0xffb7c5,
            emissive: 0xff88aa,
            emissiveIntensity: 0.2
        });
        const foliage = new THREE.Mesh(foliageGeom, foliageMat);
        foliage.position.set(0, 1.6, -3);
        foliage.castShadow = true;
        this.scene.add(foliage);
        this.bonsai = foliage;

        // Interactive
        this.interactiveObjects.push({
            object: foliage,
            name: 'Bonsai Tree',
            desc: 'Water the bonsai',
            action: () => this.openPlantModal()
        });
    }

    createTV() {
        // TV screen
        const tvGeom = new THREE.BoxGeometry(4, 2.5, 0.1);
        const tvMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const tv = new THREE.Mesh(tvGeom, tvMat);
        tv.position.set(0, 2, -9.8);
        tv.castShadow = true;
        this.scene.add(tv);

        // Screen display (photo slideshow)
        const screenGeom = new THREE.PlaneGeometry(3.8, 2.3);
        const screenMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: 0x888888,
            emissiveIntensity: 0.5
        });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.position.set(0, 2, -9.7);
        this.scene.add(screen);
        this.tvScreen = screen;

        // Load first image
        this.updateTVSlideshow();

        // Interactive
        this.interactiveObjects.push({
            object: tv,
            name: 'Photo Slideshow',
            desc: 'View memories',
            action: () => this.nextSlide()
        });
    }

    createPortrait() {
        // Large portrait on wall
        const frameGeom = new THREE.BoxGeometry(2.5, 3.5, 0.1);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
        const frame = new THREE.Mesh(frameGeom, frameMat);
        frame.position.set(-8, 2.5, 0);
        frame.rotation.y = Math.PI / 2;
        frame.castShadow = true;
        this.scene.add(frame);

        // Portrait image
        const portraitGeom = new THREE.PlaneGeometry(2.3, 3.3);
        const loader = new THREE.TextureLoader();
        loader.load(this.bigPortrait, (texture) => {
            const portraitMat = new THREE.MeshStandardMaterial({ 
                map: texture,
                emissive: 0xffffff,
                emissiveIntensity: 0.1
            });
            const portrait = new THREE.Mesh(portraitGeom, portraitMat);
            portrait.position.set(-7.9, 2.5, 0);
            portrait.rotation.y = Math.PI / 2;
            this.scene.add(portrait);
        });
    }

    createPostBox() {
        // Cute postbox on roof
        const boxGeom = new THREE.BoxGeometry(0.8, 1, 0.6);
        const boxMat = new THREE.MeshStandardMaterial({ 
            color: 0xff4466,
            metalness: 0.3,
            roughness: 0.6
        });
        const postbox = new THREE.Mesh(boxGeom, boxMat);
        postbox.position.set(3, 8.7, 3);
        postbox.castShadow = true;
        this.scene.add(postbox);

        // Flag
        const flagGeom = new THREE.BoxGeometry(0.5, 0.1, 0.05);
        const flagMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const flag = new THREE.Mesh(flagGeom, flagMat);
        flag.position.set(3.5, 9.2, 3);
        this.scene.add(flag);

        // Interactive
        this.interactiveObjects.push({
            object: postbox,
            name: 'Love Letter Box',
            desc: 'Read your custom letter',
            action: () => this.openCustomLetter()
        });
    }

    createCandles() {
        // Place candles around the room
        const candlePositions = [
            [-8, 0.6, -8], [8, 0.6, -8], [-8, 0.6, 8], [8, 0.6, 8],
            [-3, 0.6, -9], [3, 0.6, -9], [-9, 0.6, -3], [-9, 0.6, 3],
            [9, 0.6, -3], [9, 0.6, 3], [0, 0.6, 8], [-5, 0.6, 0], [5, 0.6, 0]
        ];

        candlePositions.forEach(pos => {
            // Candle body
            const candleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
            const candleMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc });
            const candle = new THREE.Mesh(candleGeom, candleMat);
            candle.position.set(pos[0], pos[1], pos[2]);
            candle.castShadow = true;
            this.scene.add(candle);

            // Flame (point light)
            const flame = new THREE.PointLight(0xff9944, 1.5, 5);
            flame.position.set(pos[0], pos[1] + 0.2, pos[2]);
            flame.castShadow = true;
            this.scene.add(flame);

            // Animated glow
            this.candles.push({ light: flame, baseY: pos[1] + 0.2 });
        });
    }

    createPlanetsAndStars() {
        // Planets floating in space
        const planetData = [
            { pos: [40, 25, -70], radius: 3, color: 0xff8844, speed: 0.0005 },
            { pos: [-50, 30, -80], radius: 4, color: 0x4488ff, speed: 0.0003 },
            { pos: [60, 35, 50], radius: 2.5, color: 0xff44aa, speed: 0.0007 },
            { pos: [-40, 20, 60], radius: 3.5, color: 0x88ff44, speed: 0.0004 }
        ];

        planetData.forEach(data => {
            const planetGeom = new THREE.SphereGeometry(data.radius, 32, 32);
            const planetMat = new THREE.MeshStandardMaterial({ 
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.4
            });
            const planet = new THREE.Mesh(planetGeom, planetMat);
            planet.position.set(data.pos[0], data.pos[1], data.pos[2]);
            this.scene.add(planet);
            this.planets.push({ mesh: planet, speed: data.speed, angle: Math.random() * Math.PI * 2 });
        });

        // Shooting stars
        this.createShootingStarSystem();
    }

    createShootingStarSystem() {
        // Create shooting stars periodically
        setInterval(() => {
            if (!this.state.started || this.state.paused) return;
            
            const startX = (Math.random() - 0.5) * 200;
            const startY = 40 + Math.random() * 30;
            const startZ = (Math.random() - 0.5) * 200;

            const geometry = new THREE.BufferGeometry();
            const positions = [];
            for (let i = 0; i < 30; i++) {
                positions.push(0, 0, 0);
            }
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({ 
                color: 0xffff88,
                transparent: true,
                opacity: 0.8
            });
            const trail = new THREE.Line(geometry, material);
            trail.position.set(startX, startY, startZ);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                -(0.3 + Math.random() * 0.3),
                (Math.random() - 0.5) * 0.5
            );

            this.scene.add(trail);
            this.shootingStars.push({ 
                mesh: trail, 
                velocity, 
                lifetime: 0,
                maxLifetime: 100 
            });
        }, 3000 + Math.random() * 7000);
    }

    createSpaceCreatures() {
        // Birds
        for (let i = 0; i < 80; i++) {
            const birdGeom = new THREE.ConeGeometry(0.15, 0.4, 4);
            const birdMat = new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                emissive: 0x8888ff,
                emissiveIntensity: 0.3
            });
            const bird = new THREE.Mesh(birdGeom, birdMat);
            bird.position.set(
                (Math.random() - 0.5) * 100,
                10 + Math.random() * 40,
                (Math.random() - 0.5) * 100
            );
            bird.rotation.x = Math.PI / 2;
            this.scene.add(bird);
            this.birds.push({ 
                mesh: bird, 
                speed: 0.02 + Math.random() * 0.03,
                angle: Math.random() * Math.PI * 2,
                radius: 20 + Math.random() * 30,
                height: bird.position.y
            });
        }

        // Fish
        for (let i = 0; i < 60; i++) {
            const fishGeom = new THREE.SphereGeometry(0.2, 8, 8);
            fishGeom.scale(1.5, 1, 1);
            const fishMat = new THREE.MeshStandardMaterial({ 
                color: 0x44aaff,
                emissive: 0x2266ff,
                emissiveIntensity: 0.4
            });
            const fish = new THREE.Mesh(fishGeom, fishMat);
            fish.position.set(
                (Math.random() - 0.5) * 120,
                5 + Math.random() * 30,
                (Math.random() - 0.5) * 120
            );
            this.scene.add(fish);
            this.fish.push({ 
                mesh: fish, 
                speed: 0.015 + Math.random() * 0.02,
                angle: Math.random() * Math.PI * 2,
                radius: 25 + Math.random() * 35,
                height: fish.position.y
            });
        }

        // Stingrays
        for (let i = 0; i < 30; i++) {
            const rayGeom = new THREE.BoxGeometry(1, 0.1, 0.6);
            const rayMat = new THREE.MeshStandardMaterial({ 
                color: 0xff88cc,
                emissive: 0xff44aa,
                emissiveIntensity: 0.3
            });
            const ray = new THREE.Mesh(rayGeom, rayMat);
            ray.position.set(
                (Math.random() - 0.5) * 100,
                15 + Math.random() * 25,
                (Math.random() - 0.5) * 100
            );
            this.scene.add(ray);
            this.stingrays.push({ 
                mesh: ray, 
                speed: 0.01 + Math.random() * 0.015,
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 40,
                height: ray.position.y,
                wobble: 0
            });
        }
    }

    createEnhancedParticleSystems() {
        // Snowflakes outside only
        this.createSnowflakes();
        
        // Dust particles inside
        this.createDustParticles();
    }

    createSnowflakes() {
        const snowCount = 500;
        const snowGeom = new THREE.BufferGeometry();
        const snowPositions = [];
        
        for (let i = 0; i < snowCount; i++) {
            const x = (Math.random() - 0.5) * 200;
            const y = Math.random() * 100;
            const z = (Math.random() - 0.5) * 200;
            
            // Only create snow outside the house bounds
            if (Math.abs(x) > 12 || Math.abs(z) > 12 || y > 10) {
                snowPositions.push(x, y, z);
            }
        }
        
        snowGeom.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
        const snowMat = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 0.15,
            transparent: true,
            opacity: 0.8
        });
        const snow = new THREE.Points(snowGeom, snowMat);
        this.scene.add(snow);
        this.snowSystem = { mesh: snow, positions: snowPositions };
    }

    createDustParticles() {
        const dustCount = 200;
        const dustGeom = new THREE.BufferGeometry();
        const dustPositions = [];
        
        for (let i = 0; i < dustCount; i++) {
            dustPositions.push(
                (Math.random() - 0.5) * 20,
                Math.random() * 5,
                (Math.random() - 0.5) * 20
            );
        }
        
        dustGeom.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
        const dustMat = new THREE.PointsMaterial({ 
            color: 0xffddaa, 
            size: 0.05,
            transparent: true,
            opacity: 0.3
        });
        const dust = new THREE.Points(dustGeom, dustMat);
        this.scene.add(dust);
        this.dustSystem = dust;
    }

    createElevatorSystem() {
        // Elevator platform
        const elevatorGeom = new THREE.BoxGeometry(2, 0.1, 2);
        const elevatorMat = new THREE.MeshStandardMaterial({ 
            color: 0x555577,
            metalness: 0.6,
            roughness: 0.3
        });
        this.elevatorPlatform = new THREE.Mesh(elevatorGeom, elevatorMat);
        this.elevatorPlatform.position.set(8, 0.05, 8);
        this.elevatorPlatform.castShadow = true;
        this.elevatorPlatform.receiveShadow = true;
        this.scene.add(this.elevatorPlatform);

        // Elevator walls
        const wallGeom = new THREE.BoxGeometry(0.1, 3, 2);
        const wallMat = new THREE.MeshStandardMaterial({ 
            color: 0x444466,
            transparent: true,
            opacity: 0.7
        });
        
        const leftWall = new THREE.Mesh(wallGeom, wallMat);
        leftWall.position.set(7, 1.5, 8);
        this.scene.add(leftWall);
        this.elevatorWalls = [leftWall];

        const rightWall = new THREE.Mesh(wallGeom, wallMat);
        rightWall.position.set(9, 1.5, 8);
        this.scene.add(rightWall);
        this.elevatorWalls.push(rightWall);

        // Control panel
        const panelGeom = new THREE.BoxGeometry(0.4, 0.6, 0.1);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x222244 });
        const panel = new THREE.Mesh(panelGeom, panelMat);
        panel.position.set(7.2, 1.5, 7);
        this.scene.add(panel);

        // Interactive buttons
        this.createElevatorButtons();
    }

    createElevatorButtons() {
        const buttonData = [
            { label: 'R', floor: 1, y: 1.7 },  // Roof
            { label: 'M', floor: 0, y: 1.5 },  // Main
            { label: 'B', floor: -1, y: 1.3 } // Basement
        ];

        buttonData.forEach(data => {
            const btnGeom = new THREE.CircleGeometry(0.08, 16);
            const btnMat = new THREE.MeshStandardMaterial({ 
                color: 0x44ff88,
                emissive: 0x22aa44,
                emissiveIntensity: 0.5
            });
            const btn = new THREE.Mesh(btnGeom, btnMat);
            btn.position.set(7.15, data.y, 7);
            btn.rotation.y = -Math.PI / 2;
            this.scene.add(btn);

            this.interactiveObjects.push({
                object: btn,
                name: `Floor ${data.label}`,
                desc: 'Take elevator',
                action: () => this.callElevator(data.floor)
            });
        });
    }

    callElevator(targetFloor) {
        if (this.elevator.moving) return;
        
        this.elevator.moving = true;
        this.elevator.targetFloor = targetFloor;
        this.showNotification(`Elevator moving to ${targetFloor === 1 ? 'Roof' : targetFloor === 0 ? 'Main Floor' : 'Basement'}...`);
    }

    updateElevator() {
        if (!this.elevator.moving) return;

        const targetY = this.elevator.targetFloor * 8;
        const currentY = this.elevatorPlatform.position.y;
        const diff = targetY - currentY;

        if (Math.abs(diff) < 0.1) {
            this.elevatorPlatform.position.y = targetY;
            this.elevator.moving = false;
            this.elevator.currentFloor = this.elevator.targetFloor;
            this.showNotification('Elevator arrived!');
            
            // Update player position if on elevator
            const playerDist = this.state.player.pos.distanceTo(
                new THREE.Vector3(8, this.elevatorPlatform.position.y + 1.6, 8)
            );
            if (playerDist < 2) {
                this.state.player.pos.y = targetY + 1.6;
            }
        } else {
            this.elevatorPlatform.position.y += Math.sign(diff) * this.elevator.speed;
            
            // Move walls with platform
            this.elevatorWalls.forEach(wall => {
                wall.position.y = this.elevatorPlatform.position.y + 1.5;
            });

            // Move player if standing on elevator
            const playerDist = this.state.player.pos.distanceTo(
                new THREE.Vector3(8, this.elevatorPlatform.position.y + 1.6, 8)
            );
            if (playerDist < 1.5) {
                this.state.player.pos.y += Math.sign(diff) * this.elevator.speed;
            }
        }
    }

    createSitPoints() {
        // Chairs and couch sit points
        const sitPositions = [
            { pos: [-5, 0.4, -5], name: 'Couch' },
            { pos: [-4, 0.4, -5], name: 'Couch' },
            { pos: [-6, 0.4, -5], name: 'Couch' },
            { pos: [5, 0.4, 5], name: 'Chair' }
        ];

        sitPositions.forEach(data => {
            // Create invisible trigger
            const sitGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const sitMat = new THREE.MeshBasicMaterial({ 
                color: 0x00ff00,
                transparent: true,
                opacity: 0,
                wireframe: true
            });
            const sitTrigger = new THREE.Mesh(sitGeom, sitMat);
            sitTrigger.position.set(data.pos[0], data.pos[1], data.pos[2]);
            this.scene.add(sitTrigger);

            this.interactiveObjects.push({
                object: sitTrigger,
                name: data.name,
                desc: 'Sit down',
                action: () => this.sitDown(data.pos)
            });

            this.sitPoints.push({ position: data.pos, trigger: sitTrigger });
        });
    }

    sitDown(position) {
        this.state.sitting = true;
        this.state.sittingPosition = new THREE.Vector3(position[0], position[1] + 0.6, position[2]);
        this.state.player.canMove = false;
        this.showNotification('Press SPACE to stand up');
    }

    standUp() {
        this.state.sitting = false;
        this.state.sittingPosition = null;
        this.state.player.canMove = true;
        this.showNotification('Standing up...');
    }

    setupControls() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Escape' && this.state.started) {
                this.togglePause();
            }
            if (e.code === 'Space' && this.state.sitting) {
                this.standUp();
            }
            if (e.code === 'KeyE') {
                this.interact();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse look
        document.addEventListener('mousemove', (e) => {
            if (!this.state.started || this.state.paused || !this.state.player.canMove) return;
            
            this.targetCameraRotation.yaw -= e.movementX * this.state.settings.mouseSens;
            this.targetCameraRotation.pitch -= e.movementY * this.state.settings.mouseSens;
            this.targetCameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.targetCameraRotation.pitch));
        });

        // Lock pointer on click
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('click', () => {
            if (this.state.started && !this.state.paused) {
                canvas.requestPointerLock();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupUI() {
        // Start button
        document.getElementById('btn-start').addEventListener('click', () => {
            this.startGame();
        });

        // Pause menu
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('btn-quit').addEventListener('click', () => {
            this.quitToMenu();
        });

        // Modal close buttons
        document.querySelectorAll('.modal-x').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('show');
            });
        });

        // Water bonsai
        document.getElementById('btn-water').addEventListener('click', () => {
            this.waterPlant();
        });

        // Photo upload system
        this.setupPhotoUpload();

        // Custom letter system
        this.setupCustomLetter();

        // Music player (placeholder)
        this.setupMusicPlayer();
    }

    setupPhotoUpload() {
        // Create upload button in HUD
        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'act-btn tooltip upload-photos-btn';
        uploadBtn.setAttribute('data-tip', 'Upload Photos');
        uploadBtn.innerHTML = '<i class="fas fa-camera"></i><span class="act-label">Upload</span>';
        uploadBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b8b, #ff88aa);
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 107, 139, 0.4);
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        document.body.appendChild(uploadBtn);

        uploadBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = 'image/*';
            input.addEventListener('change', (e) => {
                this.handlePhotoUpload(e.target.files);
            });
            input.click();
        });
    }

    handlePhotoUpload(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.state.uploadedPhotos.push(e.target.result);
                this.tanImages.push(e.target.result);
                this.showNotification(`Uploaded ${file.name}!`);
                this.updateTVSlideshow();
            };
            reader.readAsDataURL(file);
        });
    }

    setupCustomLetter() {
        // Create letter write button
        const letterBtn = document.createElement('button');
        letterBtn.className = 'act-btn tooltip write-letter-btn';
        letterBtn.setAttribute('data-tip', 'Write Custom Letter');
        letterBtn.innerHTML = '<i class="fas fa-pen"></i><span class="act-label">Write</span>';
        letterBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: linear-gradient(135deg, #9966ff, #aa88ff);
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(153, 102, 255, 0.4);
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        document.body.appendChild(letterBtn);

        letterBtn.addEventListener('click', () => {
            this.openLetterEditor();
        });
    }

    openLetterEditor() {
        const editor = document.createElement('div');
        editor.className = 'letter-editor-modal';
        editor.innerHTML = `
            <div class="modal-box wide">
                <div class="modal-head">
                    <h2>✍️ Write Your Custom Letter</h2>
                    <button class="modal-x" onclick="this.closest('.letter-editor-modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <textarea id="custom-letter-textarea" placeholder="Write your heartfelt message here..." style="
                        width: 100%;
                        min-height: 300px;
                        padding: 20px;
                        border: 2px solid rgba(255,255,255,0.1);
                        border-radius: 12px;
                        background: rgba(255,255,255,0.05);
                        color: white;
                        font-family: 'Cormorant Garamond', serif;
                        font-size: 18px;
                        resize: vertical;
                    ">${this.state.customLetter}</textarea>
                    <button class="btn btn-primary" onclick="game.saveCustomLetter()" style="margin-top: 20px;">
                        <i class="fas fa-save"></i> Save Letter
                    </button>
                </div>
            </div>
        `;
        editor.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        document.body.appendChild(editor);
    }

    saveCustomLetter() {
        const textarea = document.getElementById('custom-letter-textarea');
        this.state.customLetter = textarea.value;
        this.showNotification('Letter saved! Check the postbox on the roof.');
        document.querySelector('.letter-editor-modal').remove();
    }

    openCustomLetter() {
        const modal = document.getElementById('modal-letter');
        const content = document.getElementById('letter-content-display');
        const title = document.getElementById('letter-title-display');
        
        if (this.state.customLetter) {
            content.textContent = this.state.customLetter;
            title.textContent = 'Your Personal Message 💕';
        } else {
            content.textContent = 'No custom letter written yet. Click the Write button to create one!';
            title.textContent = 'Empty Letter Box';
        }
        
        modal.classList.add('show');
        
        if (!this.state.letterRead && this.state.customLetter) {
            this.state.letterRead = true;
            setTimeout(() => this.triggerValentineFireworks(), 1000);
        }
    }

    setupMusicPlayer() {
        // Placeholder - music controls already in HTML
        const playBtn = document.getElementById('mp-play');
        const prevBtn = document.getElementById('mp-prev');
        const nextBtn = document.getElementById('mp-next');
        const volumeSlider = document.getElementById('mp-volume');

        // Simple toggle
        playBtn.addEventListener('click', () => {
            const icon = playBtn.querySelector('i');
            if (icon.classList.contains('fa-play')) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
                document.getElementById('mp-title').textContent = 'Your Favorite Song';
                document.getElementById('mp-artist').textContent = 'Playing...';
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
                document.getElementById('mp-artist').textContent = 'Paused';
            }
        });
    }

    updateTVSlideshow() {
        if (this.tanImages.length === 0) return;
        
        const loader = new THREE.TextureLoader();
        const currentImage = this.tanImages[this.state.slideshowIndex % this.tanImages.length];
        
        loader.load(currentImage, (texture) => {
            if (this.tvScreen) {
                this.tvScreen.material.map = texture;
                this.tvScreen.material.needsUpdate = true;
            }
        });
    }

    nextSlide() {
        this.state.slideshowIndex++;
        this.updateTVSlideshow();
        this.showNotification(`Photo ${(this.state.slideshowIndex % this.tanImages.length) + 1}/${this.tanImages.length}`);
    }

    interact() {
        if (!this.state.started || this.state.paused) return;

        // Check for interactive object in front of player
        const interactRange = 3;
        const playerPos = this.state.player.pos;
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.camera.rotation);

        for (const obj of this.interactiveObjects) {
            const dist = obj.object.position.distanceTo(playerPos);
            if (dist < interactRange) {
                const dirToObj = new THREE.Vector3()
                    .subVectors(obj.object.position, playerPos)
                    .normalize();
                const dot = forward.dot(dirToObj);
                
                if (dot > 0.7) {
                    obj.action();
                    return;
                }
            }
        }
    }

    openPlantModal() {
        document.getElementById('modal-plant').classList.add('show');
    }

    waterPlant() {
        this.showNotification('🌸 Bonsai watered! It looks happier.');
        // Animate bonsai glow
        if (this.bonsai) {
            this.bonsai.material.emissiveIntensity = 0.5;
            setTimeout(() => {
                this.bonsai.material.emissiveIntensity = 0.2;
            }, 1000);
        }
        document.getElementById('modal-plant').classList.remove('show');
    }

    triggerValentineFireworks() {
        if (this.state.fireworksActive) return;
        this.state.fireworksActive = true;
        
        // Show Valentine message
        const msg = document.createElement('div');
        msg.className = 'valentine-message';
        msg.innerHTML = `
            <h1 style="font-family: 'Cormorant Garamond', serif; font-size: 4rem; color: #ff6b8b; text-shadow: 0 0 20px rgba(255,107,139,0.8);">
                Happy Valentine's Day!
            </h1>
            <p style="font-size: 1.5rem; color: #ffaabb; margin-top: 20px;">
                With all my love 💕
            </p>
        `;
        msg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 9999;
            animation: fadeInScale 1s ease-out;
        `;
        document.body.appendChild(msg);

        // Launch fireworks
        for (let i = 0; i < 15; i++) {
            setTimeout(() => this.launchFirework(), i * 300);
        }

        setTimeout(() => {
            msg.style.animation = 'fadeOut 1s ease-out';
            setTimeout(() => msg.remove(), 1000);
            this.state.fireworksActive = false;
        }, 5000);
    }

    launchFirework() {
        const colors = [0xff6b8b, 0xffaa88, 0xff88ff, 0x88ffff, 0xffff88];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            positions.push(0, 0, 0);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.1 + Math.random() * 0.2;
            velocities.push(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ 
            color, 
            size: 0.2,
            transparent: true,
            opacity: 1
        });
        const firework = new THREE.Points(geometry, material);
        firework.position.set(
            (Math.random() - 0.5) * 30,
            15 + Math.random() * 10,
            (Math.random() - 0.5) * 30
        );
        this.scene.add(firework);
        
        this.fireworks.push({ 
            mesh: firework, 
            velocities, 
            lifetime: 0,
            maxLifetime: 60 
        });
    }

    updateMovement() {
        if (!this.state.player.canMove || this.state.sitting) {
            if (this.state.sitting && this.state.sittingPosition) {
                this.state.player.pos.copy(this.state.sittingPosition);
            }
            return;
        }

        const speed = this.state.player.speed;
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        
        forward.applyEuler(new THREE.Euler(0, this.smoothRotation.yaw, 0));
        right.applyEuler(new THREE.Euler(0, this.smoothRotation.yaw, 0));

        const moveVector = new THREE.Vector3(0, 0, 0);

        if (this.keys['KeyW']) moveVector.add(forward);
        if (this.keys['KeyS']) moveVector.sub(forward);
        if (this.keys['KeyD']) moveVector.add(right);
        if (this.keys['KeyA']) moveVector.sub(right);

        if (moveVector.length() > 0) {
            moveVector.normalize();
            this.state.player.pos.add(moveVector.multiplyScalar(speed));
        }

        // Jump
        if (this.keys['Space'] && this.state.player.canJump && !this.state.sitting) {
            this.physVelY = this.state.player.jumpPower;
            this.state.player.canJump = false;
        }

        // Apply gravity
        this.physVelY -= 0.008;
        this.state.player.pos.y += this.physVelY;

        // Floor collision
        if (this.state.player.pos.y < 1.6) {
            this.state.player.pos.y = 1.6;
            this.physVelY = 0;
            this.state.player.canJump = true;
        }

        // Wall boundaries
        this.state.player.pos.x = Math.max(-9.5, Math.min(9.5, this.state.player.pos.x));
        this.state.player.pos.z = Math.max(-9.5, Math.min(9.5, this.state.player.pos.z));
    }

    updateCamera() {
        // Smooth camera rotation with lerp
        const lerpFactor = 0.15;
        this.smoothRotation.yaw += (this.targetCameraRotation.yaw - this.smoothRotation.yaw) * lerpFactor;
        this.smoothRotation.pitch += (this.targetCameraRotation.pitch - this.smoothRotation.pitch) * lerpFactor;

        this.camera.rotation.set(this.smoothRotation.pitch, this.smoothRotation.yaw, 0, 'YXZ');
        this.camera.position.copy(this.state.player.pos);
    }

    updateAnimations() {
        const time = this.clock.getElapsedTime();

        // Animate candles
        this.candles.forEach((candle, i) => {
            candle.light.intensity = 1.5 + Math.sin(time * 3 + i) * 0.3;
            candle.light.position.y = candle.baseY + Math.sin(time * 2 + i) * 0.05;
        });

        // Animate birds
        this.birds.forEach(bird => {
            bird.angle += bird.speed * this.delta;
            bird.mesh.position.x = Math.cos(bird.angle) * bird.radius;
            bird.mesh.position.z = Math.sin(bird.angle) * bird.radius;
            bird.mesh.position.y = bird.height + Math.sin(time + bird.angle) * 2;
            bird.mesh.rotation.z = Math.sin(time * 2 + bird.angle) * 0.3;
            bird.mesh.lookAt(
                bird.mesh.position.x + Math.cos(bird.angle),
                bird.mesh.position.y,
                bird.mesh.position.z + Math.sin(bird.angle)
            );
        });

        // Animate fish
        this.fish.forEach(fish => {
            fish.angle += fish.speed * this.delta;
            fish.mesh.position.x = Math.cos(fish.angle) * fish.radius;
            fish.mesh.position.z = Math.sin(fish.angle) * fish.radius;
            fish.mesh.position.y = fish.height + Math.sin(time * 0.5 + fish.angle) * 1.5;
            fish.mesh.lookAt(
                fish.mesh.position.x + Math.cos(fish.angle),
                fish.mesh.position.y,
                fish.mesh.position.z + Math.sin(fish.angle)
            );
        });

        // Animate stingrays
        this.stingrays.forEach(ray => {
            ray.angle += ray.speed * this.delta;
            ray.wobble += 0.05;
            ray.mesh.position.x = Math.cos(ray.angle) * ray.radius;
            ray.mesh.position.z = Math.sin(ray.angle) * ray.radius;
            ray.mesh.position.y = ray.height + Math.sin(time * 0.3 + ray.angle) * 3;
            ray.mesh.rotation.x = Math.sin(ray.wobble) * 0.2;
            ray.mesh.rotation.z = Math.cos(ray.wobble * 0.7) * 0.3;
            ray.mesh.lookAt(
                ray.mesh.position.x + Math.cos(ray.angle),
                ray.mesh.position.y,
                ray.mesh.position.z + Math.sin(ray.angle)
            );
        });

        // Animate planets
        this.planets.forEach(planet => {
            planet.angle += planet.speed;
            planet.mesh.rotation.y += 0.005;
            planet.mesh.position.y += Math.sin(time + planet.angle) * 0.01;
        });

        // Update shooting stars
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const star = this.shootingStars[i];
            star.lifetime++;
            
            if (star.lifetime > star.maxLifetime) {
                this.scene.remove(star.mesh);
                this.shootingStars.splice(i, 1);
                continue;
            }
            
            star.mesh.position.add(star.velocity);
            star.mesh.material.opacity = 1 - (star.lifetime / star.maxLifetime);
            
            // Update trail
            const positions = star.mesh.geometry.attributes.position.array;
            for (let j = positions.length - 3; j >= 3; j -= 3) {
                positions[j] = positions[j - 3];
                positions[j + 1] = positions[j - 2];
                positions[j + 2] = positions[j - 1];
            }
            positions[0] = 0;
            positions[1] = 0;
            positions[2] = 0;
            star.mesh.geometry.attributes.position.needsUpdate = true;
        }

        // Update fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.lifetime++;
            
            if (fw.lifetime > fw.maxLifetime) {
                this.scene.remove(fw.mesh);
                this.fireworks.splice(i, 1);
                continue;
            }
            
            const positions = fw.mesh.geometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += fw.velocities[j];
                positions[j + 1] += fw.velocities[j + 1];
                positions[j + 2] += fw.velocities[j + 2];
                fw.velocities[j + 1] -= 0.003; // Gravity
            }
            fw.mesh.geometry.attributes.position.needsUpdate = true;
            fw.mesh.material.opacity = 1 - (fw.lifetime / fw.maxLifetime);
        }

        // Snowflakes fall
        if (this.snowSystem) {
            const positions = this.snowSystem.mesh.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= 0.05;
                if (positions[i] < -10) {
                    positions[i] = 100;
                }
            }
            this.snowSystem.mesh.geometry.attributes.position.needsUpdate = true;
            this.snowSystem.mesh.rotation.y += 0.0002;
        }

        // Rotate dust particles
        if (this.dustSystem) {
            this.dustSystem.rotation.y += 0.0005;
        }
    }

    updateInteractionHint() {
        const hint = document.getElementById('interact-hint');
        const interactName = document.getElementById('interact-text');
        const interactDesc = document.getElementById('interact-desc');
        const crosshair = document.getElementById('crosshair');

        if (!this.state.started || this.state.paused) {
            hint.classList.remove('show');
            return;
        }

        const interactRange = 3;
        const playerPos = this.state.player.pos;
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.camera.rotation);

        let closestObj = null;
        let closestDot = 0.7;

        for (const obj of this.interactiveObjects) {
            const dist = obj.object.position.distanceTo(playerPos);
            if (dist < interactRange) {
                const dirToObj = new THREE.Vector3()
                    .subVectors(obj.object.position, playerPos)
                    .normalize();
                const dot = forward.dot(dirToObj);
                
                if (dot > closestDot) {
                    closestDot = dot;
                    closestObj = obj;
                }
            }
        }

        if (closestObj) {
            hint.classList.add('show');
            crosshair.classList.add('active');
            interactName.textContent = closestObj.name;
            interactDesc.textContent = closestObj.desc;
            this._currentInteractive = closestObj;
        } else {
            hint.classList.remove('show');
            crosshair.classList.remove('active');
            this._currentInteractive = null;
        }
    }

    updateHUD() {
        const clock = document.getElementById('hud-clock');
        const date = document.getElementById('hud-date');
        const location = document.getElementById('hud-location');

        // Current time
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        date.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

        // Location based on floor
        let loc = '🏠 Main Room';
        if (this.state.player.pos.y > 6) loc = '🏞️ Rooftop';
        else if (this.state.player.pos.y < -2) loc = '🔒 Basement';
        location.textContent = loc;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.state.started || this.state.paused) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        this.delta = this.clock.getDelta();

        this.updateMovement();
        this.updateCamera();
        this.updateAnimations();
        this.updateElevator();
        this.updateInteractionHint();
        this.updateHUD();

        this.renderer.render(this.scene, this.camera);
    }

    startGame() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.state.started = true;
        this.state.player.canMove = true;
        document.getElementById('game-canvas').requestPointerLock();
    }

    togglePause() {
        this.state.paused = !this.state.paused;
        const pauseMenu = document.getElementById('pause-menu');
        
        if (this.state.paused) {
            pauseMenu.classList.remove('hidden');
            document.exitPointerLock();
        } else {
            pauseMenu.classList.add('hidden');
            document.getElementById('game-canvas').requestPointerLock();
        }
    }

    quitToMenu() {
        this.state.started = false;
        this.state.paused = false;
        this.state.player.pos.set(0, 1.6, 3);
        document.getElementById('pause-menu').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        document.exitPointerLock();
    }

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.textContent = message;
        notif.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 139, 0.95);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-weight: 600;
            z-index: 9999;
            animation: notifSlide 0.3s ease-out;
            box-shadow: 0 4px 20px rgba(255, 107, 139, 0.5);
        `;
        document.getElementById('notifs').appendChild(notif);
        
        setTimeout(() => {
            notif.style.animation = 'notifFadeOut 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    finishLoading() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
            }, 1200);
        }, 500);
    }
}

// Initialize
const game = new GameEngine();
window.game = game;

// Add animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
        }
    }

    @keyframes notifSlide {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes notifFadeOut {
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
        }
    }

    .modal.show {
        display: flex !important;
        animation: modalFadeIn 0.3s ease-out;
    }

    @keyframes modalFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .crosshair.active .crosshair-ring {
        border-color: #ff6b8b;
        transform: scale(1.2);
    }

    .interact-hint {
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .interact-hint.show {
        opacity: 1;
    }
`;
document.head.appendChild(style);