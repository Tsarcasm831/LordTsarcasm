// gather.js

// Ensure playerInventory exists globally
if (!window.playerInventory) {
    window.playerInventory = [];
}

// Global variables for gathering state
window.isGathering = false;
window.gatherProgress = 0;
window.currentGatherTarget = null;
window.gatherShakeIntensity = 0.08; // Maximum shake intensity in radians
window.originalRotation = { x: 0, y: 0, z: 0 }; // Store original rotation
window.lastStrikeTime = 0;
window.strikeInterval = 0.8; // Time between strikes in seconds
window.strikeProgress = 0; // Progress of current strike animation

// Create audio elements
const chopSound = new Audio('https://file.garden/Zy7B0LkdIVpGyzA1/treechop.mp3');
chopSound.volume = 0.5; // Set volume to 50%

const fallSound = new Audio('https://file.garden/Zy7B0LkdIVpGyzA1/treefall.wav');
fallSound.volume = 0.6; // Set volume to 60%

// Create and append the gathering bar to the DOM
const gatherBarContainer = document.createElement('div');
gatherBarContainer.id = 'gatherBarContainer';
gatherBarContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    display: none;
    z-index: 1000;
`;

const gatherBar = document.createElement('div');
gatherBar.id = 'gatherBar';
gatherBar.style.cssText = `
    width: 0%;
    height: 100%;
    background-color: #ff3333;
    border-radius: 10px;
    transition: width 0.1s linear;
