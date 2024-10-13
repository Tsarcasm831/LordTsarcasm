// questLog.js

let quests = [];
let questLogOpen = false;

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

// Update the quest log display in the DOM
function updateQuestLogDisplay() {
    const questList = document.getElementById('questList');
    if (!questList) {
        console.error("Element with ID 'questList' not found.");
        return;
    }

    questList.innerHTML = '';

    quests.forEach(quest => {
        const questItem = document.createElement('li');
        questItem.innerHTML = `
            <strong>${quest.title}</strong> - ${quest.description}
            ${quest.completed ? '<span style="color: green;">(Completed)</span>' : ''}
        `;
        questList.appendChild(questItem);
    });
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

// Initialize the quest log on script load
initializeQuestLog();
