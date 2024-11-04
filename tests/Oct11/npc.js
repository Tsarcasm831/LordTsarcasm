// npc.js
function openNpcPopup(npc) {
    if (npcPopupOpen) {
        closeNpcPopup();
        return;
    }
    document.getElementById('npcPopup').querySelector('h2').innerText = npc.userData.name || 'Friendly NPC';
    document.getElementById('npcPopup').querySelector('p').innerText = npc.userData.dialogue || 'Hello, traveler! Stay awhile and listen...';
    document.getElementById('npcPopup').style.display = 'block';
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

function openTradeInterface(npcInventory) {
    // Display the trade window modal
    const tradeWindow = document.getElementById('tradeWindow');
    tradeWindow.style.display = 'block';

    // Get the player and NPC inventory elements
    const playerInventoryGrid = document.getElementById('playerInventoryGrid');
    const npcInventoryGrid = document.getElementById('npcInventoryGrid');

    // Populate the inventories
    populateInventoryGrid(playerInventoryGrid, playerInventory);
    populateInventoryGrid(npcInventoryGrid, npcInventory);

    // Setup event listeners for trade functionality
    setupTradeSlotEventListeners(playerInventoryGrid, playerInventory, npcInventory, npcInventoryGrid);
}

// Function to close trade interface
function closeTradeInterface() {
    const tradeWindow = document.getElementById('tradeWindow');
    tradeWindow.style.display = 'none';
}

// Setup trade event listeners for slots
function setupTradeSlotEventListeners(playerGrid, playerItems, npcItems, npcGrid) {
    // Player's inventory click events
    setupInventorySlotEventListeners(playerGrid, playerItems, npcItems, npcGrid);

    // NPC's inventory click events
    setupInventorySlotEventListeners(npcGrid, npcItems, playerItems, playerGrid);
}

// Open trade interface when clicking the "Trade" button in NPC popup
document.getElementById('tradeButton').addEventListener('click', () => openTradeInterface(npcInventory));
