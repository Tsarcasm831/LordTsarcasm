
function initEnemies() {
    // Spawn Red Enemies (Regular)
    for (let i = 0; i < 10; i++) {
        let position = getRandomPositionOutsideTown(300, 1000);
        let enemy = createEnemy(position.x, 0, position.z, 'red');
        enemies.push(enemy);
        scene.add(enemy);
    }

    // Spawn Blue Enemies
    for (let i = 0; i < 3; i++) { // Adjust the number as desired
        let position = getRandomPositionOutsideTown(300, 1000);
        let blueEnemy = createEnemy(position.x, 0, position.z, 'blue');
        enemies.push(blueEnemy);
        scene.add(blueEnemy);
    }
}

function checkEnemiesInSafeZone() {
    const safeZoneRadius = 300; // Radius of the safe zone

    enemies.forEach((enemy) => {
        if (enemy.userData.isDead) return;

        const distanceFromCenter = Math.sqrt(
            enemy.position.x * enemy.position.x + enemy.position.z * enemy.position.z
        );

        if (distanceFromCenter < safeZoneRadius) {
            const angle = Math.random() * Math.PI * 2;
            const teleportDistance = 500;
            enemy.position.x = Math.cos(angle) * teleportDistance;
            enemy.position.z = Math.sin(angle) * teleportDistance;
            enemy.position.y = 0; 
        }
    });
}

function getRandomPositionOutsideTown(minDistance, maxDistance) {
    let angle = Math.random() * 2 * Math.PI;
    let distance = minDistance + Math.random() * (maxDistance - minDistance);
    let x = Math.cos(angle) * distance;
    let z = Math.sin(angle) * distance;
    return { x: x, z: z };
}

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

function createEnemy(x, y, z, type) {
    // Define enemy types with associated colors and damage rates
    const enemyTypes = {
        'blue': { color: 0x0000ff, damageRate: 4, name: 'Blue Warrior' },
        'green': { color: 0x00ff00, damageRate: 3, name: 'Green Archer' },
        'yellow': { color: 0xffff00, damageRate: 2.5, name: 'Yellow Mage' },
        'purple': { color: 0x800080, damageRate: 3.5, name: 'Purple Assassin' },
        'orange': { color: 0xffa500, damageRate: 2.8, name: 'Orange Knight' },
        'cyan': { color: 0x00ffff, damageRate: 3, name: 'Cyan Paladin' },
        'magenta': { color: 0xff00ff, damageRate: 3.2, name: 'Magenta Sorcerer' },
        'lime': { color: 0x32cd32, damageRate: 2.6, name: 'Lime Ranger' }
    };

    // If the provided type is invalid or undefined, select a random type
    if (!enemyTypes[type]) {
        const types = Object.keys(enemyTypes);
        type = types[Math.floor(Math.random() * types.length)];
    }

    // Destructure the color, damageRate, and name from the selected enemy type
    const { color, damageRate, name } = enemyTypes[type];

    // Create the enemy's visual representation (assuming createHumanoid returns a parent Object3D)
    const enemy = createHumanoid(color);

    // Set the enemy's position in the scene
    enemy.position.set(x, y, z);

    // Assign userData properties for game logic and tooltip functionality
    enemy.userData.type = 'hostile';
    enemy.userData.name = name; // Critical for tooltip display
    enemy.userData.isDead = false; 
    enemy.userData.hasBeenLooted = false;
    enemy.userData.deathTime = 0;
    enemy.userData.direction = new THREE.Vector3(
        Math.random() - 0.5,
        0,
        Math.random() - 0.5
    ).normalize();
    enemy.isMoving = true; 
    enemy.userData.damageRate = damageRate;

    // **Set userData.name on all child meshes**
    enemy.traverse(function(child) {
        if (child.isMesh) {
            child.userData.name = enemy.userData.name;
        }
    });

    // Add the enemy to the scene
    scene.add(enemy);

    // Add the enemy to the enemies array for raycasting and other game logic
    enemies.push(enemy);

    return enemy;
}


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
            enemy.position.y = 0;
            return; // Skip rest of movement logic for this frame
        }

        const threatRange = 100;
        const attackRange = 10;
        const enemySpeed = globalEnemySpeed; // Speed when chasing the player
        const wanderingSpeed = enemySpeed * 0.5; // Enemies move slower during wandering

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

            const maxWanderRadius = 300; // Expanded wander radius by triple

            // Initialize direction if not set
            if (!enemy.userData.direction) {
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
            const moveVector = enemy.userData.direction.clone().multiplyScalar(wanderingSpeed);
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

function enemyAttackPlayer(enemy) {
    const damageAmount = Math.floor(Math.random() * 3) + 1; // Damage between 1 and 3
    damagePlayer(damageAmount);
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

function maintainEnemyCount() {
    const activeEnemies = enemies.filter(enemy => !enemy.userData.isDead).length;
    const enemiesToSpawn = 100 - activeEnemies;

    for (let i = 0; i < enemiesToSpawn; i++) {
        let position = getRandomPositionOutsideTown(300, 1000);
        let type = Math.random() < 0.1 ? 'blue' : 'red'; // 10% chance to spawn a blue enemy
        let enemy = createEnemy(position.x, 0, position.z, type);
        enemies.push(enemy);
        scene.add(enemy);
    }
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

function maintainEnemyCount() {
    const activeEnemies = enemies.filter(enemy => !enemy.userData.isDead).length;
    const enemiesToSpawn = 50 - activeEnemies;

    for (let i = 0; i < enemiesToSpawn; i++) {
        let position = getRandomPositionOutsideTown(300, 1000);
        let type = Math.random() < 0.1 ? 'blue' : 'red'; // 10% chance to spawn a blue enemy
        let enemy = createEnemy(position.x, 0, position.z, type);
        enemies.push(enemy);
        scene.add(enemy);
    }
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
