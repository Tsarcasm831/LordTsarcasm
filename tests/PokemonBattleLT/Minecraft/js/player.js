import * as THREE from 'three';

export class Player {
    constructor(camera) {
        this.camera = camera;
        this.height = 1.6;
        this.normalSpeed = 0.1;
        this.sprintSpeed = 0.2;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.isSprinting = false;
    }

    checkBlockCollision(position, blocks) {
        const playerBoundingBox = new THREE.Box3().setFromCenterAndSize(
            position,
            new THREE.Vector3(0.6, this.height, 0.6)
        );

        for (const block of blocks) {
            if (!block.visible) continue;

            const blockBoundingBox = new THREE.Box3().setFromObject(block);
            if (playerBoundingBox.intersectsBox(blockBoundingBox)) {
                return true;
            }
        }
        return false;
    }

    update(delta, blocks) {
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
            const speed = this.isSprinting ? this.sprintSpeed : this.normalSpeed;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            if (this.moveForward || this.moveBackward) {
                this.velocity.z -= this.direction.z * speed;
            }
            if (this.moveLeft || this.moveRight) {
                this.velocity.x -= this.direction.x * speed;
            }
        }

        // Apply gravity and check for ground collision
        this.velocity.y -= 9.8 * delta;

        const newPosition = this.camera.position.clone();
        newPosition.x += this.velocity.x;
        newPosition.y += this.velocity.y;
        newPosition.z += this.velocity.z;

        if (!this.checkBlockCollision(newPosition, blocks)) {
            this.camera.position.copy(newPosition);
        } else {
            this.velocity.set(0, 0, 0);
        }

        // Apply friction
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;
    }
}
