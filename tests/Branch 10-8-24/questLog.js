// questLog.js

let quests = [];

function initializeQuestLog() {
    quests = []; // Initialize the quest array
}

function addQuest(quest) {
    quests.push(quest);
    updateQuestLogDisplay();
}

function updateQuest(questId, updates) {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
        Object.assign(quest, updates);
        updateQuestLogDisplay();
    }
}

function completeQuest(questId) {
    updateQuest(questId, { completed: true });
}

function updateQuestLogDisplay() {
    const questList = document.getElementById('questList');
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

function openQuestLog() {
    document.getElementById('questLog').style.display = 'block';
    updateQuestLogDisplay();
}

function closeQuestLog() {
    document.getElementById('questLog').style.display = 'none';
}

