// Mob.js
import { getTerrainHeight } from './terrain.js';
import { updateStatusBars } from './ui.js';

export class Mob {
    constructor(position) {
        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        this.direction = new THREE.Vector3(
            (Math.random() - 0.5),
            0,
            (Math.random() - 0.5)
        ).normalize();
        this.speed = 1.5;
        this.health = 50;
    }

    createMesh() {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    update(delta, player, health) {
        const moveDistance = this.speed * delta;
        const movement = this.direction.clone().multiplyScalar(moveDistance);
        this.mesh.position.add(movement);

        if (Math.random() < 0.02) {
            this.direction.set(
                (Math.random() - 0.5),
                0,
                (Math.random() - 0.5)
            ).normalize();
        }

        const terrainHeight = getTerrainHeight(this.mesh.position.x, this.mesh.position.z);
        if (this.mesh.position.y < terrainHeight + 1) {
            this.mesh.position.y = terrainHeight + 1;
        }

        const distanceToPlayer = this.mesh.position.distanceTo(player.position);
        if (distanceToPlayer < 2) {
            this.attackPlayer();
        }
    }

    attackPlayer() {
        health = Math.max(0, health - 0.1);
        updateStatusBars();
    }
}