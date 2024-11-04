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

// Function to check if enemies are in the safe zone
function checkEnemiesInSafeZone() {
    const safeZoneRadius = 600; // Updated radius to keep them further away

    enemies.forEach((enemy) => {
        if (enemy.userData.isDead) return;

        const distanceFromCenter = Math.sqrt(
            enemy.position.x * enemy.position.x + enemy.position.z * enemy.position.z
        );

        if (distanceFromCenter < safeZoneRadius) {
            const angle = Math.random() * Math.PI * 2;
            const teleportDistance = 1000; // Increased distance to move them further out
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
        alert('Invalid quantity!');
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
            alert('Treasure Chest spawned.');
        } else if (entityType === 'settlement') {
            createSettlement(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            alert('Settlement spawned.');
        } else if (entityType === 'quadruped') {
            const quadruped = createQuadruped();
            quadruped.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
            quadrupeds.push(quadruped);
            scene.add(quadruped);
            alert('Quadruped spawned.');
        }
    }
}

// Function to create an enemy
function createEnemy(x, y, z, type) {
    // Select a random type if undefined or invalid
    if (!enemyTypes[type]) {
        // If the type is invalid or undefined, select a random type
        const types = Object.keys(enemyTypes);
        type = types[Math.floor(Math.random() * types.length)];
    }

    const { color, texture, pattern, height, bodyShape, damageRate, name } = enemyTypes[type];

    // Create humanoid with all parameters
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

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
        bodyShape: bodyShape
    };
    // Initialize movement direction
    enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();

    // Apply patterns and other properties to child meshes
    enemy.traverse(child => {
        if (child.isMesh) {
            child.userData.name = enemy.userData.name;
            child.userData.pattern = enemy.userData.pattern;
            child.userData.height = enemy.userData.height;
            child.userData.bodyShape = enemy.userData.bodyShape;

            // Apply the specific pattern to each child mesh
            applyPattern(child, pattern);
        }
    });

    // Add to enemies array and scene
    enemies.push(enemy);
    scene.add(enemy);

    return enemy;
}

function maintainEnemyCount() {
    const activeEnemies = enemies.filter(enemy => !enemy.userData.isDead).length;
    const enemiesToSpawn = 100 - activeEnemies;
    const enemyTypesKeys = Object.keys(enemyTypes);

    for (let i = 0; i < enemiesToSpawn; i++) {
        let position = getRandomPositionOutsideTown(800, 2000); // Increased minimum spawn distance
        let type = enemyTypesKeys[Math.floor(Math.random() * enemyTypesKeys.length)];
        let enemy = createEnemy(position.x, 0, position.z, type);
        enemies.push(enemy);
        scene.add(enemy);
    }
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
        alert('Enemy is too far away!');
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
        alert('You have been defeated!');
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
    alert('Enemy defeated! You gained 20 experience and 10 gold.');

    enemy.isMoving = false;
    enemy.userData.isDead = true;
    enemy.userData.deathTime = 0;
}

function damagePlayer(amount) {
    if (playerInvulnerable) return; // Player is invulnerable
    const vitalityFactor = characterStats.vitality / 10; // Adjust as needed
    const actualDamage = Math.max(1, amount - vitalityFactor);
    playerHealth -= actualDamage;
    if (playerHealth <= 0) {
        playerHealth = 0;
        alert('You have been defeated!');
        // Implement game over logic here
    }
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
        alert('This enemy has already been looted.');
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
    alert('Items looted and added to your inventory.');
}
