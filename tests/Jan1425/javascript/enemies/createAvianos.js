// createAvianos.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates an "Avianos" enemy (bird-like).
 */
export function createAvianos(x, y, z) {
    const color      = 0xffff00;
    const texture    = 'textures/enemies/avianos.png';
    const pattern    = 'plain';
    const height     = 1.5;
    const bodyShape  = 'average';
    const damageRate = 3.2;
    const name       = 'Avianos';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Large feathered wings
    function createWing(width, height, segments, color, opacity = 0.9) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(width / 2, height / 2, width, 0);
        shape.quadraticCurveTo(width / 2, -height * 0.8, 0, 0);

        const geometry = new THREE.ShapeGeometry(shape, segments);
        const material = new THREE.MeshStandardMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity,
            roughness: 0.5,
            metalness: 0.2
        });
        const wing = new THREE.Mesh(geometry, material);
        wing.castShadow = true;
        return wing;
    }

    const wingSpan = 14;
    const wingHeight = 10;

    function createFeatheredWing(isLeft) {
        const wingGroup = new THREE.Group();
        // Main wing
        const mainWing = createWing(wingSpan, wingHeight, 32, 0xcccccc);
        wingGroup.add(mainWing);
        
        // Additional feathers
        const featherCount = 8;
        for (let i = 0; i < featherCount; i++) {
            const feather = createWing(wingSpan * 0.3, wingHeight * 0.2, 16, 0xdddddd, 0.7);
            feather.position.set(
                (isLeft ? -1 : 1) * (wingSpan * 0.1 * i),
                -wingHeight * 0.1 * i,
                0
            );
            feather.rotation.z = (isLeft ? 1 : -1) * Math.PI * 0.1;
            wingGroup.add(feather);
        }
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
        new THREE.ConeGeometry(0.3, 1.5, 4),
        new THREE.MeshStandardMaterial({
            color: 0xccaa00,
            metalness: 0.3,
            roughness: 0.7
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

    return enemy;
}