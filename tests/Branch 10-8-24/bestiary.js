// bestiary.js

function initializeBestiary() {
    bestiary = {}; // Initialize the bestiary object
}

function addToBestiary(creatureKey, creatureData) {
    if (!bestiary[creatureKey]) {
        bestiary[creatureKey] = creatureData;
    }
}

function openBestiary() {
    const bestiaryDiv = document.getElementById('bestiaryContent');
    bestiaryDiv.innerHTML = '';

    for (const key in bestiary) {
        if (bestiary.hasOwnProperty(key)) {
            const creature = bestiary[key];
            const creatureDiv = document.createElement('div');
            creatureDiv.innerHTML = `<h3>${creature.name}</h3><p>${creature.description}</p>`;
            bestiaryDiv.appendChild(creatureDiv);
        }
    }

    document.getElementById('bestiary').style.display = 'block';
}

function closeBestiary() {
    document.getElementById('bestiary').style.display = 'none';
}

