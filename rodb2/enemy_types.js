// enemy_types.js
export const ENEMY_TYPES = {
    SLIME: {
        name: 'slime',
        health: 30,
        damage: 3,
        speed: 2,
        size: { width: 1, height: 0.8, depth: 1 },
        color: 0x00ff00,  // Green
        yOffset: 0.4,
        animationSpeed: 1.2,
        bounceHeight: 0.3,
        description: 'Fast but weak slime that bounces around'
    },
    GOLEM: {
        name: 'golem',
        health: 100,
        damage: 10,
        speed: 0.8,
        size: { width: 1.5, height: 2.5, depth: 1.5 },
        color: 0x808080,  // Gray
        yOffset: 1.25,
        animationSpeed: 0.5,
        description: 'Slow but powerful rock monster'
    },
    WRAITH: {
        name: 'wraith',
        health: 60,
        damage: 7,
        speed: 1.5,
        size: { width: 1, height: 2, depth: 1 },
        color: 0x4B0082,  // Indigo
        yOffset: 1.5,
        animationSpeed: 0.8,
        floatHeight: 0.5,
        description: 'Ghost-like enemy that floats and phases through obstacles'
    }
};