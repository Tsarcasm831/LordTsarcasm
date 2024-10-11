function updateStatsDisplay() {
    document.getElementById('level').innerText = characterStats.level;
    document.getElementById('experience').innerText = characterStats.experience;
    document.getElementById('nextLevelExperience').innerText = characterStats.nextLevelExperience;
    document.getElementById('strength').innerText = characterStats.strength;
    document.getElementById('dexterity').innerText = characterStats.dexterity;
    document.getElementById('vitality').innerText = characterStats.vitality;
    document.getElementById('energy').innerText = characterStats.energy;
    document.getElementById('statPoints').innerText = characterStats.statPoints;
}

function updateGoldDisplay() {
    document.getElementById('goldAmount').innerText = gold;
}

function updateHealthDisplay() {
    document.getElementById('lifeValue').innerText = `${playerHealth}/${playerMaxHealth}`;
    let healthPercent = (playerHealth / playerMaxHealth) * 100;
    document.getElementById('lifeFill').style.height = `${healthPercent}%`;
}

function updateEnergyDisplay() {
    document.getElementById('energyValue').innerText = `${playerEnergy}/${playerMaxEnergy}`;
    let energyPercent = (playerEnergy / playerMaxEnergy) * 100;
    document.getElementById('energyOrb').style.clipPath = `inset(${100 - energyPercent}% 0 0 0)`;
}

updateGoldDisplay();
updateHealthDisplay();
updateEnergyDisplay();
updateStatsDisplay();