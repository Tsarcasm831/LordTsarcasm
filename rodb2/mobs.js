// mobs.js - Expanded Mobs with Unique Characteristics

import * as THREE from 'three';

class Mob {
  constructor(position) {
    this.mesh = this.createMesh();
    this.mesh.position.copy(position);
    scene.add(this.mesh);
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

  update(delta) {
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

// New Mob Types

class RockGolem extends Mob {
  constructor(position) {
    super(position);
    this.health = 200;
    this.speed = 0.8;
  }

  createMesh() {
    const geometry = new THREE.DodecahedronGeometry(1.5, 0);
    const material = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  attackPlayer() {
    health = Math.max(0, health - 0.5); // Stronger attack
    updateStatusBars();
  }
}

class ForestSpirit extends Mob {
  constructor(position) {
    super(position);
    this.health = 100;
    this.speed = 2.5;
  }

  createMesh() {
    const geometry = new THREE.CylinderGeometry(0.5, 1.5, 3, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x228B22, opacity: 0.8, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  update(delta) {
    super.update(delta);
    // Heals itself over time
    if (Math.random() < 0.01 && this.health < 100) {
      this.health += 1;
    }
  }
}

class FireImp extends Mob {
  constructor(position) {
    super(position);
    this.health = 50;
    this.speed = 3;
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(0.8, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff4500 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  update(delta) {
    super.update(delta);
    // Leaves a small trail of fire particles
    if (Math.random() < 0.05) {
      this.leaveFireTrail();
    }
  }

  leaveFireTrail() {
    const fireGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const fireMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const fire = new THREE.Mesh(fireGeometry, fireMaterial);
    fire.position.copy(this.mesh.position);
    scene.add(fire);
    setTimeout(() => scene.remove(fire), 2000); // Remove after 2 seconds
  }
}

export { Mob, RockGolem, ForestSpirit, FireImp };
