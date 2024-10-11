// bestiary.js


document.addEventListener('DOMContentLoaded', () => {
    initializeBestiary();
    setupEventListeners();
    initializeBestiaryUI();
});

function initializeBestiaryUI() {
    // Add this to ensure rendering when opened
    document.getElementById('openBestiary').addEventListener('click', () => {
        openBestiary();
        renderBestiary();
    });
}

/**
 * Initializes the bestiary by loading all species data.
 */
function initializeBestiary() {
    window.bestiary = {}; // Initialize the bestiary object

    const speciesData = {
        humans: {
            highResImage: 'images/high-res/humans.jpg',
            name: 'Humans',
            description: 'Humans, once masters of a thriving world, now traverse the remnants, their spirits unbroken. Their resilience and adaptability have become legendary.',
            extendedDescription: 'In the aftermath of cataclysmic events that shattered their civilization, humans have learned to adapt to the harshest of environments. They harness remnants of old technology and combine it with newfound survival techniques. Their cities lie in ruins, but from the ashes, they build shelters, forge alliances, and continue to dream of a better future. The human spirit is unyielding, and their creativity knows no bounds as they navigate the challenges of a changed world.',
            history: 'Once the dominant species on Earth, humans thrived with advanced technology and sprawling civilizations. However, a series of cataclysmic events, possibly self-inflicted, brought about the downfall of their societies. Now, they live in smaller communities, scavenging the remnants of their past while striving to rebuild. Tales are told of the old world, serving both as a warning and a beacon of hope for future generations.',
            abilities: 'Humans possess remarkable adaptability, able to adjust to new environments and situations swiftly. Their resilience is legendary, enabling them to endure hardships that would break other species. Technological ingenuity allows them to repurpose old technologies and innovate solutions with limited resources. They are also known for their diplomatic abilities, often acting as mediators between other races.',
            culture: 'Human culture is a rich tapestry woven from countless traditions, languages, and beliefs. In the post-apocalyptic world, they have developed a culture centered around community, survival, and storytelling. Music, art, and literature have become means of preserving their history and inspiring hope. Despite their fragmented state, humans place great value on cooperation and learning from the mistakes of the past.',
            modelName: 'humans',
            stats: {
                STR: 80,
                DEX: 50,
                AGI: 60,
                VIT: 70,
                COM: 40,
                INT: 65,
                PER: 55,
                CHA: 70,
                PSY: 30
            }
        },
        tal_ehn: {
            highResImage: 'images/high-res/tal_ehn.jpg',
            name: "Tal'ehn",
            description: "The Tal'ehn are a small species known for their advanced technology and space travel, constantly seeking knowledge beyond the stars.",
            extendedDescription: "Tal'ehn are pioneers in interstellar navigation, adapting their technologies to explore beyond their home worlds. Their thirst for knowledge is unquenchable, and they have been known to engage in exploratory missions to distant galaxies, always seeking to understand the universe around them.",
            history: "An ancient race that has seen the rise and fall of many civilizations, the Tal'ehn have preserved their heritage through wisdom and innovation. Their history is marred by conflicts with less enlightened species, but they continue to strive for peace and understanding.",
            abilities: "Technological prowess, curiosity, and exploration skills make them formidable in both diplomacy and combat. They are able to quickly adapt to new environments and challenges.",
            culture: "A culture based on knowledge and scientific advancement, the Tal'ehn value education, research, and collaboration. They are often seen as guardians of knowledge, holding their archives sacred.",
            modelName: 'tal_ehn',
            stats: {
                STR: 40,
                DEX: 60,
                AGI: 50,
                VIT: 70,
                COM: 20,
                INT: 150,
                PER: 80,
                CHA: 70,
                PSY: 200
            }
        },
        shal_rah_prime: {
            highResImage: 'images/high-res/shal_rah_prime.jpg',
            name: "Shal'Rah Prime",
            description: "The Shal'Rah Prime are a hostile insectoid race known for their aggressive conquests of other worlds. Beware their cunning!",
            extendedDescription: "Cunning and ruthless, they dominate through fear and overwhelming tactics, seeking to expand their territories at all costs. Their hives are a manifestation of their hierarchical society, where strength reigns supreme.",
            history: "Evolved on a harsh world that shaped their existence, the Shal'Rah Prime have fought fiercely against all rivals, consolidating power and spreading their influence to numerous colonies.",
            abilities: "Strength, swiftness, and overwhelming numbers make them a dangerous foe on the battlefield.",
            culture: "Built on a foundation of hierarchy and conquest, their culture revolves around loyalty to the hive and the queen, with every individual existing to serve the greater whole.",
            modelName: 'shal_rah_prime',
            stats: {
                STR: 100,
                DEX: 40,
                AGI: 30,
                VIT: 90,
                COM: 60,
                INT: 80,
                PER: 70,
                CHA: 50,
                PSY: 100
            }
        },
        shal_rah_talorian: {
            highResImage: 'images/high-res/shal_rah_talorian.jpg',
            name: "Shal'Rah Talorian",
            description: "The Talorians excel in diplomacy, struggling against the encroaching invasions and fighting to maintain their culture.",
            extendedDescription: "A sophisticated people who value peace and mutual respect, Talorians engage in complex negotiations to secure their future against overwhelming odds. They are known for their artistry and traditions that reflect their rich history.",
            history: "Once a prosperous civilization now on the brink of war, the Talorians have weathered many storms but remain steadfast in their beliefs, cherishing the lessons of the past.",
            abilities: "Diplomatic skill and advanced negotiation tactics make them unique, often able to avert conflicts and find peaceful resolutions.",
            culture: "Rich traditions with great respect for nature and the arts define their society. They prioritize harmony and balance, drawing strength from their communities.",
            modelName: 'shal_rah_talorian',
            stats: {
                STR: 50,
                DEX: 70,
                AGI: 80,
                VIT: 60,
                COM: 100,
                INT: 50,
                PER: 60,
                CHA: 80,
                PSY: 30
            }
        },
        shal_rah_t_ana_rhe: {
            highResImage: 'images/high-res/shal_rah_t_ana_rhe.jpg',
            name: "Shal'Rah T'ana'Rhe",
            description: "The T'ana'Rhe are bird-like psions known for their healing abilities and facing oppression by their own leaders.",
            extendedDescription: "They are known for their powerful psionic abilities, which they harness for both healing and protection, often acting as mediators among species. Despite their talents, they strive for freedom from their oppressive rulers.",
            history: "An ancient race constantly fighting for their freedom, their history is littered with struggles against authoritarianism and the quest for peace.",
            abilities: "Healing, telepathy, and foresight are their main abilities as they navigate the complex socio-political landscape of their world.",
            culture: "A deeply spiritual culture connected to the universe, they value empathy and harmony, often seeking a greater understanding with all beings.",
            modelName: 'shal_rah_t_ana_rhe',
            stats: {
                STR: 20,
                DEX: 30,
                AGI: 50,
                VIT: 70,
                COM: 40,
                INT: 90,
                PER: 100,
                CHA: 70,
                PSY: 150
            }
        },
        shal_rah_dengar: {
            highResImage: 'images/high-res/shal_rah_dengar.jpg',
            name: "Shal'Rah Dengar",
            description: "The Dengar chose to ally with the Shal'Rah, proficient in brute strength and combat tactics throughout the galaxy.",
            extendedDescription: "Fierce warriors, they value strength and training above all else, often becoming the backbone of military campaigns in support of the Shal'Rah.",
            history: "Former rivals to the Shal'Rah, now steadfast allies, they have united for greater power against common threats.",
            abilities: "Combat skills, resilience, and tactical prowess offer them a prominent role in both strategy and action.",
            culture: "Honor and strength define their ways, with a deep-rooted respect for warriors and their legacies.",
            modelName: 'shal_rah_dengar',
            stats: {
                STR: 90,
                DEX: 60,
                AGI: 40,
                VIT: 100,
                COM: 30,
                INT: 30,
                PER: 50,
                CHA: 20,
                PSY: 40
            }
        },
        custom: {
            highResImage: 'images/high-res/custom.jpg',
            name: 'Custom',
            description: 'Create a unique race with tailored abilities to suit your individual play style. The possibilities are endless!',
            extendedDescription: 'The creation is limited only by imagination and resourcefulness, allowing players a vast array of options.',
            history: "Each custom race holds a unique story, reflecting the creator's vision of strengths and culture.",
            abilities: "Varying abilities based on the creator's choice, they encompass a wide range of gameplay experiences.",
            culture: "A culture shaped by individual creativity ensures that each creation is as unique as its maker.",
            modelName: 'custom',
            stats: {
                STR: 60,
                DEX: 60,
                AGI: 60,
                VIT: 60,
                COM: 60,
                INT: 60,
                PER: 60,
                CHA: 60,
                PSY: 60
            }
        }
    };

    window.bestiary = speciesData;
}

