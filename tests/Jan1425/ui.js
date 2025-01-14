// ui.js

// Tooltip Element
const tooltip = document.getElementById('tooltip');

// Initialize UI Components
function initializeUI() {
    initializeStatsUI();
    initializeSkillTreeUI();
    initializeBestiaryUI();
    initializeQuestLogUI();
    initializeHelpWindowUI();
    initializeAdminConsoleUI();
    initializeHotbarUI();
    initializeLootPopupUI();
    initializeNpcPopupUI();
    initializeChestPopupUI();
    initializeEnergyOrbUI();
    initializeLifeOrbUI();
    initializeTeleportationBarUI();
}

// --------------------------------------- Stats UI ---------------------------------------

function initializeStatsUI() {
    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('level').innerText = characterStats.level;
    document.getElementById('experience').innerText = characterStats.experience;
    document.getElementById('nextLevelExperience').innerText = characterStats.nextLevelExperience;
    document.getElementById('strength').innerText = characterStats.strength;
    document.getElementById('dexterity').innerText = characterStats.dexterity;
    document.getElementById('vitality').innerText = characterStats.vitality;
    document.getElementById('energy').innerText = characterStats.energy;
    document.getElementById('statPoints').innerText = characterStats.statPoints;
}

function increaseStat(stat) {
    if (characterStats.statPoints > 0) {
        characterStats[stat]++;
        characterStats.statPoints--;
        updateStatsDisplay();
    } else {
        alert('No available stat points!');
    }
}

// --------------------------------------- Skill Tree UI ---------------------------------------


function initializeSkillTreeUI() {
    // Skill Tree is initialized when opened
}

function openSkillTree() {
    const skillTreeDiv = document.getElementById('skillTree');
    skillTreeDiv.style.display = 'block';
    populateSkillTree();
}

function closeSkillTree() {
    const skillTreeDiv = document.getElementById('skillTree');
    skillTreeDiv.style.display = 'none';
}

function populateSkillTree() {
    const skillsContainer = document.getElementById('skillsContainer');
    skillsContainer.innerHTML = ''; // Clear existing skills

    for (const key in skillTreeData) {
        if (skillTreeData.hasOwnProperty(key)) {
            const skill = skillTreeData[key];
            const skillDiv = document.createElement('div');
            skillDiv.classList.add('skill');
            if (skill.learned) {
                skillDiv.classList.add('learned');
            }
            skillDiv.innerHTML = `<strong>${skill.name}</strong><br>${skill.description}<br>Cost: ${skill.cost} XP`;
            
            // Add click event to learn the skill
            skillDiv.addEventListener('click', () => {
                if (!skill.learned && characterStats.experience >= skill.cost * 100) { // Assuming 100 XP per cost unit
                    characterStats.experience -= skill.cost * 100;
                    characterStats[Object.keys(skillTreeData)[Object.keys(skillTreeData).indexOf(key)]] += 5; // Increase the relevant stat
                    skill.learned = true;
                    updateStatsDisplay();
                    populateSkillTree(); // Refresh the skill tree
                    alert(`You have learned ${skill.name}!`);
                } else if (skill.learned) {
                    alert('Skill already learned.');
                } else {
                    alert('Not enough experience to learn this skill.');
                }
            });

            // Add CSS classes based on skill availability
            if (!skill.learned && characterStats.experience < skill.cost * 100) {
                skillDiv.classList.add('unavailable');
            }

            skillsContainer.appendChild(skillDiv);
        }
    }
}



// --------------------------------------- Help Window UI ---------------------------------------



function initializeHelpWindowUI() {
    // Help Window is initialized when opened
}

function toggleHelpWindow() {
    helpWindowOpen = !helpWindowOpen;
    document.getElementById('helpWindow').style.display = helpWindowOpen ? 'block' : 'none';
}

// --------------------------------------- Admin Console UI ---------------------------------------



function initializeAdminConsoleUI() {
    // Admin Console is initialized when opened
}

function openAdminConsoleUI() {
    const adminConsole = document.getElementById('adminConsole');
    adminConsole.classList.add('show');
    if (isAdminLoggedIn) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminControls').style.display = 'block';
    } else {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminControls').style.display = 'none';
    }
}

function closeAdminConsoleUI() {
    const adminConsole = document.getElementById('adminConsole');
    adminConsole.classList.remove('show');
    isAdminLoggedIn = false;
    document.getElementById('adminControls').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
}

