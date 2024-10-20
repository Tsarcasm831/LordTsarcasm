// ... (keep all existing code up to the levelUp function)

// Example function to handle leveling up
function levelUp() {
    if (characterStats.experience >= characterStats.nextLevelExperience) {
        characterStats.level += 1;
        characterStats.experience -= characterStats.nextLevelExperience;
        characterStats.nextLevelExperience = Math.floor(characterStats.nextLevelExperience * 1.5);
        characterStats.statPoints += 5; // Grant 5 stat points per level
        alert(`Leveled up to ${characterStats.level}! You have ${characterStats.statPoints} stat points to distribute.`);
        updateDisplay();
        
        // Open skill tree upon leveling up
        openSkillTree();
    }
}

// Update the updateDisplay function to include skill-related information
function updateDisplay() {
    document.getElementById('level').textContent = characterStats.level;
    document.getElementById('experience').textContent = characterStats.experience;
    document.getElementById('nextLevelExperience').textContent = characterStats.nextLevelExperience;
    document.getElementById('strength').textContent = characterStats.strength;
    document.getElementById('dexterity').textContent = characterStats.dexterity;
    document.getElementById('vitality').textContent = characterStats.vitality;
    document.getElementById('energy').textContent = characterStats.energy;
    document.getElementById('mana').textContent = characterStats.mana;
    document.getElementById('karma').textContent = characterStats.karma;
    document.getElementById('reputation').textContent = characterStats.reputation;
    document.getElementById('statPoints').textContent = characterStats.statPoints;

    // Update skill-related displays
    if (characterStats.swordDamage) {
        document.getElementById('swordDamage').textContent = `+${(characterStats.swordDamage * 100).toFixed(0)}%`;
    }
    if (characterStats.dodgeChance) {
        document.getElementById('dodgeChance').textContent = `+${(characterStats.dodgeChance * 100).toFixed(0)}%`;
    }
    if (characterStats.maxHealth) {
        document.getElementById('maxHealth').textContent = characterStats.maxHealth;
    }
    if (characterStats.healthRegen) {
        document.getElementById('healthRegen').textContent = `+${characterStats.healthRegen}/s`;
    }
    if (characterStats.manaEfficiency) {
        document.getElementById('manaEfficiency').textContent = `-${(characterStats.manaEfficiency * 100).toFixed(0)}%`;
    }
    if (characterStats.spells) {
        document.getElementById('spells').textContent = characterStats.spells.join(', ');
    }
}

// Modify the onDocumentKeyDown function to ensure 'K' key functionality
function onDocumentKeyDown(event) {
    // ... (keep existing code)

    if (event.key.toLowerCase() === 'k') {
        if (document.getElementById('skillTree').style.display === 'none') {
            openSkillTree();
        } else {
            closeSkillTree();
        }
        return;
    }

    // ... (keep the rest of the existing code)
}

// ... (keep all remaining existing code)

// Add this function to initialize the skill tree
function initializeSkillTree() {
    renderSkillTree();
    document.getElementById('skillTree').style.display = 'none';
}

// Call this function in your init() function
function init() {
    // ... (existing initialization code)
    
    initializeSkillTree();
    
    // ... (rest of the initialization code)
}

// Make sure to call init() at the end of the file if it's not already being called
init();
animate();
