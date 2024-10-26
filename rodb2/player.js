// player.js - Player-related functionality
class Player {
    constructor(camera) {
        this.object = new THREE.Object3D();
        this.object.add(camera);
        camera.position.set(0, 2, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.canJump = true;
        this.health = 100;
        this.hunger = 100;
    }

    update(delta, moveForward, moveBackward, moveLeft, moveRight, jump) {
        // Move existing player update logic here
    }
}

export { Player };