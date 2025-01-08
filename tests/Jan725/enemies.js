//enemies.js
const enemyTypes = {
    'humans': {
        color: 0xff0000,
        texture: 'textures/enemies/humans.png',
        pattern: 'striped',
        height: 1.8,
        bodyShape: 'muscular',
        damageRate: 2.5,
        name: 'Human'
    },
    'tal_ehn': {
        color: 0x0000ff,
        texture: 'textures/enemies/tal_ehn.png',
        pattern: 'spotted',
        height: 1.6,
        bodyShape: 'slim',
        damageRate: 3.0,
        name: "Tal'Ehn"
    },
    'anthromorph': {
        color: 0x00ff00,
        texture: 'textures/enemies/anthromorph.png',
        pattern: 'scaly',
        height: 1.7,
        bodyShape: 'stocky',
        damageRate: 2.8,
        name: 'Anthromorph'
    },
    'avianos': {
        color: 0xffff00,
        texture: 'textures/enemies/avianos.png',
        pattern: 'plain',
        height: 1.5,
        bodyShape: 'average',
        damageRate: 3.2,
        name: 'Avianos'
    },
    'behemoth': {
        color: 0x800080,
        texture: 'textures/enemies/behemoth.png',
        pattern: 'spiky',
        height: 1.9,
        bodyShape: 'tall',
        damageRate: 3.5,
        name: 'Behemoth'
    },
    'chiropteran': {
        color: 0xffa500,
        texture: 'textures/enemies/chiropteran.png',
        pattern: 'striped',
        height: 1.75,
        bodyShape: 'muscular',
        damageRate: 2.8,
        name: 'Chiropteran'
    },
    'dengar_charger': {
        color: 0x00ffff,
        texture: 'textures/enemies/dengar_charger.png',
        pattern: 'geometric',
        height: 1.65,
        bodyShape: 'slim',
        damageRate: 3.0,
        name: 'Dengar Charger'
    },
    'kilrathi': {
        color: 0xff00ff,
        texture: 'textures/enemies/kilrathi.png',
        pattern: 'dotted',
        height: 1.7,
        bodyShape: 'average',
        damageRate: 3.2,
        name: 'Kilrathi'
    },
    'prometheus_ai': {
        color: 0x32cd32,
        texture: 'textures/enemies/prometheus_ai.png',
        pattern: 'camouflage',
        height: 1.6,
        bodyShape: 'stocky',
        damageRate: 2.6,
        name: 'Prometheus AI'
    },
    'talorian': {
        color: 0x000000,
        texture: 'textures/enemies/talorian.png',
        pattern: 'plain',
        height: 1.8,
        bodyShape: 'muscular',
        damageRate: 3.5,
        name: 'Talorian'
    },
    'tana_rhe': {
        color: 0xffffff,
        texture: 'textures/enemies/tana_rhe.png',
        pattern: 'spotted',
        height: 1.7,
        bodyShape: 'tall',
        damageRate: 3.0,
        name: "T'ana'Rhe"
    },
    'vyraxus': {
        color: 0x808080,
        texture: 'textures/enemies/vyraxus.png',
        pattern: 'scaly',
        height: 1.65,
        bodyShape: 'average',
        damageRate: 2.9,
        name: 'Vyraxus'
    },
    'xithrian': {
        color: 0xa52a2a,
        texture: 'textures/enemies/xithrian.png',
        pattern: 'geometric',
        height: 1.75,
        bodyShape: 'stocky',
        damageRate: 2.7,
        name: 'Xithrian'
    }
};

// Initialize Enemies
// Updated spawn distance in initEnemies
function initEnemies() {
    const enemyTypesKeys = Object.keys(enemyTypes);
    enemyTypesKeys.forEach(type => {
        const enemyCount = 5; // Define the number of each type

        for (let i = 0; i < enemyCount; i++) {
            // Adjust spawn range here
            let position = getRandomPositionOutsideTown(800, 2000); // Increase minimum distance from settlement
            const enemy = createEnemy(position.x, 0, position.z, type);
            enemies.push(enemy);
            scene.add(enemy);
        }
    });
}

