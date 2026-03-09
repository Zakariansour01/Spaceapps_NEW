// solarSystem.js - Integrated version with your existing Three.js code

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

class SolarSystemView {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.sun = null;
        this.planets = [];
        this.planetMeshes = [];
        this.animationId = null;
        this.textureLoader = null;
        this.cubeTextureLoader = null;
        
        this.init();
        this.loadTextures();
        this.createObjects();
        this.setupLighting();
        this.animate();
        this.setupEventListeners();
    }
    
    init() {
        // Get the canvas in the solar system container
        const canvas = document.querySelector('.solar-system-container .threejs');
        const container = document.querySelector('.solar-system-container');
        
        if (!canvas || !container) {
            console.error('Solar system canvas or container not found');
            return;
        }
        
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            300
        );
        this.camera.position.z = 50; // Adjusted for better view in container
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        
        // Initialize loaders
        this.textureLoader = new THREE.TextureLoader();
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    loadTextures() {
        try {
            // Load planet textures (you'll need to update these paths to match your project structure)
            const sunTexture = this.textureLoader.load('Textures/sun.png');
            const earthTexture = this.textureLoader.load('Textures/earth.jpg');
            const marsTexture = this.textureLoader.load('Textures/mars.jpg');
            
            // Load cube map for background
            this.cubeTextureLoader.setPath('Textures/cubeMap/');
            const backgroundCube = this.cubeTextureLoader.load([
                'px.png', 'nx.png',
                'py.png', 'ny.png',
                'pz.png', 'nz.png'
            ]);
            this.scene.background = backgroundCube;
            
            // Store textures for use in createObjects
            this.textures = {
                sun: sunTexture,
                earth: earthTexture,
                mars: marsTexture
            };
        } catch (error) {
            console.warn('Some textures failed to load, using fallback colors');
            // Fallback to solid colors if textures don't load
            this.scene.background = new THREE.Color(0x000011);
            this.textures = {};
        }
    }
    
    createObjects() {
        // Sphere geometry for all celestial bodies
        const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
        
        // Materials
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: this.textures.sun || null,
            color: this.textures.sun ? 0xffffff : 0xffff00
        });
        
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.earth || null,
            color: this.textures.earth ? 0xffffff : 0x6b93d6
        });
        
        const marsMaterial = new THREE.MeshStandardMaterial({
            map: this.textures.mars || null,
            color: this.textures.mars ? 0xffffff : 0xcd5c5c
        });
        
        const moonMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888
        });
        
        // Create Sun
        this.sun = new THREE.Mesh(sphereGeo, sunMaterial);
        this.sun.scale.setScalar(5);
        this.scene.add(this.sun);
        
        // Planet configuration
        this.planets = [
            {
                name: 'Earth',
                radius: 1,
                distance: 20,
                speed: 0.005,
                material: earthMaterial,
                moons: [
                    {
                        name: 'Moon',
                        radius: 0.3,
                        distance: 3,
                        speed: 0.015
                    }
                ]
            },
            {
                name: 'Mars',
                radius: 2,
                distance: 30,
                speed: 0.01,
                material: marsMaterial,
                moons: [
                    {
                        name: 'Phobos',
                        radius: 0.1,
                        distance: 2,
                        speed: 0.02
                    }
                ]
            }
        ];
        
        // Create planets and moons
        this.planetMeshes = this.planets.map((planet) => {
            const planetMesh = this.createPlanet(planet, sphereGeo);
            this.scene.add(planetMesh);
            
            planet.moons.forEach(moon => {
                const moonMesh = this.createMoon(moon, sphereGeo, moonMaterial);
                planetMesh.add(moonMesh);
            });
            
            return planetMesh;
        });
    }
    
    createPlanet(planet, geometry) {
        const planetMesh = new THREE.Mesh(geometry, planet.material);
        planetMesh.scale.setScalar(planet.radius);
        planetMesh.position.x = planet.distance;
        planetMesh.castShadow = true;
        planetMesh.receiveShadow = true;
        return planetMesh;
    }
    
    createMoon(moon, geometry, material) {
        const moonMesh = new THREE.Mesh(geometry, material);
        moonMesh.scale.setScalar(moon.radius);
        moonMesh.position.x = moon.distance;
        moonMesh.castShadow = true;
        moonMesh.receiveShadow = true;
        return moonMesh;
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Point light at the sun
        const pointLight = new THREE.PointLight(0xffffff, 2);
        pointLight.position.set(0, 0, 0);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        this.scene.add(pointLight);
    }
    
    setupEventListeners() {
        // Pause/Resume button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            let isPaused = false;
            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                if (isPaused) {
                    cancelAnimationFrame(this.animationId);
                    pauseBtn.textContent = 'Resume';
                } else {
                    this.animate();
                    pauseBtn.textContent = 'Pause';
                }
            });
        }
        
        // Reset view button
        const resetViewBtn = document.getElementById('resetViewBtn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                this.camera.position.set(0, 0, 50);
                this.camera.lookAt(0, 0, 0);
                if (this.controls) {
                    this.controls.reset();
                }
            });
        }
        
        // Connect with existing parameter controls
        this.connectParameterControls();
    }
    
    connectParameterControls() {
        const diameterSlider = document.getElementById('diameter');
        const densitySlider = document.getElementById('density');
        const speedSlider = document.getElementById('speed');
        
        if (diameterSlider && densitySlider && speedSlider) {
            [diameterSlider, densitySlider, speedSlider].forEach(slider => {
                slider.addEventListener('input', () => {
                    this.updateAsteroidParameters(
                        parseFloat(diameterSlider.value),
                        parseFloat(densitySlider.value),
                        parseFloat(speedSlider.value)
                    );
                });
            });
        }
    }
    
    updateAsteroidParameters(diameter, density, speed) {
        // You can add a custom asteroid here if needed
        // For now, we'll adjust Mars as an example asteroid
        if (this.planetMeshes.length > 1) {
            const mars = this.planetMeshes[1]; // Mars as our "asteroid"
            const scale = diameter / 100; // Normalize
            mars.scale.setScalar(this.planets[1].radius * scale);
            
            // Update material color based on density
            const material = mars.material;
            if (material) {
                const hue = THREE.MathUtils.mapLinear(density, 1000, 8000, 0.1, 0.7);
                material.color.setHSL(hue, 0.5, 0.8);
            }
            
            // Update speed
            this.planets[1].speed = speed / 1000;
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Rotate planets around the sun (your original logic)
        this.planetMeshes.forEach((planet, planetIndex) => {
            planet.rotation.y += this.planets[planetIndex].speed;
            planet.position.x = Math.sin(planet.rotation.y) * this.planets[planetIndex].distance;
            planet.position.z = Math.cos(planet.rotation.y) * this.planets[planetIndex].distance;
            
            // Animate moons
            planet.children.forEach((moon, moonIndex) => {
                if (this.planets[planetIndex].moons && this.planets[planetIndex].moons[moonIndex]) {
                    moon.rotation.y += this.planets[planetIndex].moons[moonIndex].speed;
                    moon.position.x = Math.sin(moon.rotation.y) * this.planets[planetIndex].moons[moonIndex].distance;
                    moon.position.z = Math.cos(moon.rotation.y) * this.planets[planetIndex].moons[moonIndex].distance;
                }
            });
        });
        
        // Optional: Add some rotation to the sun
        if (this.sun) {
            this.sun.rotation.y += 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const container = document.querySelector('.solar-system-container');
        if (!container) return;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js objects
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure the DOM is fully rendered
    setTimeout(() => {
        try {
            const solarSystem = new SolarSystemView();
            
            // Store reference globally for debugging
            window.solarSystem = solarSystem;
            
            // Clean up on page unload
            window.addEventListener('beforeunload', () => {
                solarSystem.destroy();
            });
            
        } catch (error) {
            console.error('Failed to initialize solar system:', error);
        }
    }, 100);
});