// npc.js
function openNpcPopup(npc) {
    if (npcPopupOpen) {
        closeNpcPopup();
        return;
    }
    document.getElementById('npcPopup').querySelector('h2').innerText = npc.userData.name || 'Friendly NPC';
    document.getElementById('npcPopup').querySelector('p').innerText = npc.userData.dialogue || 'Hello, traveler! Stay awhile and listen...';
    document.getElementById('npcPopup').style.display = 'block';
    
    const tradeButton = document.getElementById('tradeButton');
    // Remove any existing click listeners
    tradeButton.replaceWith(tradeButton.cloneNode(true));
    const newTradeButton = document.getElementById('tradeButton');
    
    // Set up trade button with NPC data
    newTradeButton.addEventListener('click', () => {
        const inventory = npc.userData.inventory || generateRandomItems(10);
        const gold = npc.userData.gold || Math.floor(Math.random() * 500 + 100);
        openTradeInterface(inventory, gold, npc);
    });
    
    npcPopupOpen = true;
}

function closeNpcPopup() {
    document.getElementById('npcPopup').style.display = 'none';
    npcPopupOpen = false;
}

function openNpcAdminPopup(npc) {
    currentNpc = npc;
    document.getElementById('npcNameInput').value = npc.userData.name || '';
    document.getElementById('npcHealthInput').value = npc.userData.health || 100;
    document.getElementById('npcDialogueInput').value = npc.userData.dialogue || '';

    // Check if each part exists before accessing its color
    if (npc.head && npc.head.material && npc.head.material.color) {
        document.getElementById('npcHeadColorInput').value = '#' + npc.head.material.color.getHexString();
    }
    if (npc.body && npc.body.material && npc.body.material.color) {
        document.getElementById('npcBodyColorInput').value = '#' + npc.body.material.color.getHexString();
    }
    if (npc.leftArm && npc.leftArm.material && npc.leftArm.material.color) {
        document.getElementById('npcArmColorInput').value = '#' + npc.leftArm.material.color.getHexString();
    }
    if (npc.leftLeg && npc.leftLeg.material && npc.leftLeg.material.color) {
        document.getElementById('npcLegColorInput').value = '#' + npc.leftLeg.material.color.getHexString();
    }

    document.getElementById('npcAdminPopup').style.display = 'block';
}


function closeNpcAdminPopup() {
    document.getElementById('npcAdminPopup').style.display = 'none';
    currentNpc = null;
}

function createFriendlyNPC(color = 0x00ff00, name = 'Friendly NPC', dialogue = 'Hello!') {
    const npc = createHumanoid(color);
    npc.userData.type = 'friendly';
    npc.userData.name = name;
    npc.userData.dialogue = dialogue;
    return npc;
}

function saveNpcChanges() {
	if (currentNpc) {
		currentNpc.userData.name = document.getElementById('npcNameInput').value;
		currentNpc.userData.health = parseInt(document.getElementById('npcHealthInput').value) || 100;
		currentNpc.userData.dialogue = document.getElementById('npcDialogueInput').value;

		// Update colors
		const headColor = new THREE.Color(document.getElementById('npcHeadColorInput').value);
		const bodyColor = new THREE.Color(document.getElementById('npcBodyColorInput').value);
		const armColor = new THREE.Color(document.getElementById('npcArmColorInput').value);
		const legColor = new THREE.Color(document.getElementById('npcLegColorInput').value);

		currentNpc.head.material.color.set(headColor);
		currentNpc.body.material.color.set(bodyColor);
		currentNpc.leftArm.material.color.set(armColor);
		currentNpc.rightArm.material.color.set(armColor);
		currentNpc.leftLeg.material.color.set(legColor);
		currentNpc.rightLeg.material.color.set(legColor);

		alert('NPC changes saved.');
		closeNpcAdminPopup();
	}
}

// Existing code for NPC popup and admin popup remains...

function openTradeInterface(npcInventory, npcGold, npc) {
    // Make sure trade window is initialized
    if (!document.getElementById('tradeWindow')) {
        initializeTradeWindow();
    }
    
    // Open trade window first
    openTradeWindow(npc);
    
    // Then populate the grids
    populateInventoryGrid('npcInventoryGrid', npcInventory, true);
    populateInventoryGrid('playerInventoryGrid', playerInventory || [], false);
    
    // Update gold display
    document.getElementById('npcGoldAmount').innerText = `Gold: ${npcGold}`;
}

function closeTradeInterface() {
    document.getElementById('tradeWindow').style.display = 'none';
}

// Setup trade event listeners for slots
function setupTradeSlotEventListeners(playerGrid, playerItems, npcItems, npcGrid) {
    // Player's inventory click events
    setupInventorySlotEventListeners(playerGrid, playerItems, npcItems, npcGrid);

    // NPC's inventory click events
    setupInventorySlotEventListeners(npcGrid, npcItems, playerItems, playerGrid);
}

// Open trade interface when clicking the "Trade" button in NPC popup
// Removed event listener as it is now handled in openNpcPopup function

function initializeTradeWindow() {
    // Initialize trade window HTML here
}

function openTradeWindow(npc) {
    document.getElementById('tradeWindow').style.display = 'block';
}
