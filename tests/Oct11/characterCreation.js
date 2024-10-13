// characterCreation.js

// Initialize selected traits
let selectedTraits = [];

// Function to open the trait selection modal
function openTraitSelection() {
    const modal = document.getElementById('traitSelectionModal');
    modal.style.display = 'flex';
    renderTraitOptions();
}

// Function to close the trait selection modal
function closeTraitSelection() {
    const modal = document.getElementById('traitSelectionModal');
    modal.style.display = 'none';
}

// Function to render trait options
function renderTraitOptions() {
    const traitOptionsContainer = document.getElementById('traitOptions');
    traitOptionsContainer.innerHTML = '';

    availableTraits.forEach((trait, index) => {
        const traitDiv = document.createElement('div');
        traitDiv.className = 'trait-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `trait-${index}`;
        checkbox.value = trait.name;
        checkbox.disabled = selectedTraits.length >= 3 && !selectedTraits.includes(trait.name); // Limit to 3 traits

        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                if (selectedTraits.length < 3) {
                    selectedTraits.push(trait.name);
                } else {
                    event.target.checked = false;
                    alert('You can select up to 3 traits.');
                }
            } else {
                selectedTraits = selectedTraits.filter(t => t !== trait.name);
            }
            updateTraitCheckboxes();
        });

        const label = document.createElement('label');
        label.htmlFor = `trait-${index}`;
        label.textContent = `${trait.name}: ${trait.description}`;

        traitDiv.appendChild(checkbox);
        traitDiv.appendChild(label);
        traitOptionsContainer.appendChild(traitDiv);
    });
}

// Function to update trait checkboxes based on selections
function updateTraitCheckboxes() {
    const checkboxes = document.querySelectorAll('#traitOptions input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (selectedTraits.length >= 3 && !selectedTraits.includes(checkbox.value)) {
            checkbox.disabled = true;
        } else {
            checkbox.disabled = false;
        }
    });
}

// Function to confirm trait selection
function confirmTraitSelection() {
    selectedTraits.forEach(traitName => {
        const trait = availableTraits.find(t => t.name === traitName);
        if (trait) {
            applyTraitEffects(trait);
        }
    });
    closeTraitSelection();
    updateDisplay();
}

// Function to apply trait effects to characterStats
function applyTraitEffects(trait) {
    Object.keys(trait.effects).forEach(stat => {
        characterStats[stat] += trait.effects[stat];
    });
}

// Close trait selection when close button is clicked
document.querySelector('.close-trait-selection').addEventListener('click', closeTraitSelection);