let lastCheckTime = 0;
function checkEnemiesInSafeZone() {
    const now = Date.now();
    if (now - lastCheckTime < 5000) return; // 5-second throttle
    lastCheckTime = now;

    const safeZoneRadius = 600; // Radius of the safe zone

    enemies.forEach((enemy) => {
        if (enemy.userData.isDead) return;

        const distanceFromCenter = Math.sqrt(
            enemy.position.x * enemy.position.x + enemy.position.z * enemy.position.z
        );

        if (distanceFromCenter < safeZoneRadius) {
            const angle = Math.random() * Math.PI * 2;
            const teleportDistance = 1000;
            enemy.position.x = Math.cos(angle) * teleportDistance;
            enemy.position.z = Math.sin(angle) * teleportDistance;
            enemy.position.y = 0;
        }
    });
}

// Function to get a random position outside the town with adjusted distances
function getRandomPositionOutsideTown(minDistance = 800, maxDistance = 1500) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * (maxDistance - minDistance) + minDistance;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    return { x: x, z: z };
}

// When spawning enemies
let position = getRandomPositionOutsideTown(600, 1200); // Enemies spawn between 600 and 1200 units away


// Function to spawn various entities
function spawnEntities() {
    const entityType = document.getElementById('entityTypeSelect').value;
    const quantity = parseInt(document.getElementById('entityQuantityInput').value);

    if (isNaN(quantity) || quantity <= 0) {
        console.log('Invalid quantity!');
        return;
    }

    for (let i = 0; i < quantity; i++) {
        const offsetX = Math.random() * 50 - 25;
        const offsetZ = Math.random() * 50 - 25;
        const spawnPosition = {
            x: player.position.x + offsetX,
            y: player.position.y,
            z: player.position.z + offsetZ
        };

        if (entityType === 'enemy') {
            const enemy = createEnemy(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            enemies.push(enemy);
            scene.add(enemy);
        } else if (entityType === 'friendlyNPC') {
            const npc = createFriendlyNPC();
            npc.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            friendlies.push(npc);
            scene.add(npc);
        } else if (entityType === 'structure') {
            const structure = createStructure();
            structure.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            scene.add(structure);
            walls.push(...structure.userData.walls);
        } else if (entityType === 'treasureChest') {
            createTreasureChest(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            console.log('Treasure Chest spawned.');
        } else if (entityType === 'settlement') {
            createSettlement(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            console.log('Settlement spawned.');
        } else if (entityType === 'quadruped') {
            const quadruped = createQuadruped();
            quadruped.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            quadrupeds.push(quadruped);
            scene.add(quadruped);
            console.log('Quadruped spawned.');
        }
    }
}

// Function to create an enemy
function createEnemy(x, y, z, type) {
    if (!enemyTypes[type]) {
        const types = Object.keys(enemyTypes);
        type = types[Math.floor(Math.random() * types.length)];
    }

    const { color, texture, pattern, height, bodyShape, damageRate, name } = enemyTypes[type];

    // Create base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // Helper functions for creating complex geometries
    const createTendril = (length, segments, radius, color, glowColor) => {
        const group = new THREE.Group();
        const segmentHeight = length / segments;
        let prevSegment = null;
        
        for (let i = 0; i < segments; i++) {
            const geometry = new THREE.CylinderGeometry(radius * (1 - i/segments), radius * (1 - (i+1)/segments), segmentHeight, 8);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.5,
                emissive: glowColor,
                emissiveIntensity: 0.5
            });
            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = -segmentHeight/2;
            segment.castShadow = true;
            
            if (prevSegment) {
                prevSegment.add(segment);
            } else {
                group.add(segment);
            }
            prevSegment = segment;
        }
        return group;
    };

    const createWing = (width, height, segments, color, opacity = 0.9) => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(width/2, height/2, width, 0);
        shape.quadraticCurveTo(width/2, -height*0.8, 0, 0);

        const geometry = new THREE.ShapeGeometry(shape, segments);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: opacity,
            roughness: 0.5,
            metalness: 0.2
        });
        const wing = new THREE.Mesh(geometry, material);
        wing.castShadow = true;
        return wing;
    };

    // Apply unique physical modifications based on enemy type
    switch(type) {
        case 'humans':
            // Standard humanoid with technological enhancements
            const techParts = [
                { pos: [1.5, 12, 0], scale: [0.5, 1, 0.3] },
                { pos: [-1.5, 12, 0], scale: [0.5, 1, 0.3] },
                { pos: [0, 10, 1], scale: [2, 0.3, 0.2] }
            ];
            
            techParts.forEach(part => {
                const tech = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshStandardMaterial({
                        color: 0x444444,
                        metalness: 0.8,
                        roughness: 0.2,
                        emissive: 0x00ff00,
                        emissiveIntensity: 0.2
                    })
                );
                tech.position.set(...part.pos);
                tech.scale.set(...part.scale);
                enemy.add(tech);
            });
            break;
            
        case 'tal_ehn':
            // Advanced technological beings with floating components
            enemy.scale.set(0.9, 1.2, 0.9);
            
            // Floating technological orbs
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
            
            // Energy tendrils
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
            
            // Technological aura
            enemy.traverse(child => {
                if (child.isMesh) {
                    child.material.emissive = new THREE.Color(0x001133);
                    child.material.emissiveIntensity = 0.3;
                    child.material.metalness = 0.7;
                    child.material.roughness = 0.3;
                }
            });
            break;
            
        case 'anthromorph':
            // Beast-like creatures with enhanced physical features
            enemy.scale.set(1.3, 1.1, 1.3);
            
            // Add bestial features
            const snoutGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 8);
            const snout = new THREE.Mesh(snoutGeometry, new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.9
            }));
            snout.rotation.x = Math.PI / 2;
            snout.position.set(0, 18, 1);
            enemy.add(snout);
            
            // Extra muscular arms
            const extraArms = createHumanoid(color, texture, pattern, height * 0.8, 'muscular');
            extraArms.traverse(child => {
                if (child.isMesh) {
                    const isArm = child.position.x !== 0 && child.position.y > 8;
                    if (!isArm) {
                        child.visible = false;
                    } else {
                        child.material.roughness = 0.9;
                    }
                }
            });
            extraArms.position.y = -2;
            extraArms.rotation.y = Math.PI / 6;
            enemy.add(extraArms);
            
            // Add claws
            const clawPositions = [
                { pos: [2.5, 11, 0], rot: [0, 0, -Math.PI / 4] },
                { pos: [-2.5, 11, 0], rot: [0, 0, Math.PI / 4] },
                { pos: [2.5, 7, 0], rot: [0, 0, -Math.PI / 4] },
                { pos: [-2.5, 7, 0], rot: [0, 0, Math.PI / 4] }
            ];
            
            clawPositions.forEach(({pos, rot}) => {
                const claw = new THREE.Mesh(
                    new THREE.ConeGeometry(0.2, 1, 4),
                    new THREE.MeshStandardMaterial({
                        color: 0x111111,
                        metalness: 0.4,
                        roughness: 0.6
                    })
                );
                claw.position.set(...pos);
                claw.rotation.set(...rot);
                enemy.add(claw);
            });
            break;
            
        case 'avianos':
            // Majestic bird-like beings with large wings
            enemy.scale.set(0.8, 1.1, 0.8);
            
            // Large feathered wings
            const wingSpan = 14;
            const wingHeight = 10;
            
            // Create detailed feathered wings
            const createFeatheredWing = (isLeft) => {
                const wingGroup = new THREE.Group();
                
                // Main wing
                const mainWing = createWing(wingSpan, wingHeight, 32, 0xCCCCCC);
                wingGroup.add(mainWing);
                
                // Add individual feather details
                const featherCount = 8;
                for (let i = 0; i < featherCount; i++) {
                    const feather = createWing(wingSpan * 0.3, wingHeight * 0.2, 16, 0xDDDDDD, 0.7);
                    feather.position.set(
                        (isLeft ? -1 : 1) * (wingSpan * 0.1 * i),
                        -wingHeight * 0.1 * i,
                        0
                    );
                    feather.rotation.z = (isLeft ? 1 : -1) * Math.PI * 0.1;
                    wingGroup.add(feather);
                }
                
                return wingGroup;
            };
            
            const leftWing = createFeatheredWing(true);
            leftWing.position.set(-0.5, 12, 0);
            leftWing.rotation.set(-Math.PI/6, Math.PI/2, 0);
            
            const rightWing = createFeatheredWing(false);
            rightWing.position.set(0.5, 12, 0);
            rightWing.rotation.set(-Math.PI/6, -Math.PI/2, 0);
            
            enemy.add(leftWing, rightWing);
            
            // Add beak
            const beak = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 1.5, 4),
                new THREE.MeshStandardMaterial({
                    color: 0xCCAA00,
                    metalness: 0.3,
                    roughness: 0.7
                })
            );
            beak.rotation.x = Math.PI / 2;
            beak.position.set(0, 18, 1);
            enemy.add(beak);
            break;
            
        case 'behemoth':
            // Colossal creature with imposing features
            enemy.scale.set(1.8, 1.6, 1.8);
            
            // Armored plates along the body
            const platePositions = [
                { pos: [0, 14, 1.2], scale: [4, 3, 0.3] },
                { pos: [0, 11, 1.2], scale: [5, 3, 0.4] },
                { pos: [0, 8, 1.2], scale: [4.5, 3, 0.3] }
            ];
            
            platePositions.forEach(({pos, scale}) => {
                const plate = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshStandardMaterial({
                        color: 0x444444,
                        metalness: 0.4,
                        roughness: 0.8
                    })
                );
                plate.position.set(...pos);
                plate.scale.set(...scale);
                enemy.add(plate);
            });
            
            // Massive spikes along the back
            const spikeCount = 6;
            for (let i = 0; i < spikeCount; i++) {
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(0.6, 3, 4),
                    new THREE.MeshStandardMaterial({
                        color: 0x333333,
                        roughness: 1.0,
                        metalness: 0.2
                    })
                );
                spike.position.set(0, 16 - i * 1.5, 1.5);
                spike.rotation.x = -Math.PI / 4;
                enemy.add(spike);
            }
            
            // Reinforced limbs
            enemy.traverse(child => {
                if (child.isMesh) {
                    child.material.roughness = 1.0;
                    child.material.metalness = 0.3;
                }
            });
            break;
            
        case 'chiropteran':
            // Nocturnal hunters with bat-like features
            enemy.scale.set(1.1, 1.0, 1.1);
            
            // Large membrane wings with detailed structure
            const membraneWingSpan = 16;
            const membraneWingHeight = 12;
            
            const createMembraneWing = () => {
                const points = [];
                points.push(new THREE.Vector2(0, 0));
                points.push(new THREE.Vector2(membraneWingSpan * 0.2, membraneWingHeight * 0.3));
                points.push(new THREE.Vector2(membraneWingSpan * 0.4, membraneWingHeight * 0.7));
                points.push(new THREE.Vector2(membraneWingSpan * 0.6, membraneWingHeight * 0.9));
                points.push(new THREE.Vector2(membraneWingSpan * 0.8, membraneWingHeight * 0.7));
                points.push(new THREE.Vector2(membraneWingSpan, membraneWingHeight * 0.5));
                points.push(new THREE.Vector2(membraneWingSpan * 0.9, membraneWingHeight * 0.2));
                points.push(new THREE.Vector2(membraneWingSpan * 0.7, 0));
                
                const shape = new THREE.Shape();
                shape.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    shape.lineTo(points[i].x, points[i].y);
                }
                shape.lineTo(points[0].x, points[0].y);
                
                // Create wing membrane
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
                
                // Add wing bones
                const bones = new THREE.Group();
                for (let i = 1; i < points.length - 1; i++) {
                    const bone = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.1, 0.05, points[i].length(), 4),
                        new THREE.MeshStandardMaterial({
                            color: 0x222222,
                            roughness: 0.7
                        })
                    );
                    bone.position.set(points[i].x/2, points[i].y/2, 0);
                    bone.rotation.z = Math.atan2(points[i].y, points[i].x);
                    bones.add(bone);
                }
                
                const wingGroup = new THREE.Group();
                wingGroup.add(membrane, bones);
                return wingGroup;
            };
            
            const leftMembraneWing = createMembraneWing();
            leftMembraneWing.position.set(-0.5, 12, -1);
            leftMembraneWing.rotation.set(-Math.PI/4, Math.PI/2, 0);
            
            const rightMembraneWing = createMembraneWing();
            rightMembraneWing.position.set(0.5, 12, -1);
            rightMembraneWing.rotation.set(-Math.PI/4, -Math.PI/2, 0);
            
            enemy.add(leftMembraneWing, rightMembraneWing);
            
            // Add bat-like ears and features
            const ears = new THREE.Group();
            [-1, 1].forEach(side => {
                const ear = new THREE.Mesh(
                    new THREE.ConeGeometry(0.3, 1.2, 3),
                    new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.8
                    })
                );
                ear.position.set(side * 0.8, 19, 0);
                ear.rotation.z = side * Math.PI / 6;
                ears.add(ear);
            });
            enemy.add(ears);
            
            // Nocturnal appearance
            enemy.traverse(child => {
                if (child.isMesh) {
                    child.material.emissive = new THREE.Color(0x330000);
                    child.material.emissiveIntensity = 0.2;
                }
            });
            break;
    }

    // Set position
    enemy.position.set(x, y, z);

    // Assign userData properties
    enemy.userData = {
        type: 'hostile',
        name: name,
        health: 100,
        isDead: false,
        hasBeenLooted: false,
        deathTime: 0,
        direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        damageRate: damageRate,
        pattern: pattern,
        height: height,
        bodyShape: bodyShape,
        enemyType: type
    };

    // Apply patterns and other properties to child meshes
    enemy.traverse(child => {
        if (child.isMesh) {
            child.userData.name = enemy.userData.name;
            child.userData.pattern = enemy.userData.pattern;
            child.userData.height = enemy.userData.height;
            child.userData.bodyShape = enemy.userData.bodyShape;
            child.userData.enemyType = type;
            
            // Apply the specific pattern to each child mesh
            applyPattern(child, pattern);
            
            // Enable shadows for all meshes
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    // Add to enemies array and scene
    enemies.push(enemy);
    scene.add(enemy);

    return enemy;
}

let maxEnemyCount = 30; // Reduced from 100
let enemySpawnRadius = 2000;
let lastPlayerPosition = new THREE.Vector3();

function maintainEnemyCount() {
    const activeEnemies = enemies.filter(enemy => !enemy.userData.isDead).length;
    
    // Only spawn new enemies if player has moved significantly
    if (player.position.distanceTo(lastPlayerPosition) < 100) {
        return;
    }
    lastPlayerPosition.copy(player.position);

    // Calculate how many enemies to spawn based on distance from town
    const distanceFromTown = player.position.length();
    const adjustedMaxEnemies = Math.min(maxEnemyCount, 
        Math.floor(maxEnemyCount * (distanceFromTown / 2000)));
    
    const enemiesToSpawn = adjustedMaxEnemies - activeEnemies;
    if (enemiesToSpawn <= 0) return;

    const enemyTypesKeys = Object.keys(enemyTypes);
    const spawnBatchSize = Math.min(5, enemiesToSpawn); // Spawn max 5 enemies at once

    for (let i = 0; i < spawnBatchSize; i++) {
        let position = getRandomPositionOutsideTown(800, 2000);
        let type = enemyTypesKeys[Math.floor(Math.random() * enemyTypesKeys.length)];
        let enemy = createEnemy(position.x, 0, position.z, type);
        enemies.push(enemy);
        scene.add(enemy);
    }
}

// Function to move enemies
function moveEnemies(delta) {
    enemies.forEach((enemy) => {
        if (enemy.userData.isDead) return;

        // Create raycaster to check what's below the enemy
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.copy(enemy.position).add(new THREE.Vector3(0, 1, 0)); // Start slightly above enemy
        raycaster.ray.direction.set(0, -1, 0); // Cast downward

        const intersects = raycaster.intersectObjects([safeZoneGround]);
        
        // If enemy is on safe zone ground, teleport them away
        if (intersects.length > 0) {
            // Teleport enemy outside with a buffer
            const angle = Math.random() * Math.PI * 2;
            const teleportDistance = 700; // Distance from center to teleport to
            enemy.position.x = Math.cos(angle) * teleportDistance;
            enemy.position.z = Math.sin(angle) * teleportDistance;
            enemy.position.y = 1; // Set slightly above ground to avoid immediate teleport
            return; // Skip rest of movement logic for this frame
        }

        const threatRange = 100;
        const attackRange = 10;
        const enemySpeed = globalEnemySpeed; // Speed when chasing the player
        const wanderingSpeed = enemySpeed * 1; // Enemies move slower during wandering

        // Calculate direction and distance to the player
        const directionToPlayer = new THREE.Vector3().subVectors(player.position, enemy.position);
        const distanceToPlayer = directionToPlayer.length();

        // Attack logic
        if (distanceToPlayer <= attackRange) {
            enemy.isMoving = false;
            enemyAttackPlayer(enemy, delta);
        } 
        // Chase player logic
        else if (distanceToPlayer <= threatRange) {
            directionToPlayer.normalize();
            const oldPosition = enemy.position.clone();
            const newPosition = enemy.position.clone().add(directionToPlayer.clone().multiplyScalar(enemySpeed));

            // Move and check collisions
            enemy.position.copy(newPosition);
            let collided = false;
            // Check collisions with walls and enemy barriers
            for (let wall of [...walls, ...enemyWalls]) {
                const enemyBox = new THREE.Box3().setFromObject(enemy);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (enemyBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                enemy.position.copy(oldPosition);
                enemy.isMoving = false;
            } else {
                enemy.isMoving = true;
                enemy.rotation.y = Math.atan2(directionToPlayer.x, directionToPlayer.z);
            }
        }
        // Wandering logic
        else {
            // Ensure homePosition is set
            if (!enemy.userData.homePosition) {
                enemy.userData.homePosition = enemy.position.clone();
            }

            const maxWanderRadius = 3000; // Increased from 300 to 600

            // Initialize direction if not set
            if (!enemy.userData.direction || enemy.userData.direction.length() === 0) {
                enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
            }

            // Initialize isIdle if not set
            if (enemy.userData.isIdle === undefined) {
                enemy.userData.isIdle = false;
            }

            // Initialize time to next state change if not set
            if (enemy.userData.timeToChangeState === undefined) {
                enemy.userData.timeToChangeState = Math.random() * 2 + 1; // Random time between 1 and 3 seconds
            }

            // Decrease time to next state change
            enemy.userData.timeToChangeState -= delta;

            // Change direction or idle state if time is up
            if (enemy.userData.timeToChangeState <= 0) {
                // Randomly decide whether to stand still or move
                enemy.userData.isIdle = Math.random() < 0.3; // 30% chance to stand still
                if (enemy.userData.isIdle) {
                    // Set idle time between 1 and 5 seconds
                    enemy.userData.timeToChangeState = Math.random() * 4 + 1; // Random time between 1 and 5 seconds
                    enemy.userData.direction.set(0, 0, 0); // No movement
                } else {
                    // Randomly pick a new direction
                    enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                    // Set time until next state change
                    enemy.userData.timeToChangeState = Math.random() * 2 + 1; // Random time between 1 and 3 seconds
                }
            }

            const oldPosition = enemy.position.clone();
            const moveVector = enemy.userData.direction.clone().multiplyScalar(wanderingSpeed * delta);
            enemy.position.add(moveVector);

            // After moving, check if enemy is outside of wander radius
            const distanceFromHome = enemy.position.distanceTo(enemy.userData.homePosition);
            if (distanceFromHome > maxWanderRadius) {
                // Adjust direction back toward home
                enemy.position.copy(oldPosition);
                enemy.userData.direction = new THREE.Vector3().subVectors(enemy.userData.homePosition, enemy.position).normalize();
                enemy.isMoving = true;
            } else {
                let collided = false;
                // Check collisions with walls and enemy barriers
                for (let wall of [...walls, ...enemyWalls]) {
                    const enemyBox = new THREE.Box3().setFromObject(enemy);
                    const wallBox = new THREE.Box3().setFromObject(wall);
                    if (enemyBox.intersectsBox(wallBox)) {
                        collided = true;
                        break;
                    }
                }

                if (collided) {
                    enemy.position.copy(oldPosition);
                    // Pick a new random direction to avoid the obstacle
                    enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                    enemy.isMoving = false;
                } else {
                    enemy.isMoving = !enemy.userData.isIdle;
                    // Update rotation only if moving
                    if (!enemy.userData.isIdle && enemy.userData.direction.lengthSq() > 0) {
                        enemy.rotation.y = Math.atan2(moveVector.x, moveVector.z);
                    }
                }

                // Update rotation
                if (!enemy.userData.isIdle && enemy.userData.direction.lengthSq() > 0) {
                    enemy.rotation.y = Math.atan2(enemy.userData.direction.x, enemy.userData.direction.z);
                }
            }
        }
            // Animate the enemy
            animateHumanoid(enemy, delta);
        });
}

function attackEnemy(enemy) {
    const attackRange = 20; 

    const distance = player.position.distanceTo(enemy.position);

    if (distance <= attackRange) {
        playAttackAnimation();

        setTimeout(() => {
            defeatEnemy(enemy);
        }, 500); 
    } else {
        console.log('Enemy is too far away!');
    }
}

function playAttackAnimation() {
    player.isAttacking = true;
    player.attackTime = 0;
}

function enemyAttackPlayer(enemy, delta) {
    if (enemy.userData.isDead || playerInvulnerable) return;

    // Calculate damage based on damageRate and delta time
    const damage = enemy.userData.damageRate * delta;
    const actualDamage = Math.max(0, damage - (characterStats.vitality / 10)); // Adjust based on vitality
    
    playerHealth -= actualDamage;
    if (playerHealth <= 0) {
        playerHealth = 0;
        console.log('You have been defeated!');
        // Implement game over logic here
    }
    updateHealthDisplay();
}

function animateDeadEnemies(delta) {
    scene.children.forEach((object) => {
        if (object.userData && object.userData.isDead) {
            object.userData.deathTime += delta;
            if (object.userData.deathTime < 1) {
                object.rotation.x = -Math.PI / 2 * (object.userData.deathTime / 1);
            } else {
                object.rotation.x = -Math.PI / 2;

                if (!object.userData.bloodPoolCreated) {
                    createBloodPool(object.position);
                    object.userData.bloodPoolCreated = true;
                }
            }
        }
    });
}

function defeatEnemy(enemy) {
    addExperience(20);
    gold += 10;
    updateGoldDisplay();
    console.log('Enemy defeated! You gained 20 experience and 10 gold.');

    enemy.isMoving = false;
    enemy.userData.isDead = true;
    enemy.userData.deathTime = 0;
}

function damagePlayer(amount) {
    if (playerInvulnerable) return; // Player is invulnerable

    const vitalityFactor = characterStats.vitality / 10; // Adjust as needed
    const actualDamage = Math.max(1, amount - vitalityFactor);

    // Decrease player health
    playerHealth -= actualDamage;
    if (playerHealth <= 0) {
        playerHealth = 0;
        console.log('You have been defeated!');
        // Implement game over logic here
    }

    // Optionally decrease mana as a consequence of taking damage
    currentMana -= actualDamage * 0.1; // Adjust the multiplier as needed
    if (currentMana < 0) currentMana = 0;

    // Update health and mana orbs
    updateOrbs();

    // Update health display (if there's a specific UI update function)
    updateHealthDisplay();
}

function addExperience(amount) {
    characterStats.experience += amount;
    if (characterStats.experience >= characterStats.nextLevelExperience) {
        levelUp();
    }
    updateStatsDisplay();
}

function createBloodPool(position) {
    const geometry = new THREE.CircleGeometry(5, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x8B0000 });
    const bloodPool = new THREE.Mesh(geometry, material);
    bloodPool.rotation.x = -Math.PI / 2;
    bloodPool.position.set(position.x, 0.05, position.z);
    scene.add(bloodPool);
}

function lootEnemy(enemy) {
    if (enemy.userData.hasBeenLooted) {
        console.log('This enemy has already been looted.');
        return;
    }

    isLooting = true;
    lootProgress = 0;
    currentLootingEnemy = enemy;
    document.getElementById('lootBarContainer').style.display = 'block';
}

function updateLooting(delta) {
    if (isLooting) {
        lootProgress += delta;
        const progressBar = document.getElementById('lootBar');
        progressBar.style.width = (lootProgress / lootDuration) * 100 + '%';
        if (lootProgress >= lootDuration) {
            isLooting = false;
            document.getElementById('lootBarContainer').style.display = 'none';
            openLootPopup();
        }
    }
}

function openLootPopup() {
    lootedItems = generateRandomItems(2);

    const lootItemsDiv = document.getElementById('lootItems');
    lootItemsDiv.innerHTML = '';
    lootedItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerText = item.name;
        lootItemsDiv.appendChild(itemDiv);
    });

    document.getElementById('lootPopup').style.display = 'block';
}

