function openAdminConsole() {
    document.getElementById('adminConsole').style.display = 'block';
    adminConsoleOpen = true;

    if (isAdminLoggedIn) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminControls').style.display = 'block';
    } else {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminControls').style.display = 'none';
    }
}

function closeAdminConsole() {
    document.getElementById('adminConsole').style.display = 'none';
    adminConsoleOpen = false;

    // Reset admin login status to require password again
    isAdminLoggedIn = false;
    document.getElementById('adminControls').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
}

function checkAdminPassword() {
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

function updatePlayerOptions() {
    playerInvulnerable = document.getElementById('invulnerabilityCheckbox').checked;
    alert('Player options updated.');
}

function updatePlayerStats() {
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

function updateGameSettings() {
    const enemySpeedInput = parseFloat(document.getElementById('enemySpeedInput').value);

    if (!isNaN(enemySpeedInput) && enemySpeedInput > 0) {
        globalEnemySpeed = enemySpeedInput;
        alert('Game settings updated.');
    } else {
        alert('Invalid enemy speed!');
    }
}

function levelUp() {
    characterStats.level++;
    characterStats.experience -= characterStats.nextLevelExperience;
    characterStats.nextLevelExperience = Math.floor(characterStats.nextLevelExperience * 1.5);
    characterStats.statPoints += 5;
    alert('Level Up! You have reached level ' + characterStats.level);
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

function closeAllMenus() {
    // Close Inventory
    if (inventoryOpen) {
        inventoryOpen = false;
        document.getElementById('inventory').style.display = 'none';
    }

    // Close Stats
    if (statsOpen) {
        statsOpen = false;
        document.getElementById('stats').style.display = 'none';
    }

    // Close Admin Console
    if (adminConsoleOpen) {
        closeAdminConsole();
    }

    // Close Quest Log
    if (questLogOpen) { // We'll define questLogOpen
        questLogOpen = false;
        document.getElementById('questLog').style.display = 'none';
    }

    // Close Help Window
    if (helpWindowOpen) {
        helpWindowOpen = false;
        document.getElementById('helpWindow').style.display = 'none';
    }

    // Close Loot Popup
    if (isLooting) {
        isLooting = false;
        document.getElementById('lootBarContainer').style.display = 'none';
        document.getElementById('lootBar').style.width = '0%';
    }
    document.getElementById('lootPopup').style.display = 'none';

    // Close NPC Popup
    if (npcPopupOpen) {
        closeNpcPopup();
    }

    // Close Chest Popup
    if (currentOpenedChest) {
        closeChestPopup();
    }

    // Close Skill Tree
    if (document.getElementById('skillTree').style.display === 'block') {
        closeSkillTree();
    }

    // Close Fullscreen Map
    if (document.getElementById('fullscreenMap').style.display === 'block') {
        closeFullscreenMap();
    }

    // Add more menus as needed
}

function addExperience(amount) {
    characterStats.experience += amount;
    if (characterStats.experience >= characterStats.nextLevelExperience) {
        levelUp();
    }
    updateStatsDisplay();
}

// Function to handle hotbar slot selection
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