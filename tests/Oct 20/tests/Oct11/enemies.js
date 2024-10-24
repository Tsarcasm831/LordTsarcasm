
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
    const enemyTypes = {
        'blue': { color: 0x0000ff, damageRate: 4 },
        'green': { color: 0x00ff00, damageRate: 3 },
        'yellow': { color: 0xffff00, damageRate: 2.5 },
        'purple': { color: 0x800080, damageRate: 3.5 },
        'orange': { color: 0xffa500, damageRate: 2.8 },
        'cyan': { color: 0x00ffff, damageRate: 3 },
        'magenta': { color: 0xff00ff, damageRate: 3.2 },
        'lime': { color: 0x32cd32, damageRate: 2.6 }
    };

    if (!enemyTypes[type]) {
        const types = Object.keys(enemyTypes);
        type = types[Math.floor(Math.random() * types.length)];
    }

    const { color, damageRate } = enemyTypes[type];

    const enemy = createHumanoid(color);
    enemy.position.set(x, 0, z);
    enemy.userData.type = 'hostile';
    enemy.userData.isDead = false; 
    enemy.userData.hasBeenLooted = false;
    enemy.userData.deathTime = 0;
    enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    enemy.isMoving = true; 
    enemy.userData.damageRate = damageRate;
    scene.add(enemy);
    return enemy;
}

function moveEnemies(delta) {
    enemies.forEach((enemy) => {
        if (enemy.userData.isDead) return; 

        const threatRange = 100; 
        const attackRange = 10;  
        const enemySpeed = globalEnemySpeed;

        // Calculate direction and distance to the player
        const directionToPlayer = new THREE.Vector3().subVectors(player.position, enemy.position);
        const distanceToPlayer = directionToPlayer.length();

        // Define Safe Zone Parameters
        const safeZoneCenter = new THREE.Vector3(0, 0, 0); // Adjust if your town center is different
        const safeZoneRadius = townRadius; // 200 units

        // Check if the enemy is within attack range
        if (distanceToPlayer <= attackRange) {
            enemy.isMoving = false;
            enemyAttackPlayer(enemy, delta);
        } 
        // Enemy is within threat range and should move towards the player
        else if (distanceToPlayer <= threatRange) {
            directionToPlayer.normalize();
            const oldPosition = enemy.position.clone();
            const newPosition = enemy.position.clone().add(directionToPlayer.clone().multiplyScalar(enemySpeed));

            // **Safe Zone Check Before Moving**
            const distanceToSafeZone = newPosition.distanceTo(safeZoneCenter);
            if (distanceToSafeZone < safeZoneRadius) {
                // Calculate the direction away from the safe zone center
                const directionAway = new THREE.Vector3().subVectors(newPosition, safeZoneCenter).normalize();
                // Position the enemy just outside the safe zone boundary
                const adjustedPosition = safeZoneCenter.clone().add(directionAway.multiplyScalar(safeZoneRadius - 1)); // Slight buffer
                enemy.position.copy(adjustedPosition);
                enemy.isMoving = false; // Stop moving further
                return; // Skip collision checks for this iteration
            }

            // Move the enemy to the new position
            enemy.position.copy(newPosition);

            // Collision Detection with Walls
            let collided = false;
            for (let wall of walls) {
                const enemyBox = new THREE.Box3().setFromObject(enemy);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (enemyBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            for (let wall of enemyWalls) {
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
                // Rotate enemy to face the player
                const angle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
                enemy.rotation.y = angle;
            }
        } 
        // Enemy is outside threat range and should wander randomly
        else {
            const oldPosition = enemy.position.clone();
            const moveVector = enemy.userData.direction.clone().multiplyScalar(0.5);
            const newPosition = enemy.position.clone().add(moveVector);

            // **Safe Zone Check Before Moving**
            const distanceToSafeZone = newPosition.distanceTo(safeZoneCenter);
            if (distanceToSafeZone < safeZoneRadius) {
                // Calculate the direction away from the safe zone center
                const directionAway = new THREE.Vector3().subVectors(newPosition, safeZoneCenter).normalize();
                // Position the enemy just outside the safe zone boundary
                const adjustedPosition = safeZoneCenter.clone().add(directionAway.multiplyScalar(safeZoneRadius - 1)); // Slight buffer
                enemy.position.copy(adjustedPosition);
                enemy.isMoving = false; // Stop moving further
                return; // Skip collision checks for this iteration
            }

            // Move the enemy to the new position
            enemy.position.copy(newPosition);

            // Collision Detection with Walls
            let collided = false;
            for (let wall of walls) {
                const enemyBox = new THREE.Box3().setFromObject(enemy);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (enemyBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                enemy.position.copy(oldPosition);
                // Change direction randomly upon collision
                enemy.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                enemy.isMoving = false;
            } else {
                enemy.isMoving = true;
                // Rotate enemy to face the movement direction
                const angle = Math.atan2(moveVector.x, moveVector.z);
                enemy.rotation.y = angle;
            }
        }

        // Animate the enemy's movements (arms, legs, etc.)
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