function checkAdminPasswordUI() {
    const passwordInput = document.getElementById('adminPassword').value;
    if (passwordInput === 'ltwelcome1') {
        isAdminLoggedIn = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminControls').style.display = 'block';
        document.getElementById('adminPassword').value = ''; // Clear password field

        // Attach the change event listener only once
        if (!document.getElementById('npcAdminCheckbox').hasAttribute('data-listener')) {
            document.getElementById('npcAdminCheckbox').addEventListener('change', function() {
                npcAdminEnabled = this.checked;
                alert('NPC Admin Mode ' + (npcAdminEnabled ? 'Enabled' : 'Disabled'));
            });
            document.getElementById('npcAdminCheckbox').setAttribute('data-listener', 'true');
        }
    } else {
        alert('Incorrect password!');
    }
}

function updatePlayerOptionsUI() {
    playerInvulnerable = document.getElementById('invulnerabilityCheckbox').checked;
    alert('Player options updated.');
}

function updatePlayerStatsUI() {
    const healthInput = parseInt(document.getElementById('playerHealthInput').value);
    const goldInput = parseInt(document.getElementById('playerGoldInput').value);
    const experienceInput = parseInt(document.getElementById('playerExperienceInput').value);

    if (!isNaN(healthInput)) {
        playerHealth = Math.min(healthInput, playerMaxHealth);
        updateHealthDisplay();
    }
    if (!isNaN(goldInput)) {
        gold = goldInput;
        updateGoldDisplay();
    }
    if (!isNaN(experienceInput)) {
        characterStats.experience = experienceInput;
        if (characterStats.experience >= characterStats.nextLevelExperience) {
            levelUp();
        }
        updateStatsDisplay();
    }
    alert('Player stats updated.');
}

function spawnEntitiesUI() {
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
            enemy.userData.homePosition = enemy.position.clone();
            enemy.userData.wanderRadius = 500; // Adjust as needed
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

function updateGameSettingsUI() {
    const enemySpeedInput = parseFloat(document.getElementById('enemySpeedInput').value);

    if (!isNaN(enemySpeedInput) && enemySpeedInput > 0) {
        globalEnemySpeed = enemySpeedInput;
        alert('Game settings updated.');
    } else {
        alert('Invalid enemy speed!');
    }
}

function teleportPlayerUI() {
    const x = parseFloat(document.getElementById('teleportXInput').value);
    const z = parseFloat(document.getElementById('teleportZInput').value);

    if (!isNaN(x) && !isNaN(z)) {
        player.position.set(x, player.position.y, z);
        destination = null;
        isTeleporting = false; // Reset teleporting state
        document.getElementById('teleportationBarContainer').style.display = 'none'; // Hide progress bar
        document.getElementById('teleportationBar').style.width = '0%'; // Reset progress bar
        alert(`Player teleported to (${x}, ${z}).`);
    } else {
        alert('Invalid coordinates!');
    }
}

// --------------------------------------- Hotbar UI ---------------------------------------

function initializeHotbarUI() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            const slotNumber = slot.getAttribute('data-slot');
            handleHotbarSelection(slotNumber);
        });
    });
}

function handleHotbarSelection(slotNumber) {
    const selectedSlot = document.querySelector(`.slot[data-slot="${slotNumber}"]`);
    if (selectedSlot) {
        // Add a visual indicator for selection (e.g., a border)
        document.querySelectorAll('.slot').forEach(slot => slot.style.borderColor = '#555'); // Reset all borders
        selectedSlot.style.borderColor = '#FFD700'; // Highlight selected slot with gold color

        // Implement the action you want when a slot is selected
        // For example, equip the item in the slot or activate its ability
        console.log(`Hotbar slot ${slotNumber} selected.`);
        // Add your custom action here
    }
}

// --------------------------------------- Loot Popup UI ---------------------------------------

function initializeLootPopupUI() {
    // Loot Popup is initialized when opened
}

function openLootPopupUI() {
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

function lootAllItemsUI() {
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
        // For now, we just mark it as looted

        currentLootingEnemy = null;
    }

    isLooting = false;
    document.getElementById('lootBarContainer').style.display = 'none';
    document.getElementById('lootBar').style.width = '0%';
    alert('Items looted and added to your inventory.');
}

// --------------------------------------- NPC Popup UI ---------------------------------------


function initializeNpcPopupUI() {
    // NPC Popup is initialized when opened
}

function openNpcPopupUI(npc) {
    if (npcPopupOpen) {
        closeNpcPopupUI();
        return;
    }
    document.getElementById('npcPopup').querySelector('h2').innerText = npc.userData.name || 'Friendly NPC';
    document.getElementById('npcPopup').querySelector('p').innerText = npc.userData.dialogue || 'Hello, traveler! Stay awhile and listen...';
    document.getElementById('npcPopup').style.display = 'block';
    npcPopupOpen = true;
}

