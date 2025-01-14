// createChiropteran.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates a "Chiropteran" enemy (bat-like).
 */
export function createChiropteran(x, y, z) {
    const color      = 0xffa500;
    const texture    = 'textures/enemies/chiropteran.png';
    const pattern    = 'striped';
    const height     = 1.75;
    const bodyShape  = 'muscular';
    const damageRate = 2.8;
    const name       = 'Chiropteran';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Scale
    enemy.scale.set(1.1, 1.0, 1.1);

    // Large membrane wings
    function createMembraneWing() {
        const membraneWingSpan = 16;
        const membraneWingHeight = 12;
        const points = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(membraneWingSpan * 0.2, membraneWingHeight * 0.3),
            new THREE.Vector2(membraneWingSpan * 0.4, membraneWingHeight * 0.7),
            new THREE.Vector2(membraneWingSpan * 0.6, membraneWingHeight * 0.9),
            new THREE.Vector2(membraneWingSpan * 0.8, membraneWingHeight * 0.7),
            new THREE.Vector2(membraneWingSpan, membraneWingHeight * 0.5),
            new THREE.Vector2(membraneWingSpan * 0.9, membraneWingHeight * 0.2),
            new THREE.Vector2(membraneWingSpan * 0.7, 0),
        ];
        const shape = new THREE.Shape();
        shape.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            shape.lineTo(points[i].x, points[i].y);
        }
        shape.lineTo(points[0].x, points[0].y);

        const membrane = new THREE.Mesh(
            new THREE.ShapeGeometry(shape),
            new THREE.MeshStandardMaterial({
                color: 0x330000,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                emissive: 0x110000,
                emissiveIntensity: 0.2
            })
        );

        // Add "bones"
        const bones = new THREE.Group();
        for (let i = 1; i < points.length - 1; i++) {
            const boneLength = Math.sqrt(points[i].x * points[i].x + points[i].y * points[i].y);
            const bone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.05, boneLength, 4),
                new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 })
            );
            bone.position.set(points[i].x / 2, points[i].y / 2, 0);
            bone.rotation.z = Math.atan2(points[i].y, points[i].x);
            bones.add(bone);
        }

        const wingGroup = new THREE.Group();
        wingGroup.add(membrane, bones);
        return wingGroup;
    }

    const leftMembraneWing = createMembraneWing();
    leftMembraneWing.position.set(-0.5, 12, -1);
    leftMembraneWing.rotation.set(-Math.PI / 4, Math.PI / 2, 0);

    const rightMembraneWing = createMembraneWing();
    rightMembraneWing.position.set(0.5, 12, -1);
    rightMembraneWing.rotation.set(-Math.PI / 4, -Math.PI / 2, 0);

    enemy.add(leftMembraneWing, rightMembraneWing);

    // Bat-like ears
    const ears = new THREE.Group();
    [-1, 1].forEach(side => {
        const ear = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 1.2, 3),
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.8
            })
        );
        ear.position.set(side * 0.8, 19, 0);
        ear.rotation.z = side * Math.PI / 6;
        ears.add(ear);
    });
    enemy.add(ears);

    // Nocturnal look
    enemy.traverse(child => {
        if (child.isMesh) {
            child.material.emissive = new THREE.Color(0x330000);
            child.material.emissiveIntensity = 0.2;
        }
    });

    // 3) Position & userData
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
        enemyType: 'chiropteran'
    };

    // 4) Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}