function lootAllItems() {
    lootedItems.forEach(item => {
        addItemToInventory(item);
    });
    lootedItems = [];
    document.getElementById('lootPopup').style.display = 'none';

    if (currentLootingEnemy) {
        // Change enemy color to black
        currentLootingEnemy.traverse(child => {
            if (child.isMesh) {
                child.material.color.set(0x000000); // Black color
            }
        });

        // Set the hasBeenLooted flag to true
        currentLootingEnemy.userData.hasBeenLooted = true;

        // Prevent further looting by disabling the enemy
        // Optionally, you can remove the enemy from the scene or make it non-interactive
        // For now, we just mark it as looted

        currentLootingEnemy = null;
    }

    isLooting = false;
    document.getElementById('lootBarContainer').style.display = 'none';
    document.getElementById('lootBar').style.width = '0%';
    console.log('Items looted and added to your inventory.');
}

// Function to apply patterns to enemy meshes
function applyPattern(mesh, pattern) {
    switch (pattern) {
        case 'striped':
            // Striped Pattern: Alternating stripes on the material
            mesh.material = new THREE.MeshPhongMaterial({
                color: mesh.material.color,
                map: generateStripedTexture(),
                shininess: 50,
            });
            break;

        case 'spotted':
            // Spotted Pattern: Spots on the material
            mesh.material = new THREE.MeshLambertMaterial({
                color: mesh.material.color,
                map: generateSpottedTexture(),
            });
            break;

        case 'scaly':
            // Scaly Pattern: Use a bump map to simulate scales
            mesh.material = new THREE.MeshStandardMaterial({
                color: mesh.material.color,
                bumpMap: generateScalyTexture(),
                bumpScale: 0.1,
            });
            break;

        case 'plain':
            // Plain Pattern: Basic material without textures or details
            mesh.material = new THREE.MeshBasicMaterial({
                color: mesh.material.color,
            });
            break;

        case 'spiky':
            // Spiky Pattern: Adds spiky geometry details
            mesh.material = new THREE.MeshToonMaterial({
                color: mesh.material.color,
                map: generateSpikyTexture(),
            });
            break;

        case 'geometric':
            // Geometric Pattern: Adds grid or hexagonal shapes
            mesh.material = new THREE.MeshLambertMaterial({
                color: mesh.material.color,
                map: generateGeometricTexture(),
            });
            break;

        case 'dotted':
            // Dotted Pattern: Small dots spread across the material
            mesh.material = new THREE.MeshPhongMaterial({
                color: mesh.material.color,
                map: generateDottedTexture(),
            });
            break;

        case 'camouflage':
            // Camouflage Pattern: Camo-like blending texture
            mesh.material = new THREE.MeshStandardMaterial({
                color: mesh.material.color,
                map: generateCamouflageTexture(),
            });
            break;

        default:
            // Fallback for undefined patterns
            mesh.material = new THREE.MeshBasicMaterial({
                color: mesh.material.color,
            });
            break;
    }
}

function generateStripedTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';

    for (let i = 0; i < canvas.width; i += 8) {
        if ((i / 8) % 2 === 0) ctx.fillRect(i, 0, 8, canvas.height);
    }

    return new THREE.CanvasTexture(canvas);
}

function generateSpottedTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';

    for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function generateScalyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';

    for (let y = 0; y < canvas.height; y += 8) {
        for (let x = (y / 8) % 2 === 0 ? 0 : 4; x < canvas.width; x += 8) {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return new THREE.CanvasTexture(canvas);
}

function generateSpikyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 5, y + 10);
        ctx.lineTo(x - 5, y + 10);
        ctx.closePath();
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

function generateGeometricTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';

    for (let x = 0; x < canvas.width; x += 12) {
        for (let y = 0; y < canvas.height; y += 12) {
            ctx.fillRect(x, y, 6, 6);
        }
    }

    return new THREE.CanvasTexture(canvas);
}

function generateDottedTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';

    for (let x = 0; x < canvas.width; x += 8) {
        for (let y = 0; y < canvas.height; y += 8) {
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return new THREE.CanvasTexture(canvas);
}

function generateCamouflageTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const colors = ['#3B5323', '#78866B', '#4B5320', '#78866B'];
    for (let i = 0; i < 10; i++) {
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const w = Math.random() * 20 + 10;
        const h = Math.random() * 20 + 10;
        ctx.fillRect(x, y, w, h);
    }

    return new THREE.CanvasTexture(canvas);
}

// Function to apply body shapes to enemy humanoids
function applyBodyShape(humanoid, bodyShape) {
    switch(bodyShape) {
        case 'muscular':
            // Modify geometry to appear more muscular
            humanoid.scale.set(1.2, humanoid.scale.y, 1.2);
            break;
        case 'slim':
            // Modify geometry to appear slimmer
            humanoid.scale.set(0.8, humanoid.scale.y, 0.8);
            break;
        case 'stocky':
            // Modify geometry to appear stockier
            humanoid.scale.set(1.0, humanoid.scale.y, 1.0);
            break;
        case 'tall':
            // Modify geometry to appear taller
            humanoid.scale.set(1.0, humanoid.scale.y * 1.2, 1.0);
            break;
        case 'average':
            // Default scaling
            break;
        default:
            // Default scaling
            break;
    }
}
