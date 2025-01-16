// createTalEhn.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates a "Tal'Ehn" enemy with floating orbs and energy tendrils.
 */
export function createTalEhn(x, y, z) {
    const color      = 0x0000ff;
    const texture    = 'textures/enemies/tal_ehn.png';
    const pattern    = 'spotted';
    const height     = 1.6;
    const bodyShape  = 'slim';
    const damageRate = 3.0;
    const name       = "Tal'Ehn";

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Scale
    enemy.scale.set(0.9, 1.2, 0.9);

    // 3) Floating orbs
    const orbCount = 3;
    for (let i = 0; i < orbCount; i++) {
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0x001133,
                metalness: 0.9,
                roughness: 0.1,
                emissive: 0x0033ff,
                emissiveIntensity: 0.5
            })
        );
        orb.position.set(
            Math.sin(i * Math.PI * 2 / orbCount) * 2,
            14,
            Math.cos(i * Math.PI * 2 / orbCount) * 2
        );
        enemy.add(orb);
    }

    // 4) Energy tendrils
    function createTendril(length, segments, radius, color, glowColor) {
        const group = new THREE.Group();
        const segmentHeight = length / segments;
        let prevSegment = null;

        for (let i = 0; i < segments; i++) {
            const geometry = new THREE.CylinderGeometry(
                radius * (1 - i / segments), 
                radius * (1 - (i + 1) / segments), 
                segmentHeight, 
                8
            );
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.5,
                emissive: glowColor,
                emissiveIntensity: 0.5
            });
            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = -segmentHeight / 2;
            segment.castShadow = true;

            if (prevSegment) {
                prevSegment.add(segment);
            } else {
                group.add(segment);
            }
            prevSegment = segment;
        }
        return group;
    }

    const tendrilCount = 4;
    for (let i = 0; i < tendrilCount; i++) {
        const tendril = createTendril(6, 8, 0.15, 0x001133, 0x0033ff);
        tendril.position.set(
            Math.sin(i * Math.PI * 2 / tendrilCount) * 1.5,
            12,
            Math.cos(i * Math.PI * 2 / tendrilCount) * 1.5
        );
        tendril.rotation.x = Math.PI / 6;
        tendril.rotation.y = i * Math.PI * 2 / tendrilCount;
        enemy.add(tendril);
    }

    // 5) Technological aura
    enemy.traverse(child => {
        if (child.isMesh) {
            child.material.emissive = new THREE.Color(0x001133);
            child.material.emissiveIntensity = 0.3;
            child.material.metalness = 0.7;
            child.material.roughness = 0.3;
        }
    });

    // 6) Position & userData
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
        enemyType: 'tal_ehn'
    };

    // 7) Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}