/**
 * Sets up event listeners for bestiary interactions.
 */
function setupEventListeners() {
    const openBestiaryButton = document.getElementById('openBestiary');
    const closeBestiaryButton = document.getElementById('closeBestiary');
    const bestiaryModal = document.getElementById('bestiaryModal');

    if (openBestiaryButton) {
        openBestiaryButton.addEventListener('click', openBestiary);
    }

    if (closeBestiaryButton) {
        closeBestiaryButton.addEventListener('click', closeBestiary);
    }

    window.addEventListener('click', (event) => {
        if (event.target === bestiaryModal) {
            closeBestiary();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'y' || e.key === 'Y') {
            openBestiary();
        }
        if (e.key === 'Escape' && bestiaryModal.classList.contains('show')) {
            closeBestiary();
        }
    });
}

/**
 * Renders the bestiary content by listing all races.
 */
function renderBestiary() {
    console.log('renderBestiary() called');
    const bestiaryDiv = document.getElementById('bestiaryContent');
    bestiaryDiv.innerHTML = ''; // Clear existing content

    for (const key in window.bestiary) {
        if (window.bestiary.hasOwnProperty(key)) {
            const creature = window.bestiary[key];
            const creatureCard = document.createElement('div');
            creatureCard.classList.add('creature-card');

            creatureCard.innerHTML = `
                <img src="${creature.highResImage}" alt="${creature.name}" class="creature-image">
                <div class="creature-info">
                    <h3>${creature.name}</h3>
                    <p>${creature.description}</p>
                    <button class="view-details-button" data-creature="${key}">View Details</button>
                </div>
            `;

            bestiaryDiv.appendChild(creatureCard);
        }
    }

    // Add event listeners to view details buttons
    const viewDetailsButtons = document.querySelectorAll('.view-details-button');
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const creatureKey = button.getAttribute('data-creature');
            displayRaceDetails(creatureKey);
        });
    });
}