`;

gatherBarContainer.appendChild(gatherBar);
document.body.appendChild(gatherBarContainer);

// Function to start gathering resources
function startGathering(target) {
    if (!window.isGathering && target.userData && target.userData.type === 'tree') {
        window.isGathering = true;
        window.gatherProgress = 0;
        window.currentGatherTarget = target;
        window.lastStrikeTime = 0;
        window.strikeProgress = 0;
        gatherBarContainer.style.display = 'block';
        
        // Store the original rotation
        window.originalRotation.x = target.rotation.x;
        window.originalRotation.y = target.rotation.y;
        window.originalRotation.z = target.rotation.z;
        
        // Play initial chop sound
        chopSound.currentTime = 0;
        chopSound.play().catch(error => {
            console.log("Error playing sound:", error);
        });
        
        // Add visual feedback that gathering has started
        console.log('Started gathering from:', target.userData.name);
    }
}

// Function to update gathering progress
function updateGathering(delta) {
    if (window.isGathering && window.currentGatherTarget) {
        const gatheringTime = window.currentGatherTarget.userData.gatheringTime / 1000; // Convert to seconds
        window.gatherProgress += delta;
        const progressBar = document.getElementById('gatherBar');
        const progressPercentage = (window.gatherProgress / gatheringTime) * 100;
        progressBar.style.width = progressPercentage + '%';
        
        // Calculate number of strikes remaining
        const strikesRemaining = Math.ceil((gatheringTime - window.gatherProgress) / window.strikeInterval);
        
        // Update strike timing
        window.lastStrikeTime += delta;
        if (window.lastStrikeTime >= window.strikeInterval) {
            window.lastStrikeTime = 0;
            window.strikeProgress = 0; // Reset strike animation
            
            // Play appropriate sound
            if (strikesRemaining === 2) { // Only on second-to-last strike
                // Play fall sound
                fallSound.currentTime = 0;
                fallSound.play().catch(error => {
                    console.log("Error playing fall sound:", error);
                });
            } else if (strikesRemaining > 2) { // Normal chops, excluding last two strikes
                // Play normal chop sound
                chopSound.currentTime = 0;
                chopSound.play().catch(error => {
                    console.log("Error playing chop sound:", error);
                });
            }
            // Last strike will be silent, letting the fall sound continue
        }
        
        // Update strike animation
        if (window.strikeProgress < 0.3) { // Duration of strike animation in seconds
            window.strikeProgress += delta;
            const strikePhase = window.strikeProgress / 0.3; // Normalize to 0-1
            
            // Create a quick forward and back motion
            let shake;
            if (strikePhase < 0.3) {
                // Quick forward motion
                shake = (strikePhase / 0.3) * window.gatherShakeIntensity;
            } else if (strikePhase < 1) {
                // Slower return motion
                shake = (1 - (strikePhase - 0.3) / 0.7) * window.gatherShakeIntensity;
            } else {
                shake = 0;
            }
            
            // Apply shake to the tree
            window.currentGatherTarget.rotation.x = window.originalRotation.x + shake * 0.3;
            window.currentGatherTarget.rotation.z = window.originalRotation.z + shake;
        } else {
            // Reset to original position between strikes
            window.currentGatherTarget.rotation.x = window.originalRotation.x;
            window.currentGatherTarget.rotation.z = window.originalRotation.z;
        }
        
        if (window.gatherProgress >= gatheringTime) {
            completeGathering();
        }
    }
}

// Function to complete gathering
function completeGathering() {
    if (window.currentGatherTarget && window.currentGatherTarget.userData.type === 'tree') {
        // Extract the tree type from the name
        const treeName = window.currentGatherTarget.userData.name;
        const woodType = treeName.split(' ')[1] || 'Common'; // Get second word or default to Common
        const resourceType = `${woodType} Wood`;
        
        // Create the item object
        const gatheredItem = {
            name: resourceType,
            type: 'material',
            description: `${resourceType} gathered from a ${treeName}`,
            rarity: woodType === 'Common' ? 'Common' : 'Uncommon',
            quantity: 1
        };
        
        // Add the item to inventory
        addItemToInventory(gatheredItem);
        console.log(`Gathered ${resourceType} from ${treeName}`);
        
        // Start tree falling animation
        window.currentGatherTarget.userData.isFalling = true;
        window.currentGatherTarget.userData.fallTime = 0;
        window.currentGatherTarget.userData.fallDirection = Math.random() * Math.PI * 2; // Random fall direction
        
        resetGathering();
    }
}

// Function to update falling trees
function updateFallingTrees(delta) {
    scene.children.forEach((object) => {
        if (object.userData && object.userData.isFalling) {
            object.userData.fallTime += delta;
            
            if (object.userData.fallTime < 2) { // 2 seconds to fall
                // Calculate rotation based on fall direction
                const fallAxis = new THREE.Vector3(
                    Math.sin(object.userData.fallDirection),
                    0,
                    Math.cos(object.userData.fallDirection)
                );
                
                // Rotate around the fall axis
                const fallAngle = (Math.PI / 2) * (object.userData.fallTime / 2);
                object.quaternion.setFromAxisAngle(fallAxis, fallAngle);
                
                // Optional: Add some "weight" to the fall by adjusting the rotation speed
                if (object.userData.fallTime > 1.5) {
                    const extraRotation = Math.pow(object.userData.fallTime - 1.5, 2) * 0.5;
                    object.quaternion.setFromAxisAngle(fallAxis, fallAngle + extraRotation);
                }
            } else {
                // Keep the tree in its fallen state
                const fallAxis = new THREE.Vector3(
                    Math.sin(object.userData.fallDirection),
                    0,
                    Math.cos(object.userData.fallDirection)
                );
                object.quaternion.setFromAxisAngle(fallAxis, Math.PI / 2);
                
                // Optional: Remove the tree after some time
                if (object.userData.fallTime > 10) { // Remove after 10 seconds
                    scene.remove(object);
                }
            }
        }
    });
}

// Function to cancel gathering
function cancelGathering() {
    if (window.isGathering) {
        window.isGathering = false;
        window.gatherProgress = 0;
        gatherBarContainer.style.display = 'none';
        gatherBar.style.width = '0%';
    }
}

// Function to reset gathering state
function resetGathering() {
    window.isGathering = false;
    window.gatherProgress = 0;
    gatherBarContainer.style.display = 'none';
    const progressBar = document.getElementById('gatherBar');
    progressBar.style.width = '0%';
    
    // Reset tree rotation if there's a current target
    if (window.currentGatherTarget) {
        window.currentGatherTarget.rotation.x = window.originalRotation.x;
        window.currentGatherTarget.rotation.y = window.originalRotation.y;
        window.currentGatherTarget.rotation.z = window.originalRotation.z;
    }
    
    window.currentGatherTarget = null;
}

// Add event listener for click-away
document.addEventListener('click', function(event) {
    if (window.isGathering) {
        // Check if the click is outside the gather bar
        const clickedElement = event.target;
        if (!gatherBarContainer.contains(clickedElement)) {
            cancelGathering();
        }
    }
});

// Export functions
window.startGathering = startGathering;
window.updateGathering = updateGathering;
window.cancelGathering = cancelGathering;
window.updateFallingTrees = updateFallingTrees;
