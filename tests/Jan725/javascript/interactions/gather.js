// gather.js

// Ensure playerInventory exists globally
if (!window.playerInventory) {
    window.playerInventory = [];
}

// Global variables for gathering state
let isGathering = false;
let gatherProgress = 0;
let currentGatherTarget = null;

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
    if (!isGathering && target.userData && target.userData.type === 'tree') {
        isGathering = true;
        gatherProgress = 0;
        currentGatherTarget = target;
        gatherBarContainer.style.display = 'block';
        
        // Add visual feedback that gathering has started
        console.log('Started gathering from:', target.userData.name);
    }
}

// Function to update gathering progress
function updateGathering(delta) {
    if (isGathering && currentGatherTarget) {
        const gatheringTime = currentGatherTarget.userData.gatheringTime / 1000; // Convert to seconds
        gatherProgress += delta;
        const progressBar = document.getElementById('gatherBar');
        const progressPercentage = (gatherProgress / gatheringTime) * 100;
        progressBar.style.width = progressPercentage + '%';
        
        if (gatherProgress >= gatheringTime) {
            completeGathering();
        }
    }
}

// Function to complete gathering
function completeGathering() {
    if (currentGatherTarget && currentGatherTarget.userData.type === 'tree') {
        // Extract the tree type from the name
        const treeName = currentGatherTarget.userData.name;
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
        
        resetGathering();
    }
}

// Function to cancel gathering
function cancelGathering() {
    if (isGathering) {
        isGathering = false;
        gatherProgress = 0;
        currentGatherTarget = null;
        gatherBarContainer.style.display = 'none';
        gatherBar.style.width = '0%';
    }
}

// Function to reset gathering state
function resetGathering() {
    isGathering = false;
    gatherProgress = 0;
    currentGatherTarget = null;
    gatherBarContainer.style.display = 'none';
    gatherBar.style.width = '0%';
}

// Export functions
window.startGathering = startGathering;
window.updateGathering = updateGathering;
window.cancelGathering = cancelGathering;