/**
 * Displays detailed information about a selected race in a modal.
 * @param {string} creatureKey - The key of the creature in the bestiary data.
 */
function displayRaceDetails(creatureKey) {
    const creature = window.bestiary[creatureKey];
    if (!creature) return;

    const detailsModal = document.getElementById('creatureDetailsModal');
    const detailsContent = document.getElementById('creatureDetailsContent');

    detailsContent.innerHTML = `
        <img src="${creature.highResImage}" alt="${creature.name}" class="creature-detail-image">
        <h2>${creature.name}</h2>
        <p>${creature.extendedDescription}</p>
        <h3>History</h3>
        <p>${creature.history}</p>
        <h3>Abilities</h3>
        <p>${creature.abilities}</p>
        <h3>Culture</h3>
        <p>${creature.culture}</p>
        <h3>Stats</h3>
        <div class="stats-container">
            ${generateStatsHTML(creature.stats)}
        </div>
        <div id="model-container-${creatureKey}" class="model-container"></div>
    `;

    detailsModal.classList.add('show');
    detailsModal.setAttribute('aria-hidden', 'false');

    // Close Race Details Modal
    const closeDetailsButton = detailsModal.querySelector('.close-details');
    closeDetailsButton.addEventListener('click', () => {
        closeCreatureDetails(creatureKey);
    });

    // Close when clicking outside the modal content
    detailsModal.addEventListener('click', (event) => {
        if (event.target === detailsModal) {
            closeCreatureDetails(creatureKey);
        }
    });

    // Load 3D model
    loadCreatureModel(creature.modelName, `model-container-${creatureKey}`);
}

/**
 * Generates HTML for the stats section.
 * @param {object} stats - The stats object containing various stat values.
 * @returns {string} - The generated HTML string for stats.
 */
function generateStatsHTML(stats) {
    let statsHTML = '';
    for (const stat in stats) {
        if (stats.hasOwnProperty(stat)) {
            const value = stats[stat];
            const percentage = Math.min((value / 150) * 100, 100); // Assuming 150 is the max stat value
            statsHTML += `
                <div class="stat-item">
                    <span>${stat}:</span>
                    <div class="stat-bar">
                        <div class="progress" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        }
    }
    return statsHTML;
}

/**
 * Loads a 3D model using Three.js and GLTFLoader.
 * @param {string} modelName - The name of the model file (without extension).
 * @param {string} containerId - The ID of the container where the model will be rendered.
 */
function loadCreatureModel(modelName, containerId) {
    const modelPath = `models/${modelName}.glb`;
    const container = document.getElementById(containerId);

    if (!container) return;

    // Initialize Three.js Scene
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // GLTFLoader to load the model
    const loader = new THREE.GLTFLoader();
    loader.load(
        modelPath,
        function (gltf) {
            scene.add(gltf.scene);
            animate();
        },
        undefined,
        function (error) {
            console.error('An error occurred while loading the model:', error);
        }
    );

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}

/**
 * Populates and opens the bestiary modal.
 */
function openBestiary() {
    console.log('openBestiary() called');
    const bestiaryModal = document.getElementById('bestiaryModal');
    populateBestiaryModal();
    bestiaryModal.classList.add('show');
    bestiaryModal.setAttribute('aria-hidden', 'false');
}

/**
 * Closes the bestiary modal.
 */
function closeBestiary() {
    const bestiaryModal = document.getElementById('bestiaryModal');
    bestiaryModal.classList.remove('show');
    bestiaryModal.setAttribute('aria-hidden', 'true');

    // Also close creature details if open
    const detailsModal = document.getElementById('creatureDetailsModal');
    if (detailsModal.classList.contains('show')) {
        closeCreatureDetails();
    }
}


/**
 * Populates the bestiary modal with all races.
 */
function populateBestiaryModal() {
    renderBestiary();
}

/**
 * Closes the creature details modal.
 * @param {string} creatureKey - The key of the creature to close details for.
 */
function closeCreatureDetails(creatureKey) {
    const detailsModal = document.getElementById('creatureDetailsModal');
    detailsModal.classList.remove('show');
    detailsModal.setAttribute('aria-hidden', 'true');

    // Optionally, remove the 3D model to free up resources
    const modelContainer = document.getElementById(`model-container-${creatureKey}`);
    if (modelContainer) {
        modelContainer.innerHTML = '';
    }
}