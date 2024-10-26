// particles.js - Particle system management
const PARTICLE_POOL_SIZE = 15000;
const particlePool = [];

function initParticlePool() {
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        particlePool.push(new THREE.Vector3());
    }
}

function getParticle() {
    return particlePool.pop() || new THREE.Vector3();
}

function releaseParticle(particle) {
    particlePool.push(particle);
}

export { initParticlePool, getParticle, releaseParticle, PARTICLE_POOL_SIZE };
