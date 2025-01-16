// questLog.js

function initializeQuestLog() {
    // Initialize quests or other necessary setup
    quests = []; // Example initialization
    questLogOpen = false;
    // Optionally, preload some quests
}

// Add a quest to the quest log
function addQuest(quest) {
    quests.push(quest);
    updateQuestLogDisplay();
}

// Update a quest's details
function updateQuest(questId, updates) {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
        Object.assign(quest, updates);
        updateQuestLogDisplay();
    }
}

// Mark a quest as completed
function completeQuest(questId) {
    updateQuest(questId, { completed: true });
}

function initializeQuestLogUI() {
    // Initialize quests or other necessary setup
    quests = []; // Example initialization
    questLogOpen = false;
    // Optionally, preload some quests
}

// Open the quest log
function openQuestLog() {
    questLogOpen = true;
    const questLog = document.getElementById('questLog');
    if (questLog) {
        questLog.style.display = 'block';
        updateQuestLogDisplay();
    } else {
        console.error("Element with ID 'questLog' not found.");
    }
}

// Close the quest log
function closeQuestLog() {
    questLogOpen = false;
    const questLog = document.getElementById('questLog');
    if (questLog) {
        questLog.style.display = 'none';
    } else {
        console.error("Element with ID 'questLog' not found.");
    }
}

function populateQuestLog() {
    const questList = document.getElementById('questList');
    questList.innerHTML = ''; // Clear existing quests

    quests.forEach(quest => {
        const questItem = document.createElement('li');
        questItem.innerText = `${quest.name}: ${quest.description}`;
        questList.appendChild(questItem);
    });

    // Add more quest details as needed
}

// Initialize the quest log on script load
initializeQuestLog();
