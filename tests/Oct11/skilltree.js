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
            skillDiv.innerHTML = `<strong>${skill.name}</strong><br>${skill.description}<br>Cost: ${skill.cost} XP`;
            
            // Add click event to learn the skill
            skillDiv.addEventListener('click', () => {
                if (!skill.learned && characterStats.experience >= skill.cost * 100) { // Assuming 100 XP per cost unit
                    characterStats.experience -= skill.cost * 100;
                    characterStats[Object.keys(skillTreeData)[Object.keys(skillTreeData).indexOf(key)]] += 5; // Increase the relevant stat
                    skill.learned = true;
                    updateStatsDisplay();
                    populateSkillTree(); // Refresh the skill tree
                    alert(`You have learned ${skill.name}!`);
                } else if (skill.learned) {
                    alert('Skill already learned.');
                } else {
                    alert('Not enough experience to learn this skill.');
                }
            });

            // Add CSS classes based on skill availability
            if (!skill.learned && characterStats.experience < skill.cost * 100) {
                skillDiv.classList.add('unavailable');
            }

            skillsContainer.appendChild(skillDiv);
        }
    }
}