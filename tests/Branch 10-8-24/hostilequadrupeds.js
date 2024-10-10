// hostilequadrupeds.js

// Array to hold hostile quadrupeds
let hostileQuadrupeds = [];

// Function to create a hostile quadruped
function createHostileQuadruped(x, y, z) {
    const color = 0xFFA500; // Orange color

    const hostileQuadruped = createQuadruped(color);

    hostileQuadruped.position.set(x, y, z);

    hostileQuadruped.userData.type = 'hostileQuadruped';
    hostileQuadruped.userData.isDead = false;
    hostileQuadruped.userData.hasBeenLooted = false;
    hostileQuadruped.userData.deathTime = 0;
    hostileQuadruped.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    hostileQuadruped.isMoving = true;
    hostileQuadruped.userData.damageRate = 3; // Adjust damage rate as needed
    hostileQuadruped.userData.homePosition = hostileQuadruped.position.clone();
    hostileQuadruped.userData.wanderRadius = 500; // Adjust as needed

    scene.add(hostileQuadruped);
    hostileQuadrupeds.push(hostileQuadruped);

    return hostileQuadruped;
}

// Function to move hostile quadrupeds
function moveHostileQuadrupeds(delta) {
    hostileQuadrupeds.forEach((hostileQuadruped) => {
        if (hostileQuadruped.userData.isDead) return;

        const threatRange = 100;
        const attackRange = 10;
        const enemySpeed = globalEnemySpeed;

        const directionToPlayer = new THREE.Vector3().subVectors(player.position, hostileQuadruped.position);
        const distanceToPlayer = directionToPlayer.length();

        if (distanceToPlayer <= attackRange) {
            hostileQuadruped.isMoving = false;
            attackPlayerByHostileQuadruped(hostileQuadruped, delta);
        } else if (distanceToPlayer <= threatRange) {
            directionToPlayer.normalize();
            const oldPosition = hostileQuadruped.position.clone();
            hostileQuadruped.position.add(directionToPlayer.multiplyScalar(enemySpeed));

            let collided = false;
            for (let wall of walls) {
                const hostileQuadrupedBox = new THREE.Box3().setFromObject(hostileQuadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (hostileQuadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            for (let wall of enemyWalls) {
                const hostileQuadrupedBox = new THREE.Box3().setFromObject(hostileQuadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (hostileQuadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                hostileQuadruped.position.copy(oldPosition);
                hostileQuadruped.isMoving = false;
            } else {
                hostileQuadruped.isMoving = true;
                // Rotate hostile quadruped to face player
                const angle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
                hostileQuadruped.rotation.y = angle;
            }
        } else {
            // Wandering behavior
            const oldPosition = hostileQuadruped.position.clone();
            const moveVector = hostileQuadruped.userData.direction.clone().multiplyScalar(0.5);
            hostileQuadruped.position.add(moveVector);

            // Clamp position within bounds
            hostileQuadruped.position.x = Math.max(-5000, Math.min(5000, hostileQuadruped.position.x));
            hostileQuadruped.position.z = Math.max(-5000, Math.min(5000, hostileQuadruped.position.z));

            let collided = false;
            for (let wall of walls) {
                const hostileQuadrupedBox = new THREE.Box3().setFromObject(hostileQuadruped);
                const wallBox = new THREE.Box3().setFromObject(wall);
                if (hostileQuadrupedBox.intersectsBox(wallBox)) {
                    collided = true;
                    break;
                }
            }

            if (collided) {
                hostileQuadruped.position.copy(oldPosition);
                hostileQuadruped.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                hostileQuadruped.isMoving = false;
            } else {
                hostileQuadruped.isMoving = true;
                // Rotate hostile quadruped to face movement direction
                const angle = Math.atan2(moveVector.x, moveVector.z);
                hostileQuadruped.rotation.y = angle;
            }
        }

        // Animate hostile quadruped
        animateQuadruped(hostileQuadruped, delta);
    });
}

// Function for hostile quadrupeds to attack player
function attackPlayerByHostileQuadruped(hostileQuadruped, delta) {
    if (hostileQuadruped.userData.isDead || playerInvulnerable) return;

    // Calculate damage based on damageRate and delta time
    const damage = hostileQuadruped.userData.damageRate * delta;
    const actualDamage = Math.max(0, damage - (characterStats.vitality / 10));

    playerHealth -= actualDamage;
    if (playerHealth <= 0) {
        playerHealth = 0;
        alert('You have been defeated!');
        // Implement game over logic here
    }
    updateHealthDisplay();
}

// Function to handle defeating a hostile quadruped
function defeatHostileQuadruped(hostileQuadruped) {
    addExperience(30); // Adjust experience as needed
    gold += 15; // Adjust gold as needed
    updateGoldDisplay();
    alert('Hostile quadruped defeated! You gained 30 experience and 15 gold.');

    hostileQuadruped.isMoving = false;
    hostileQuadruped.userData.isDead = true;
    hostileQuadruped.userData.deathTime = 0;
}

// Function to loot a hostile quadruped
function lootHostileQuadruped(hostileQuadruped) {
    if (hostileQuadruped.userData.hasBeenLooted) {
        alert('This creature has already been looted.');
        return;
    }

    isLooting = true;
    lootProgress = 0;
    currentLootingEnemy = hostileQuadruped;
    document.getElementById('lootBarContainer').style.display = 'block';
}

// Generate random items from the hostile_mob_loot table
function generateHostileMobLoot(count) {
    const items = [
        { name: 'Beast Claw', description: 'A sharp claw from a ferocious beast.' },
        { name: 'Tough Hide', description: 'A piece of thick hide, useful for crafting.' },
        { name: 'Wild Fang', description: 'A fang that exudes a dangerous aura.' },
        { name: 'Savage Horn', description: 'A horn that could be valuable to collectors.' },
        { name: 'Enchanted Fur', description: 'Fur that seems to have magical properties.' },
        // Add more items as needed
    ];
    const randomItems = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * items.length);
        // Clone the item to avoid reference issues
        randomItems.push({ ...items[randomIndex] });
    }
    return randomItems;
}

// Modify openLootPopup to handle hostile quadruped loot
function openLootPopupHostileQuadruped() {
    lootedItems = generateHostileMobLoot(2);

    const lootItemsDiv = document.getElementById('lootItems');
    lootItemsDiv.innerHTML = '';
    lootedItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerText = item.name;
        lootItemsDiv.appendChild(itemDiv);
    });

    document.getElementById('lootPopup').style.display = 'block';
}

// Modify lootAllItems to handle hostile quadrupeds
function lootAllItemsHostileQuadruped() {
    lootedItems.forEach(item => {
        addItemToInventory(item);
    });
    lootedItems = [];
    document.getElementById('lootPopup').style.display = 'none';

    if (currentLootingEnemy) {
        // Change quadruped color to black
        currentLootingEnemy.traverse(child => {
            if (child.isMesh) {
                child.material.color.set(0x000000); // Black color
            }
        });

        // Set the hasBeenLooted flag to true
        currentLootingEnemy.userData.hasBeenLooted = true;

        currentLootingEnemy = null;
    }

    isLooting = false;
    document.getElementById('lootBarContainer').style.display = 'none';
    document.getElementById('lootBar').style.width = '0%';
    alert('Items looted and added to your inventory.');
}

// Function to spawn hostile quadrupeds
function addHostileQuadrupeds() {
    for (let i = 0; i < 5; i++) {
        let position = getRandomPositionOutsideTown(500, 1500);
        createHostileQuadruped(position.x, 0, position.z);
    }
}


// Function to attack a hostile quadruped
function attackHostileQuadruped(hostileQuadruped) {
    const attackRange = 20;

    const distance = player.position.distanceTo(hostileQuadruped.position);

    if (distance <= attackRange) {
        playAttackAnimation();

        setTimeout(() => {
            defeatHostileQuadruped(hostileQuadruped);
        }, 500);
    } else {
        alert('Creature is too far away!');
    }
}