function closeNpcPopupUI() {
    document.getElementById('npcPopup').style.display = 'none';
    npcPopupOpen = false;
}

// --------------------------------------- Chest Popup UI ---------------------------------------



function initializeChestPopupUI() {
    // Chest Popup is initialized when opened
}

function openChestPopupUI(chest) {
    currentOpenedChest = chest;
    const chestPopup = document.getElementById('chestPopup');
    chestPopup.style.display = 'block';

    const chestInventoryGrid = document.getElementById('chestInventoryGrid');
    const playerInventoryGrid = document.getElementById('playerInventoryInChestGrid');

    const chestColumns = 7;
    const chestRows = 4;
    const playerColumns = 7;
    const playerRows = 8;

    generateInventoryGrid(chestInventoryGrid, chestColumns, chestRows);
    generateInventoryGrid(playerInventoryGrid, playerColumns, playerRows);

    // Ensure items arrays have correct length for chests but not for playerInventory
    if (!chest.userData.items) chest.userData.items = [];
    chest.userData.items.length = chestColumns * chestRows;


    populateInventoryGridChest(chestInventoryGrid, chest.userData.items);
    populateInventoryGridChest(playerInventoryGrid, playerInventory);

    setupInventorySlotEventListeners(chestInventoryGrid, chest.userData.items, playerInventory, playerInventoryGrid);
    setupInventorySlotEventListeners(playerInventoryGrid, playerInventory, chest.userData.items, chestInventoryGrid);
}

function generateInventoryGrid(gridElement, numColumns, numRows) {
    gridElement.style.gridTemplateColumns = `repeat(${numColumns}, 50px)`;
    gridElement.innerHTML = '';
    for (let i = 0; i < numColumns * numRows; i++) {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        gridElement.appendChild(slot);
    }
}

function populateInventoryGridChest(gridElement, items) {
    gridElement.innerHTML = ''; // Clear existing items
    items.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.classList.add('inventory-slot');
        slot.innerText = item ? item.name : '';

        if (item) {
            slot.setAttribute('data-name', item.name);
            slot.setAttribute('data-description', item.description || 'No description available.');

            // Event listeners for tooltip
            slot.addEventListener('mouseenter', showTooltip);
            slot.addEventListener('mousemove', moveTooltip);
            slot.addEventListener('mouseleave', hideTooltip);
        }

        gridElement.appendChild(slot);
    });
}

function setupInventorySlotEventListeners(sourceGrid, sourceItems, targetItems, targetGrid) {
    const slots = sourceGrid.querySelectorAll('.inventory-slot');
    slots.forEach((slot, index) => {
        slot.addEventListener('click', () => {
            if (sourceItems[index]) {
                // Find first empty slot in targetItems
                let emptyIndex = targetItems.findIndex(item => item == null);
                if (emptyIndex === -1) {
                    alert('No space in target inventory.');
                    return;
                }
                // Transfer item
                targetItems[emptyIndex] = sourceItems[index];
                sourceItems[index] = null;

                // Update grids
                populateInventoryGrid(sourceGrid, sourceItems);
                populateInventoryGrid(targetGrid, targetItems);
            }
        });
    });
}

function closeChestPopupUI() {
    document.getElementById('chestPopup').style.display = 'none';
    currentOpenedChest = null;

    // Update the main inventory display if it's open
    if (inventoryOpen) {
        populateInventoryGrid(document.getElementById('inventoryGridTab1'), playerInventory);
    }
}

function takeAllChestItemsUI() {
    const chest = currentOpenedChest;
    chest.userData.items.forEach(item => {
        addItemToInventory(item);
    });
    chest.userData.items = [];
    gold += chest.userData.gold;
    updateGoldDisplay();
    chest.userData.gold = 0;

    scene.remove(chest);

    closeChestPopupUI();
}

// --------------------------------------- Additional UI Initializations ---------------------------------------

function initializeEnergyOrbUI() {
    updateEnergyDisplay();
}

function initializeLifeOrbUI() {
    updateHealthDisplay();
}

function initializeTeleportationBarUI() {
    // Teleportation Bar is handled in main.js
}

function initializeAllUI() {
    initializeUI();
    initializeHotbarUI();
    initializeLootPopupUI();
    initializeNpcPopupUI();
    initializeChestPopupUI();
}

// Initialize all UI components
document.addEventListener('DOMContentLoaded', () => {
    initializeAllUI();
});
