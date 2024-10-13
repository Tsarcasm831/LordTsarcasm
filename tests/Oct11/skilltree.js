// Function to Open Skill Tree
function openSkillTree() {
    const skillTreeDiv = document.getElementById('skillTree');
    skillTreeDiv.style.display = 'block';
    populateSkillTree();
}

// Function to Close Skill Tree
function closeSkillTree() {
    const skillTreeDiv = document.getElementById('skillTree');
    skillTreeDiv.style.display = 'none';
}


// Function to Populate Skill Tree UI
function populateSkillTree() {
    const skillsContainer = document.getElementById('skillsContainer');
    skillsContainer.innerHTML = ''; // Clear existing skills

    for (const key in skillTreeData) {
        if (skillTreeData.hasOwnProperty(key)) {
            const skill = skillTreeData[key];
            const skillDiv = document.createElement('div');
            skillDiv.classList.add('skill');
            if (skill.learned) {
                skillDiv.classList.add('learned');
            }
            skillDiv.innerHTML = `<strong>${skill.name}</strong><br>${skill.description}<br>Cost: ${skill.cost} Stat Points`;
            
            // Add click event to learn the skill
            skillDiv.addEventListener('click', () => {
                if (!skill.learned && characterStats.statPoints >= skill.cost) {
                    // Learn the skill
                    characterStats.statPoints -= skill.cost;
                    skill.learned = true;
                    applySkillEffects(key);
                    updateDisplay();
                    populateSkillTree(); // Refresh the skill tree
                    alert(`You have learned ${skill.name}!`);
                } else if (skill.learned) {
                    alert('Skill already learned.');
                } else {
                    alert('Not enough stat points to learn this skill.');
                }
            });

            // Add CSS classes based on skill availability
            if (!skill.learned && characterStats.statPoints < skill.cost) {
                skillDiv.classList.add('unavailable');
            }

            skillsContainer.appendChild(skillDiv);
        }
    }
}

// Function to learn a skill
function learnSkill(skillKey) {
    const skill = skillTreeData[skillKey];
    if (skill && !skill.learned && characterStats.statPoints >= skill.cost) {
        skill.learned = true;
        characterStats.statPoints -= skill.cost;
        applySkillEffects(skillKey);
        updateSkillTreeUI();
        updateDisplay();
    } else {
        alert('Cannot learn this skill.');
    }
}

// Function to apply skill effects
function applySkillEffects(skillKey) {
    const skill = skillTreeData[skillKey];
    if (skill && skill.effects) {
        Object.keys(skill.effects).forEach(stat => {
            characterStats[stat] += skill.effects[stat];
        });
    }
}
