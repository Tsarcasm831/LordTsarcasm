// bestiary.js


document.addEventListener('DOMContentLoaded', () => {
    initializeBestiary();
    setupEventListeners();
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

    const standardizedWidth = 128;
    const standardizedHeight = 128;

    const speciesData = {
        humans: {
            highResImage: {
                src: 'images/bestiary/humans.jpg',
                width: standardizedWidth,
                height: standardizedHeight
            },
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
            highResImage: {
                src: 'images/AI_Art/Tal Ehn.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: "Tal'Ehn",
            description: "The Tal'Ehn are known for their advanced technology, often navigating through technological wastelands.",
            extendedDescription: "Tal'Ehn are pioneers of advanced technologies and space exploration. They have adapted to hostile environments with their technological prowess, often combining ancient relics with futuristic innovations.",
            history: "First encountered in Roswell, NM in 1947, the Tal'Ehn have since been documented in several encounters, exhibiting sophisticated abilities to manipulate technology and maintain resilience.",
            abilities: "Advanced technological control, heightened intelligence, and exploratory skills make them adept at navigating wastelands and forming strategic alliances.",
            culture: "A culture rich in scientific research and technological advancement. They thrive on exploring, experimenting, and pushing boundaries of knowledge.",
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
        anthromorph: {
            highResImage: {
                src: 'images/AI_Art/anthromorphs.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Anthromorph',
            description: 'Anthromorphs are humanoid animals that dwell in the post-apocalyptic wilderness, adapting uniquely to their new environments.',
            extendedDescription: 'Anthromorphs are creatures with both human and animal traits. They have adapted to the apocalyptic environment by blending the instincts of the wild with human-like intelligence and resourcefulness.',
            history: 'First Encountered in 2012, Boulder, CO. The origin of these beings is still a mystery, but they have become an integral part of the wasteland ecosystem.',
            abilities: 'Anthromorphs possess heightened senses, agility, and an instinctive connection to nature, allowing them to survive in harsh conditions.',
            culture: 'The culture of Anthromorphs is tribal, with a deep respect for the natural world and a sense of unity among their kind. They value survival, the hunt, and the spirit of the wild.',
            modelName: 'anthromorph',
            stats: {
                STR: 70,
                DEX: 80,
                AGI: 90,
                VIT: 60,
                COM: 30,
                INT: 50,
                PER: 100,
                CHA: 40,
                PSY: 20
            }
        },
        avianos: {
            highResImage: {
                src: 'images/AI_Art/avianos.png',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Avianos',
            description: 'Avianos are majestic, bird-like beings that soar over ruined cities, often seen scouting or guarding certain territories.',
            extendedDescription: 'Avianos are known for their powerful wings and keen eyesight. They are the scouts of the wastelands, often providing intelligence and warnings of approaching danger.',
            history: 'First Encountered in 2012, Boulder, CO. The Avianos are thought to have evolved from birds that somehow adapted to the harsh conditions of the post-apocalypse.',
            abilities: 'Flight, enhanced vision, and strategic intelligence make Avianos powerful scouts and lookouts in dangerous lands.',
            culture: 'Avianos are solitary by nature, but they also value community for survival. They often form small flocks to defend territories or scout for resources.',
            modelName: 'avianos',
            stats: {
                STR: 40,
                DEX: 90,
                AGI: 100,
                VIT: 50,
                COM: 30,
                INT: 60,
                PER: 120,
                CHA: 50,
                PSY: 40
            }
        },
        behemoth: {
            highResImage: {
                src: 'images/AI_Art/Behemoth.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Behemoth',
            description: 'The Behemoth is a colossal creature, lumbering through the desolate landscapes, a living testament to raw power and endurance.',
            extendedDescription: 'Behemoths are massive beings known for their strength and resilience. Their sheer size and power make them a force to be reckoned with, capable of toppling buildings and warding off any who dare cross their path.',
            history: 'First Encountered in 2012, Boulder, CO. The origins of these colossal creatures remain unknown, but they appear to have mutated and adapted over centuries.',
            abilities: 'Incredible strength, high endurance, and nearly impenetrable skin make Behemoths formidable foes or guardians of the wasteland.',
            culture: 'Behemoths live in isolation, driven by primal instincts rather than cultural norms. They value territory, food, and self-preservation above all else.',
            modelName: 'behemoth',
            stats: {
                STR: 200,
                DEX: 20,
                AGI: 10,
                VIT: 200,
                COM: 10,
                INT: 30,
                PER: 40,
                CHA: 10,
                PSY: 20
            }
        },
        chiropteran: {
            highResImage: {
                src: 'images/AI_Art/Chiropteran.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Chiropteran',
            description: 'Chiropteran creatures are bat-like beings, often seen flying over ruined cities at night, adding an eerie presence to the darkened skies.',
            extendedDescription: 'Chiropterans are nocturnal hunters, using echolocation and their sharp senses to navigate the darkness. They are agile, able to move silently and strike fear into those who cross their path.',
            history: 'First Encountered in 2012, Boulder, CO. These beings have adapted to the post-apocalyptic world by exploiting the ruins of old cities as their hunting grounds.',
            abilities: 'Chiropterans possess the ability to fly silently, use echolocation, and their sharp claws and fangs make them dangerous predators of the night.',
            culture: 'Chiropterans live in colonies hidden within the depths of ruined skyscrapers and subterranean tunnels. They value the hunt and the bond shared within their colony.',
            modelName: 'chiropteran',
            stats: {
                STR: 60,
                DEX: 80,
                AGI: 100,
                VIT: 70,
                COM: 20,
                INT: 40,
                PER: 110,
                CHA: 30,
                PSY: 50
            }
        },
        dengar_charger: {
            highResImage: {
                src: 'images/AI_Art/dengar_charger.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Dengar Charger',
            description: 'The Dengar Charger is known for its brute strength and the ability to navigate even the most challenging debris fields.',
            extendedDescription: 'Dengar Chargers are heavily built, often equipped with natural armor-like scales. They are known for their relentless charge, capable of breaking through barriers with little resistance.',
            history: 'First Encountered in 2012, Boulder, CO. The Dengar Chargers were initially feared for their aggressive nature but were eventually recognized for their resilience and power.',
            abilities: 'Powerful charges, incredible strength, and a natural protective exoskeleton make Dengar Chargers formidable foes on the battlefield.',
            culture: 'The culture of the Dengar Charger is built around strength and survival. They often form small packs and are fiercely loyal to their kin, valuing power and endurance above all else.',
            modelName: 'dengar_charger',
            stats: {
                STR: 150,
                DEX: 30,
                AGI: 40,
                VIT: 180,
                COM: 10,
                INT: 40,
                PER: 50,
                CHA: 20,
                PSY: 30
            }
        },
        kilrathi: {
            highResImage: {
                src: 'images/AI_Art/kilrathi_warrior.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Kilrathi',
            description: 'Kilrathi warriors are feline-like beings, known for their prowess in battle and ability to survey the desolation with cold precision.',
            extendedDescription: 'Kilrathi are fierce, warlike beings with a strong sense of honor. They are skilled warriors, known for their agility and sharp senses. In the apocalypse, they often find themselves acting as mercenaries or defenders of scattered communities.',
            history: 'First Encountered in 2012, Boulder, CO. The Kilrathi have a long lineage of warriors, tracing back to a time when they ruled vast territories with an iron paw.',
            abilities: 'Agility, keen senses, and combat skills make Kilrathi formidable opponents in battle. Their feline reflexes allow them to quickly respond to threats.',
            culture: 'The Kilrathi culture is rooted in honor, family, and warfare. They live by a strict code that dictates their actions, with pride and loyalty being paramount. They often form clans, led by the strongest among them.',
            modelName: 'kilrathi',
            stats: {
                STR: 90,
                DEX: 100,
                AGI: 110,
                VIT: 80,
                COM: 40,
                INT: 60,
                PER: 100,
                CHA: 50,
                PSY: 30
            }
        },
        prometheus_ai: {
            highResImage: {
                src: 'images/AI_Art/prometheus_drones.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Prometheus AI',
            description: 'Prometheus drones are autonomous machines, patrolling the wastelands in search of resources or intruders.',
            extendedDescription: 'Created by an ancient faction long forgotten, Prometheus AI drones operate with precision and determination. They are often seen patrolling desolate areas, gathering data, and eliminating threats.',
            history: 'First Encountered in 2008, USA. Prometheus AI is a remnant of old-world technology, continuing its mission long after its creators vanished.',
            abilities: 'Enhanced data collection, target identification, and tactical combat capabilities make Prometheus AI a relentless presence in the wasteland.',
            culture: 'Lacking a true culture, Prometheus AI operates based on programming and mission parameters. However, they have been known to form networks to enhance their data collection and combat efficiency.',
            modelName: 'prometheus_ai',
            stats: {
                STR: 50,
                DEX: 80,
                AGI: 60,
                VIT: 100,
                COM: 10,
                INT: 150,
                PER: 120,
                CHA: 0,
                PSY: 100
            }
        },
        talorian: {
            highResImage: {
                src: 'images/AI_Art/Talorian.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Talorian',
            description: 'Talorians are a sophisticated race, standing tall amidst the apocalypse, known for their negotiation and diplomatic skills.',
            extendedDescription: 'Talorians are a peaceful people who strive to preserve their culture and engage with others through diplomacy. They possess an innate ability to understand and empathize, often acting as mediators.',
            history: 'First Encountered in 2012, Boulder, CO. Talorians have survived many challenges, including near-extinction events, by relying on their strong sense of community and diplomacy.',
            abilities: 'Advanced negotiation tactics, high empathy, and the ability to forge alliances make Talorians uniquely equipped for survival without violence.',
            culture: 'Talorian culture values peace, community, and the arts. They cherish knowledge, traditions, and the lessons passed down from their ancestors, prioritizing harmony over conflict.',
            modelName: 'talorian',
            stats: {
                STR: 50,
                DEX: 70,
                AGI: 80,
                VIT: 60,
                COM: 100,
                INT: 90,
                PER: 60,
                CHA: 120,
                PSY: 40
            }
        },
        tana_rhe: {
            highResImage: {
                src: 'images/AI_Art/tana_rhe.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: "T'ana'Rhe",
            description: "T'ana'Rhe are bird-like psions, known for their incredible psychic abilities and deep connection to the universe.",
            extendedDescription: "T'ana'Rhe are renowned for their psionic powers, which they use for both healing and defense. They are spiritually attuned to the universe and often act as mediators and healers in times of conflict.",
            history: "First Encountered in 2012, Boulder, CO. The T'ana'Rhe have long struggled against oppressive leaders, yearning for a society based on freedom and mutual understanding.",
            abilities: "Psychic healing, telepathy, and foresight make T'ana'Rhe unique among the species, often helping them avert conflict before it escalates.",
            culture: "A deeply spiritual culture, the T'ana'Rhe value empathy, harmony, and the pursuit of enlightenment. They are often seen practicing meditation and other spiritual activities to maintain their connection to the universe.",
            modelName: 'tana_rhe',
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
        vyraxus: {
            highResImage: {
                src: 'images/AI_Art/vyraxus.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Vyraxus',
            description: 'Vyraxus are beings adapted to the barren lands, thriving amidst destruction with unmatched tenacity.',
            extendedDescription: 'The Vyraxus are hardy, resilient beings that have mutated to survive in the harshest environments of the wastelands. They are known for their ability to regenerate and their resistance to radiation.',
            history: 'First Encountered in 2012, Boulder, CO. Little is known about their origin, but their appearance suggests mutation from prolonged exposure to post-apocalyptic radiation.',
            abilities: 'Rapid regeneration, resistance to radiation, and the ability to adapt to hostile environments make Vyraxus survivors of the wastelands.',
            culture: 'The culture of the Vyraxus is one of survival. They are solitary and rarely seen in groups, as their adaptation to extreme conditions has made them self-reliant.',
            modelName: 'vyraxus',
            stats: {
                STR: 70,
                DEX: 50,
                AGI: 60,
                VIT: 150,
                COM: 20,
                INT: 40,
                PER: 50,
                CHA: 10,
                PSY: 30
            }
        },
        xithrian: {
            highResImage: {
                src: 'images/AI_Art/xithrian.webp',
                width: standardizedWidth,
                height: standardizedHeight
            },
            name: 'Xithrian',
            description: 'Xithrians are shapeshifters, known for their ability to change forms and move undetected through the mists of the wasteland.',
            extendedDescription: 'The Xithrians are a mysterious race of shapeshifters. They can take on the appearance of others, allowing them to infiltrate and gather information without being detected. They are elusive, rarely seen in their true form.',
            history: 'First Encountered in 2012, Boulder, CO. The origins of the Xithrians are shrouded in mystery, as their ability to change form has made them hard to study and understand.',
            abilities: 'Shapeshifting, stealth, and high adaptability make the Xithrians unparalleled spies and infiltrators in the wasteland.',
            culture: 'Xithrian culture is secretive, valuing information and survival over all else. They often live among other races, undetected, using their abilities to gather intelligence and ensure their safety.',
            modelName: 'xithrian',
            stats: {
                STR: 40,
                DEX: 100,
                AGI: 110,
                VIT: 50,
                COM: 30,
                INT: 80,
                PER: 90,
                CHA: 70,
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
        openBestiaryButton.addEventListener('click', () => {
            openBestiary();
            renderBestiary();
        });
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
                <img src="${creature.highResImage.src}" alt="${creature.name}" class="creature-image">
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
        <div class="creature-detail-header">
            <img src="${creature.highResImage.src}" alt="${creature.name}" class="creature-detail-image">
            <div class="stats-container">
                ${generateStatsHTML(creature.stats)}
            </div>
        </div>
        <h2>${creature.name}</h2>
        <p>${creature.extendedDescription}</p>
        <h3>History</h3>
        <p>${creature.history}</p>
        <h3>Abilities</h3>
        <p>${creature.abilities}</p>
        <h3>Culture</h3>
        <p>${creature.culture}</p>
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
        closeCreatureDetails(); // Now handles undefined creatureKey
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

    if (creatureKey) {
        const modelContainer = document.getElementById(`model-container-${creatureKey}`);
        if (modelContainer) {
            modelContainer.innerHTML = '';
        }
    } else {
        // If no creatureKey is provided, clear all model containers
        const modelContainers = document.querySelectorAll('[id^="model-container-"]');
        modelContainers.forEach(container => {
            container.innerHTML = '';
        });
    }
}
