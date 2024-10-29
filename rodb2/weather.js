// weather.js - Weather system

import * as THREE from './node_modules/three/build/three.module.js';


const PARTICLE_POOL_SIZE = 15000;

export class WeatherSystem {
    constructor(scene, player, biomes, getBiome) {
        this.scene = scene;
        this.player = player;
        this.biomes = biomes;
        this.getBiome = getBiome;

        this.currentWeather = 'clear';
        this.rainParticles = null;
        this.snowParticles = null;
        this.rainClouds = [];

        this.initWeatherEffects();
        this.createRainClouds();
    }

    initWeatherEffects() {
        // Initialize Rain Particles
        const rainGeometry = new THREE.BufferGeometry();
        const rainVertices = [];
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            const x = Math.random() * 1000 - 500;
            const y = Math.random() * 500;
            const z = Math.random() * 1000 - 500;
            rainVertices.push(x, y, z);
        }
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        });
        this.rainParticles = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(this.rainParticles);
        this.rainParticles.visible = false;
    
        // Initialize Snow Particles
        const snowGeometry = new THREE.BufferGeometry();
        const snowVertices = [];
        for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
            const x = Math.random() * 1000 - 500;
            const y = Math.random() * 500;
            const z = Math.random() * 1000 - 500;
            snowVertices.push(x, y, z);
        }
        snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true
        });
        this.snowParticles = new THREE.Points(snowGeometry, snowMaterial);
        this.scene.add(this.snowParticles);
        this.snowParticles.visible = false;
    }

    createRainClouds() {
        const cloudGeometry = new THREE.SphereGeometry(50, 32, 32);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0x8a8a8a,
            transparent: true,
            opacity: 0.8
        });
    
        for (let i = 0; i < 5; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                Math.random() * 1000 - 500,
                200 + Math.random() * 100,
                Math.random() * 1000 - 500
            );
            cloud.scale.set(1 + Math.random() * 0.5, 0.5 + Math.random() * 0.3, 1 + Math.random() * 0.5);
            this.scene.add(cloud);
            this.rainClouds.push(cloud);
        }
    }

    updateWeather() {
        const biome = this.getBiome(this.player.position.x, this.player.position.z);
        let newWeather = 'clear';
    
        if (biome === this.biomes.TUNDRA) {
            newWeather = Math.random() < 0.4 ? 'snow' : 'clear';
        } else if (biome === this.biomes.JUNGLE || biome === this.biomes.FOREST || biome === this.biomes.DENSE_FOREST) {
            newWeather = Math.random() < 0.3 ? 'rain' : 'clear';
        }
    
        if (newWeather !== this.currentWeather) {
            this.currentWeather = newWeather;
            this.rainParticles.visible = this.currentWeather === 'rain';
            this.snowParticles.visible = this.currentWeather === 'snow';
        }
    
        if (this.currentWeather === 'rain') {
            const positions = this.rainParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 2; // Decrease y position
                if (positions[i + 1] < 0) positions[i + 1] = 500; // Reset if below ground
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
    
            this.rainClouds.forEach(cloud => {
                cloud.position.x += Math.sin(Date.now() * 0.001) * 0.5;
                cloud.position.z += Math.cos(Date.now() * 0.001) * 0.5;
            });
        } else if (this.currentWeather === 'snow') {
            const positions = this.snowParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= 0.1; // Decrease y position
                if (positions[i + 1] < 0) positions[i + 1] = 500; // Reset if below ground
            }
            this.snowParticles.geometry.attributes.position.needsUpdate = true;
        }
    }

    setWeather(weather) {
        this.currentWeather = weather;
        this.rainParticles.visible = weather === 'rain';
        this.snowParticles.visible = weather === 'snow';
    
        this.rainClouds.forEach(cloud => {
            cloud.visible = weather === 'rain' || weather === 'snow';
        });
    }
        
    setTimeOfDay(timeOfDay) {
        switch (timeOfDay) {
            case 'day':
                this.scene.background = new THREE.Color(0x87CEEB);
                this.scene.fog.color = new THREE.Color(0x87CEEB);
                break;
            case 'sunset':
                this.scene.background = new THREE.Color(0xFF4500);
                this.scene.fog.color = new THREE.Color(0xFF4500);
                break;
            case 'night':
                this.scene.background = new THREE.Color(0x000022);
                this.scene.fog.color = new THREE.Color(0x000022);
                break;
            case 'sunrise':
                this.scene.background = new THREE.Color(0xFFD700);
                this.scene.fog.color = new THREE.Color(0xFFD700);
                break;
            default:
                console.warn(`Unknown time of day: ${timeOfDay}`);
        }
    }
}