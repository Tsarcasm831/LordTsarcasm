//chest.js
function openChestPopup(chest) {
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

function closeChestPopup() {
    document.getElementById('chestPopup').style.display = 'none';
    currentOpenedChest = null;

    // Update the main inventory display if it's open
    if (inventoryOpen) {
        populateInventoryGrid(document.getElementById('inventoryGridTab1'), playerInventory);
    }
}

function takeAllChestItems() {
    const chest = currentOpenedChest;
    chest.userData.items.forEach(item => {
        addItemToInventory(item);
    });
    chest.userData.items = [];
    gold += chest.userData.gold;
    updateGoldDisplay();
    chest.userData.gold = 0;

    scene.remove(chest);

    closeChestPopup();
}

function createTreasureChest(x, y, z) {
    const chestGeometry = new THREE.BoxGeometry(10, 10, 10);
    const chestMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const chest = new THREE.Mesh(chestGeometry, chestMaterial);
    chest.position.set(x, y + 5, z);

    chest.userData = {
        type: 'treasureChest',
        items: generateRandomItems(3),
        gold: Math.floor(Math.random() * 100) + 50
    };

    scene.add(chest);
    treasureChests.push(chest); // Keep track of treasure chests
    return chest;
}