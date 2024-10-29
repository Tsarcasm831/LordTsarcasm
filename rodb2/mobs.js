// mobs.js
import { ENEMY_TYPES } from './enemy_types.js';
import { getTerrainHeight } from './terrain.js';
import { updateStatusBars } from './ui.js';

class AnimationController {
    constructor(mesh, type) {
        this.mesh = mesh;
        this.type = type;
        this.time = 0;
        this.baseY = 0;
    }

    update(delta) {
        this.time += delta * this.type.animationSpeed;

        switch (this.type.name) {
            case 'slime':
                // Bouncing animation
                const bounceHeight = this.type.bounceHeight;
                this.mesh.position.y = this.baseY + Math.abs(Math.sin(this.time * 5)) * bounceHeight;
                this.mesh.scale.y = 1 + Math.sin(this.time * 5) * 0.2;
                this.mesh.scale.x = 1 - Math.sin(this.time * 5) * 0.1;
                this.mesh.scale.z = 1 - Math.sin(this.time * 5) * 0.1;
                break;

            case 'golem':
                // Walking animation with body rotation
                this.mesh.rotation.y = Math.sin(this.time * 2) * 0.1;
                const walkBob = Math.abs(Math.sin(this.time * 4)) * 0.1;
                this.mesh.position.y = this.baseY + walkBob;
                break;

            case 'wraith':
                // Floating animation with ethereal movement
                const floatOffset = Math.sin(this.time * 2) * this.type.floatHeight;
                this.mesh.position.y = this.baseY + floatOffset;
                this.mesh.material.opacity = 0.7 + Math.sin(this.time * 3) * 0.3;
                break;
        }
    }

    setBaseY(y) {
        this.baseY = y + this.type.yOffset;
    }
}

export class Mob {
    constructor(position, type) {
        this.type = ENEMY_TYPES[type];
        this.mesh = this.createMesh();
        this.mesh.position.copy(position);
        this.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
       
        // Stats
        this.health = this.type.health;
        this.maxHealth = this.type.health;
        this.damage = this.type.damage;
        this.speed = this.type.speed;
       
        // Combat state
        this.lastAttackTime = 0;
        this.attackCooldown = 1000; // 1 second
        this.attackRange = 2;
        this.detectionRange = 15;
        this.isAttacking = false;

        // Animation
        this.animator = new AnimationController(this.mesh, this.type);
       
        // Add health bar
        this.healthBar = this.createHealthBar();
        this.mesh.add(this.healthBar);
    }

    createMesh() {
        let geometry;
       
        switch(this.type.name) {
            case 'slime':
                geometry = new THREE.SphereGeometry(
                    this.type.size.width / 2,
                    16,
                    16
                );
                break;
           
            case 'golem':
                geometry = this.createGolemGeometry();
                break;
           
            case 'wraith':
                geometry = this.createWraithGeometry();
                break;
        }

        const material = new THREE.MeshPhongMaterial({
            color: this.type.color,
            transparent: this.type.name === 'wraith',
            opacity: this.type.name === 'wraith' ? 0.7 : 1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    createGolemGeometry() {
        const group = new THREE.Group();

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(
                this.type.size.width,
                this.type.size.height * 0.6,
                this.type.size.depth
            ),
            new THREE.MeshPhongMaterial({ color: this.type.color })
        );
        group.add(body);

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(
                this.type.size.width * 0.7,
                this.type.size.height * 0.4,
                this.type.size.depth * 0.7
            ),
            new THREE.MeshPhongMaterial({ color: this.type.color })
        );
        head.position.y = this.type.size.height * 0.5;
        group.add(head);

        return group;
    }

    createWraithGeometry() {
        const group = new THREE.Group();

        // Main body (cone-like shape)
        const body = new THREE.Mesh(
            new THREE.ConeGeometry(
                this.type.size.width * 0.5,
                this.type.size.height,
                8
            ),
            new THREE.MeshPhongMaterial({
                color: this.type.color,
                transparent: true,
                opacity: 0.7
            })
        );
        group.add(body);

        return group;
    }

    createHealthBar() {
        const healthBarWidth = this.type.size.width * 1.2;
        const healthBarHeight = 0.1;
       
        const healthBarGroup = new THREE.Group();
        healthBarGroup.position.y = this.type.size.height + 0.5;

        // Background bar
        const bgGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
        healthBarGroup.add(bgBar);

        // Health bar
        const healthGeometry = new THREE.PlaneGeometry(healthBarWidth, healthBarHeight);
        const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.healthBarFill = new THREE.Mesh(healthGeometry, healthMaterial);
        this.healthBarFill.position.z = 0.01;
        healthBarGroup.add(this.healthBarFill);

        // Make health bar always face camera
        healthBarGroup.rotation.x = -Math.PI / 2;

        return healthBarGroup;
    }

    updateHealthBar() {
        const healthPercent = this.health / this.maxHealth;
        this.healthBarFill.scale.x = Math.max(0, healthPercent);
    }

    update(delta, player, scene) {
        // Update animation
        this.animator.update(delta);

        const distanceToPlayer = this.mesh.position.distanceTo(player.position);
       
        // Update behavior based on distance to player
        if (distanceToPlayer <= this.attackRange) {
            this.attack(player);
        } else if (distanceToPlayer <= this.detectionRange) {
            this.moveTowardsPlayer(player.position, delta);
        } else {
            this.randomMovement(delta);
        }

        // Update position based on terrain
        const terrainHeight = getTerrainHeight(this.mesh.position.x, this.mesh.position.z);
        this.animator.setBaseY(terrainHeight);

        // Make health bar face camera
        const camera = scene.camera;
        if (camera) {
            this.healthBar.lookAt(camera.position);
        }
    }

    moveTowardsPlayer(playerPosition, delta) {
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.mesh.position)
            .normalize();
       
        const moveDistance = this.speed * delta;
        const movement = direction.multiplyScalar(moveDistance);
       
        // Update position
        this.mesh.position.add(movement);
       
        // Update rotation to face movement direction
        this.mesh.lookAt(playerPosition);
    }

