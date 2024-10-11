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

	// Set initial colors
	document.getElementById('npcHeadColorInput').value = '#' + npc.head.material.color.getHexString();
	document.getElementById('npcBodyColorInput').value = '#' + npc.body.material.color.getHexString();
	document.getElementById('npcArmColorInput').value = '#' + npc.leftArm.material.color.getHexString();
	document.getElementById('npcLegColorInput').value = '#' + npc.leftLeg.material.color.getHexString();

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