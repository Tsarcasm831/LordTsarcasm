// Function to open Admin Console
function openAdminConsole() {
    const adminConsole = document.getElementById('adminConsole');
    adminConsole.style.display = 'flex';
    adminConsoleOpen = true;

    // Reset to Login tab when opening
    setActiveAdminTab('adminLogin');
}

// Function to close Admin Console
function closeAdminConsole() {
    const adminConsole = document.getElementById('adminConsole');
    adminConsole.style.display = 'none';
    adminConsoleOpen = false;

    // Reset admin login status to require password again
    isAdminLoggedIn = false;
    setActiveAdminTab('adminLogin');
}

// Function to set active admin tab
function setActiveAdminTab(tabId) {
    // Remove 'active' class from all tabs
    const tabs = document.querySelectorAll('.admin-tabs .tab-button');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Hide all tab contents
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Activate the selected tab
    const activeTab = document.querySelector(`.admin-tabs .tab-button[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Show the selected tab content
    const activeContent = document.getElementById(tabId);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Special handling for tabs that require admin login
    const adminOnlyTabs = ['playerManagement', 'gameSettings', 'spawnOptions', 'teleportPlayer', 'npcAdmin'];
    if (adminOnlyTabs.includes(tabId) && !isAdminLoggedIn) {
        alert('Please log in as admin to access this section.');
        setActiveAdminTab('adminLogin');
    }
}

// Function to handle tab clicks
function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-tabs .tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            setActiveAdminTab(tabId);
        });
    });
}

// Function to check Admin Password
function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword').value;
    if (passwordInput === 'ltwelcome1') { // Replace with secure authentication in production
        isAdminLoggedIn = true;
        alert('Admin login successful!');
        setActiveAdminTab('playerManagement'); // Redirect to Player Management or desired tab

        // Attach event listeners for admin controls
        attachAdminEventListeners();
    } else {
        alert('Incorrect password!');
    }
}

// Function to attach event listeners for admin controls
function attachAdminEventListeners() {
    // Ensure event listeners are attached only once
    const npcAdminCheckbox = document.getElementById('npcAdminCheckbox');
    if (npcAdminCheckbox && !npcAdminCheckbox.hasAttribute('data-listener')) {
        npcAdminCheckbox.addEventListener('change', function() {
            npcAdminEnabled = this.checked;
            alert('NPC Admin Mode ' + (npcAdminEnabled ? 'Enabled' : 'Disabled'));
        });
        npcAdminCheckbox.setAttribute('data-listener', 'true');
    }
}

// Function to update Player Stats
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

// Function to update Player Options
function updatePlayerOptions() {
    playerInvulnerable = document.getElementById('invulnerabilityCheckbox').checked;
    alert('Player options updated.');
}

// Function to update Game Settings
function updateGameSettings() {
    const enemySpeedInput = parseFloat(document.getElementById('enemySpeedInput').value);

    if (!isNaN(enemySpeedInput) && enemySpeedInput > 0) {
        globalEnemySpeed = enemySpeedInput;
        alert('Game settings updated.');
    } else {
        alert('Invalid enemy speed!');
    }
}

// Teleport Player with Confirmation
function teleportPlayer() {
    const x = parseInt(document.getElementById('teleportXInput').value);
    const z = parseInt(document.getElementById('teleportZInput').value);

    if (!isNaN(x) && !isNaN(z)) {
        if (confirm(`Are you sure you want to teleport the player to (${x}, ${z})?`)) {
            player.position.set(x, player.position.y, z);
            alert(`Player teleported to (${x}, ${z}).`);
        }
    } else {
        alert('Invalid coordinates!');
    }
}

// Spawn Entities with Loading Indicator
function spawnEntities() {
    const entityType = document.getElementById('entityTypeSelect').value;
    const quantity = parseInt(document.getElementById('entityQuantityInput').value);

    if (isNaN(quantity) || quantity < 1) {
        alert('Please enter a valid quantity.');
        return;
    }

    if (confirm(`Are you sure you want to spawn ${quantity} ${entityType}(s)?`)) {
        // Show loading indicator
        document.getElementById('adminLoading').style.display = 'flex';

        setTimeout(() => { // Simulate async operation
            for (let i = 0; i < quantity; i++) {
                // Implement your entity spawning logic here
                console.log(`Spawning ${entityType} (${i + 1}/${quantity})`);
                // Example: spawnEntity(entityType);
            }

            alert(`Spawned ${quantity} ${entityType}(s).`);

            // Hide loading indicator
            document.getElementById('adminLoading').style.display = 'none';
        }, 1000); // Adjust timeout as needed based on actual spawning time
    }
}


// Function to handle closing all menus (existing functionality)
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

// Function to add experience (existing functionality)
function addExperience(amount) {
    characterStats.experience += amount;
    if (characterStats.experience >= characterStats.nextLevelExperience) {
        levelUp();
    }
    updateStatsDisplay();
}

// Function to handle hotbar slot selection (existing functionality)
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

// Initialize Admin Tabs on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    setupAdminTabs();
});
