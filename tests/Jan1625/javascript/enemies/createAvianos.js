// createAvianos.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates an "Avianos" enemy (bird-like).
 */
export function createAvianos(x, y, z) {
    const color      = 0x4169E1; // Royal blue base color
    const texture    = 'textures/enemies/avianos.png';
    const pattern    = 'feathered';
    const height     = 2.0; // Increased height for more imposing presence
    const bodyShape  = 'athletic';
    const damageRate = 4.0; // Increased damage
    const name       = 'Avianos';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // Removed pectorals from Avianos
    enemy.traverse(child => {
        if (child.name === 'pectoral') {
            enemy.remove(child);
        }
    });

    // 2) Large feathered wings
    function createWing(width, height, segments, color, opacity = 0.9) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        // More dramatic wing curve
        shape.quadraticCurveTo(width / 3, height / 1.5, width, 0);
        shape.quadraticCurveTo(width / 2, -height * 0.9, 0, 0);

        const geometry = new THREE.ShapeGeometry(shape, segments);
        const material = new THREE.MeshPhysicalMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity,
            roughness: 0.3,
            metalness: 0.4,
            emissive: new THREE.Color(0x1E90FF),
            emissiveIntensity: 0.3
        });
        const wing = new THREE.Mesh(geometry, material);
        wing.castShadow = true;
        return wing;
    }

    const wingSpan = 18; // Increased wing span
    const wingHeight = 12; // Increased wing height

    function createFeatheredWing(isLeft) {
        const wingGroup = new THREE.Group();
        // Main wing with glowing effect
        const mainWing = createWing(wingSpan, wingHeight, 48, 0x4169E1);
        wingGroup.add(mainWing);
        
        // More detailed feathers
        const featherCount = 12;
        for (let i = 0; i < featherCount; i++) {
            const feather = createWing(
                wingSpan * 0.35,
                wingHeight * 0.25,
                24,
                i % 2 === 0 ? 0x4169E1 : 0x87CEEB,
                0.85
            );
            feather.position.set(
                (isLeft ? -1 : 1) * (wingSpan * 0.12 * i),
                -wingHeight * 0.12 * i,
                i * 0.1 // Adding depth to feathers
            );
            feather.rotation.z = (isLeft ? 1 : -1) * Math.PI * 0.12;
            wingGroup.add(feather);
        }

        // Add glowing tips
        const glowTip = new THREE.PointLight(0x87CEEB, 1, 5);
        glowTip.position.set(
            (isLeft ? -1 : 1) * wingSpan * 0.8,
            0,
            0
        );
        wingGroup.add(glowTip);

        return wingGroup;
    }

    const leftWing = createFeatheredWing(true);
    leftWing.position.set(-0.5, 12, 0);
    leftWing.rotation.set(-Math.PI / 6, Math.PI / 2, 0);

    const rightWing = createFeatheredWing(false);
    rightWing.position.set(0.5, 12, 0);
    rightWing.rotation.set(-Math.PI / 6, -Math.PI / 2, 0);

    enemy.add(leftWing, rightWing);

    // 3) Beak
    const beak = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 2.0, 6),
        new THREE.MeshPhysicalMaterial({
            color: 0xFFD700,
            metalness: 0.6,
            roughness: 0.3,
            emissive: 0x996515,
            emissiveIntensity: 0.2
        })
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 18, 1);
    enemy.add(beak);

    // 4) Position & userData
    enemy.position.set(x, y, z);

    enemy.userData = {
        type: 'hostile',
        name,
        health: 100,
        isDead: false,
        hasBeenLooted: false,
        damageRate,
        pattern,
        height,
        bodyShape,
        enemyType: 'avianos'
    };

    // 5) Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    // Add glowing aura
    const aura = new THREE.PointLight(0x4169E1, 1, 8);
    aura.position.set(0, 15, 0);
    enemy.add(aura);

    // Add particle effects for wings
    function createParticleSystem() {
        const particles = new THREE.BufferGeometry();
        const particleCount = 100;
        const positions = new Float32Array(particleCount * 3);
        
        for(let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * wingSpan;
            positions[i + 1] = (Math.random() - 0.5) * wingHeight;
            positions[i + 2] = (Math.random() - 0.5) * 2;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x87CEEB,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        return new THREE.Points(particles, material);
    }

    const leftWingParticles = createParticleSystem();
    const rightWingParticles = createParticleSystem();
    leftWing.add(leftWingParticles);
    rightWing.add(rightWingParticles);

    return enemy;
}