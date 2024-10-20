// Skill Tree Data
const skillTree = {
    combat: {
        name: "Combat",
        skills: {
            swordMastery: {
                name: "Sword Mastery",
                description: "Increases damage with swords by 10%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: (level) => ({ swordDamage: level * 0.1 })
            },
            quickReflexes: {
                name: "Quick Reflexes",
                description: "Increases dodge chance by 5%",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: (level) => ({ dodgeChance: level * 0.05 })
            }
        }
    },
    magic: {
        name: "Magic",
        skills: {
            fireball: {
                name: "Fireball",
                description: "Learn to cast a fireball spell",
                maxLevel: 1,
                currentLevel: 0,
                cost: 3,
                effect: () => ({ newSpell: "fireball" })
            },
            manaEfficiency: {
                name: "Mana Efficiency",
                description: "Reduces mana cost of spells by 10%",
                maxLevel: 5,
                currentLevel: 0,
                cost: 2,
                effect: (level) => ({ manaEfficiency: level * 0.1 })
            }
        }
    },
    survival: {
        name: "Survival",
        skills: {
            toughSkin: {
                name: "Tough Skin",
                description: "Increases max health by 10",
                maxLevel: 5,
                currentLevel: 0,
                cost: 1,
                effect: (level) => ({ maxHealth: level * 10 })
            },
            quickRecovery: {
                name: "Quick Recovery",
                description: "Increases health regeneration by 1 per second",
                maxLevel: 3,
                currentLevel: 0,
                cost: 2,
                effect: (level) => ({ healthRegen: level })
            }
        }
    }
};

// Function to render the skill tree
function renderSkillTree() {
    const skillTreeElement = document.getElementById('skillTree');
    skillTreeElement.innerHTML = ''; // Clear existing content

    for (const [category, categoryData] of Object.entries(skillTree)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'skill-category';
        categoryElement.innerHTML = `<h3>${categoryData.name}</h3>`;

        for (const [skillId, skillData] of Object.entries(categoryData.skills)) {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill';
            skillElement.innerHTML = `
                <h4>${skillData.name}</h4>
                <p>${skillData.description}</p>
                <p>Level: ${skillData.currentLevel}/${skillData.maxLevel}</p>
                <p>Cost: ${skillData.cost} skill points</p>
                <button onclick="upgradeSkill('${category}', '${skillId}')">Upgrade</button>
            `;
            categoryElement.appendChild(skillElement);
        }

        skillTreeElement.appendChild(categoryElement);
    }
}

// Function to upgrade a skill
function upgradeSkill(category, skillId) {
    const skill = skillTree[category].skills[skillId];
    if (skill.currentLevel < skill.maxLevel && characterStats.statPoints >= skill.cost) {
        skill.currentLevel++;
        characterStats.statPoints -= skill.cost;
        applySkillEffect(category, skillId);
        renderSkillTree();
        updateDisplay(); // Update the character stats display
    } else {
        alert("Not enough skill points or maximum level reached!");
    }
}

// Function to apply skill effect
function applySkillEffect(category, skillId) {
    const skill = skillTree[category].skills[skillId];
    const effect = skill.effect(skill.currentLevel);
    
    for (const [stat, value] of Object.entries(effect)) {
        if (stat === 'newSpell') {
            // Add new spell to player's spell list
            if (!characterStats.spells) characterStats.spells = [];
            characterStats.spells.push(value);
        } else {
            // Apply stat boost
            if (!characterStats[stat]) characterStats[stat] = 0;
            characterStats[stat] += value;
        }
    }
}

// Function to open the skill tree
function openSkillTree() {
    renderSkillTree();
    document.getElementById('skillTree').style.display = 'block';
}

// Function to close the skill tree
function closeSkillTree() {
    document.getElementById('skillTree').style.display = 'none';
}

// Add event listener for the 'K' key to open/close the skill tree
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'k') {
        const skillTree = document.getElementById('skillTree');
        if (skillTree.style.display === 'none') {
            openSkillTree();
        } else {
            closeSkillTree();
        }
    }
});
