// teleport.js
function startTeleportation() {
    isTeleporting = true;
    teleportProgress = 0;
    document.getElementById('teleportationBarContainer').style.display = 'block';
}

function updateTeleportation(delta) {
    if (isTeleporting) {
        teleportProgress += delta;
        const progressBar = document.getElementById('teleportationBar');
        progressBar.style.width = (teleportProgress / teleportationDuration) * 100 + '%';
        if (teleportProgress >= teleportationDuration) {
            isTeleporting = false;
            document.getElementById('teleportationBarContainer').style.display = 'none';
            progressBar.style.width = '0%';
            teleportToSafeZone();
        }
    }
}

function teleportToSafeZone() {
    previousPosition = player.position.clone(); // Save current position
    player.position.set(0, 0, 0); // Teleport to the center of the shrine
    destination = null; // Stop any movement
}

function teleportPlayer() {
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