    randomMovement(delta) {
        if (Math.random() < 0.02) {
            this.direction.set(
                Math.random() - 0.5,
                0,
                Math.random() - 0.5
            ).normalize();
        }

        const moveDistance = this.speed * 0.5 * delta;
        const movement = this.direction.clone().multiplyScalar(moveDistance);
       
        this.mesh.position.add(movement);
       
        const targetPosition = this.mesh.position.clone().add(this.direction);
        this.mesh.lookAt(targetPosition);
    }

    attack(player) {
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime > this.attackCooldown) {
            player.takeDamage(this.damage);
            this.lastAttackTime = currentTime;
           
            // Attack animation
            this.isAttacking = true;
            setTimeout(() => {
                this.isAttacking = false;
            }, 300);
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
       
        // Flash red when hit
        const originalColor = this.mesh.material.color.getHex();
        this.mesh.material.color.setHex(0xff0000);
        setTimeout(() => {
            this.mesh.material.color.setHex(originalColor);
        }, 100);

        return this.health <= 0;
    }
}

export class MobManager {
    constructor(scene) {
        this.scene = scene;
        this.mobs = [];
        this.spawnInterval = 5000; // 5 seconds
        this.lastSpawnTime = 0;
        this.maxMobs = 10;
       
        // Spawn weights for different enemy types
        this.spawnWeights = {
            'SLIME': 0.5,    // 50% chance
            'GOLEM': 0.2,    // 20% chance
            'WRAITH': 0.3    // 30% chance
        };
    }

    update(delta, player) {
        // Update existing mobs
        for (let i = this.mobs.length - 1; i >= 0; i--) {
            const mob = this.mobs[i];
            mob.update(delta, player, this.scene);
           
            // Remove dead mobs
            if (mob.health <= 0) {
                this.scene.remove(mob.mesh);
                this.mobs.splice(i, 1);
               
                // Spawn particle effect
                this.spawnDeathParticles(mob.mesh.position, mob.type.color);
            }
        }

        // Spawn new mobs if needed
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval && this.mobs.length < this.maxMobs) {
            this.spawnMob(player.position);
            this.lastSpawnTime = currentTime;
        }
    }

    spawnMob(playerPosition) {
        // Get random spawn position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 10; // Spawn between 20-30 units away
        const position = new THREE.Vector3(
            playerPosition.x + Math.cos(angle) * distance,
            playerPosition.y,
            playerPosition.z + Math.sin(angle) * distance
        );

        // Select enemy type based on spawn weights
        const roll = Math.random();
        let cumulative = 0;
        let selectedType = 'SLIME';
       
        for (const [type, weight] of Object.entries(this.spawnWeights)) {
            cumulative += weight;
            if (roll <= cumulative) {
                selectedType = type;
                break;
            }
        }

        const mob = new Mob(position, selectedType);
        this.mobs.push(mob);
        this.scene.add(mob.mesh);
    }

    spawnDeathParticles(position, color) {
        // Create particle system for death effect
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];
       
        for (let i = 0; i < particleCount; i++) {
            positions.push(
                position.x + (Math.random() - 0.5) * 0.5,
                position.y + (Math.random() - 0.5) * 0.5,
                position.z + (Math.random() - 0.5) * 0.5
            );
           
            velocities.push(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
        }
       
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
       
        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true
        });
       
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
       
        // Animate particles
        let time = 0;
        const animate = () => {
            time += 0.1;
            const positions = particles.geometry.attributes.position.array;
           
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1] - 0.1; // Add gravity
                positions[i + 2] += velocities[i + 2];
            }
           
            particles.geometry.attributes.position.needsUpdate = true;
            material.opacity = 1 - (time / 10);
           
            if (time < 10) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particles);
            }
        };
       
        animate();
    }
}