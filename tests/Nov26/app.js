class AdvancedPokedex {
    constructor() {
        // API and DOM References
        this.baseUrl = 'https://pokeapi.co/api/v2/pokemon/';
        this.speciesUrl = 'https://pokeapi.co/api/v2/pokemon-species/';
        
        // DOM Elements
        this.elements = {
            searchInput: document.getElementById('pokemon-search'),
            searchBtn: document.getElementById('search-btn'),
            randomBtn: document.getElementById('random-btn'),
            modelContainer: document.getElementById('3d-model-container'),
            pokemonName: document.getElementById('pokemon-name'),
            pokemonSprite: document.getElementById('pokemon-sprite'),
            pokemonType: document.getElementById('pokemon-type'),
            pokemonHeight: document.getElementById('pokemon-height'),
            pokemonWeight: document.getElementById('pokemon-weight'),
            cryBtn: document.getElementById('cry-btn'),
            infoBtn: document.getElementById('info-btn'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modal-title'),
            modalInfo: document.getElementById('modal-info'),
            closeModal: document.querySelector('.close-btn')
        };

        // Stat Elements
        this.statElements = {
            hp: { bar: document.getElementById('hp-bar'), value: document.getElementById('hp-value') },
            attack: { bar: document.getElementById('attack-bar'), value: document.getElementById('attack-value') },
            defense: { bar: document.getElementById('defense-bar'), value: document.getElementById('defense-value') },
            specialAttack: { bar: document.getElementById('sp-attack-bar'), value: document.getElementById('sp-attack-value') },
            specialDefense: { bar: document.getElementById('sp-defense-bar'), value: document.getElementById('sp-defense-value') },
            speed: { bar: document.getElementById('speed-bar'), value: document.getElementById('speed-value') }
        };

        // Three.js Scene Setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pokemonModel = null;

        // Sound Setup
        this.audioContext = null;
        this.currentPokemon = null;

        this.initEventListeners();
        this.initThreeScene();
        this.initAudio();
        this.loadDefaultPokemon();
    }

    initEventListeners() {
        this.elements.searchBtn.addEventListener('click', () => this.searchPokemon());
        this.elements.randomBtn.addEventListener('click', () => this.getRandomPokemon());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPokemon();
        });
        this.elements.cryBtn.addEventListener('click', () => this.playPokemonCry());
        this.elements.infoBtn.addEventListener('click', () => this.showMoreInfo());
        this.elements.closeModal.addEventListener('click', () => this.closeModal());
    }

    initThreeScene() {
        console.log('Initializing Three.js Scene');
        
        // Ensure Three.js and dependencies are loaded
        if (typeof THREE === 'undefined') {
            console.error('Three.js is not loaded!');
            this.elements.modelContainer.innerHTML = 'Three.js library failed to load';
            return;
        }

        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.elements.modelContainer.clientWidth / this.elements.modelContainer.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;

        // Renderer
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(
                this.elements.modelContainer.clientWidth, 
                this.elements.modelContainer.clientHeight
            );
            
            // Clear any existing content and append renderer
            this.elements.modelContainer.innerHTML = '';
            this.elements.modelContainer.appendChild(this.renderer.domElement);

            console.log('Renderer created and appended');
        } catch (error) {
            console.error('Error creating renderer:', error);
            this.elements.modelContainer.innerHTML = 'Failed to create 3D renderer';
            return;
        }

        // Orbit Controls
        try {
            if (typeof THREE.OrbitControls === 'undefined') {
                console.error('OrbitControls is not loaded!');
                throw new Error('OrbitControls not found');
            }
            
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.25;
        } catch (error) {
            console.error('Error creating OrbitControls:', error);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Animation loop
        this.animate();
    }

    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            
            if (this.controls) {
                this.controls.update();
            }

            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error('Animation loop error:', error);
        }
    }

    async searchPokemon(query = null) {
        try {
            // Determine search term
            const searchTerm = query || this.elements.searchInput.value.toLowerCase().trim();
            if (!searchTerm) {
                this.getRandomPokemon();
                return;
            }

            // Fetch Pokemon data
            const response = await fetch(`${this.baseUrl}${searchTerm}`);
            if (!response.ok) {
                throw new Error('Pokemon not found');
            }

            const pokemon = await response.json();
            this.currentPokemon = pokemon;

            // Update UI
            this.updatePokemonInfo(pokemon);
            this.loadPokemonModel(pokemon.name);
            this.fetchAdditionalDetails(pokemon.id);
        } catch (error) {
            console.error('Error fetching Pokemon:', error);
            // Clear previous pokemon info
            this.clearPokemonInfo();
            this.elements.pokemonName.textContent = 'Pokemon Not Found';
        }
    }

    clearPokemonInfo() {
        // Reset all UI elements
        this.elements.pokemonSprite.src = '';
        this.elements.pokemonType.textContent = '-';
        this.elements.pokemonHeight.textContent = '-';
        this.elements.pokemonWeight.textContent = '-';

        // Reset stat bars and values
        Object.values(this.statElements).forEach(stat => {
            stat.bar.style.width = '0%';
            stat.value.textContent = '0';
        });
    }

    async getRandomPokemon() {
        const randomId = Math.floor(Math.random() * 898) + 1; // Up to Gen 8
        await this.searchPokemon(randomId);
    }

    updatePokemonInfo(pokemon) {
        // Update basic info
        this.elements.pokemonName.textContent = pokemon.name;
        this.elements.pokemonSprite.src = pokemon.sprites.front_default;
        
        // Update type and physical attributes
        this.elements.pokemonType.textContent = `Type: ${pokemon.types.map(t => t.type.name).join(', ')}`;
        this.elements.pokemonHeight.textContent = `Height: ${pokemon.height / 10}m`;
        this.elements.pokemonWeight.textContent = `Weight: ${pokemon.weight / 10}kg`;

        // Update stats with animated bars
        const stats = pokemon.stats;
        const statMap = {
            'hp': stats.find(s => s.stat.name === 'hp').base_stat,
            'attack': stats.find(s => s.stat.name === 'attack').base_stat,
            'defense': stats.find(s => s.stat.name === 'defense').base_stat,
            'specialAttack': stats.find(s => s.stat.name === 'special-attack').base_stat,
            'specialDefense': stats.find(s => s.stat.name === 'special-defense').base_stat,
            'speed': stats.find(s => s.stat.name === 'speed').base_stat
        };

        // Animate stat bars
        Object.keys(statMap).forEach(statKey => {
            const value = statMap[statKey];
            const percentage = Math.min((value / 255) * 100, 100);
            
            this.statElements[statKey].bar.style.width = `${percentage}%`;
            this.statElements[statKey].value.textContent = value;
        });
    }

    async fetchAdditionalDetails(pokemonId) {
        try {
            // Fetch species information
            const speciesResponse = await fetch(`${this.speciesUrl}${pokemonId}`);
            const speciesData = await speciesResponse.json();

            // Find English flavor text
            const flavorText = speciesData.flavor_text_entries
                .find(entry => entry.language.name === 'en')
                ?.flavor_text.replace(/\f/g, ' ') || 'No description available.';

            // Store for potential modal use
            this.currentPokemonSpecies = {
                description: flavorText,
                habitat: speciesData.habitat?.name || 'Unknown',
                generation: speciesData.generation.name
            };
        } catch (error) {
            console.error('Error fetching additional details:', error);
        }
    }

    async loadPokemonModel(pokemonName) {
        // Clear previous model
        if (this.pokemonModel) {
            this.scene.remove(this.pokemonModel);
            this.pokemonModel = null;
        }

        // Lighting for better 3D rendering
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(ambientLight, directionalLight);

        // Orbit controls
        if (this.controls) {
            this.controls.dispose();
        }
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;

        // Model loading
        const loader = new THREE.GLTFLoader();
        const modelPath = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/pokemon-3d-models/${this.getPokemonId(pokemonName)}.glb`;

        try {
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    modelPath,
                    (gltfModel) => resolve(gltfModel),
                    null, // Progress callback
                    (error) => reject(error)
                );
            });

            this.pokemonModel = gltf.scene;
            this.pokemonModel.scale.set(2, 2, 2); // Adjust scale if needed
            this.pokemonModel.position.set(0, 0, 0);
            this.scene.add(this.pokemonModel);

            // Animate render loop
            const animate = () => {
                requestAnimationFrame(animate);
                this.controls.update();
                this.renderer.render(this.scene, this.camera);
            };
            animate();

            console.log(`3D Model loaded for ${pokemonName}`);
        } catch (error) {
            console.error(`Failed to load 3D model for ${pokemonName}:`, error);
            this.elements.modelContainer.innerHTML = `
                <div class="model-error">
                    <p>Could not load 3D model for ${pokemonName}</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    }

    getPokemonId(pokemonName) {
        // Convert pokemon name to lowercase and get numeric ID
        const pokemonIds = {
            'pikachu': 25,
            'charizard': 6,
            'bulbasaur': 1,
            // Add more mappings as needed
        };
        return pokemonIds[pokemonName.toLowerCase()] || 25; // Default to Pikachu
    }

    async playPokemonCry() {
        if (!this.currentPokemon) return;

        try {
            // Fetch cry audio
            const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${this.currentPokemon.name.toLowerCase()}.mp3`;
            
            // Create audio element
            const audio = new Audio(cryUrl);
            audio.play().catch(error => {
                console.error('Error playing Pokemon cry:', error);
                alert('Could not play Pokemon cry');
            });
        } catch (error) {
            console.error('Error fetching Pokemon cry:', error);
            alert('Could not fetch Pokemon cry');
        }
    }

    showMoreInfo() {
        if (!this.currentPokemonSpecies) {
            alert('No additional information available');
            return;
        }

        const { description, habitat, generation } = this.currentPokemonSpecies;
        const moves = this.currentPokemon.moves.slice(0, 4).map(move => 
            move.move.name.replace(/-/g, ' ')
        ).join(', ');

        const modalContent = `
            <h2>${this.currentPokemon.name.toUpperCase()} Details</h2>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Habitat:</strong> ${habitat}</p>
            <p><strong>Generation:</strong> ${generation}</p>
            <p><strong>Notable Moves:</strong> ${moves}</p>
        `;

        this.elements.modalTitle.textContent = 'Pokemon Details';
        this.elements.modalInfo.innerHTML = modalContent;
        this.elements.modal.style.display = 'flex';
    }

    closeModal() {
        this.elements.modal.style.display = 'none';
    }

    initAudio() {
        // Initialize Web Audio API for potential advanced audio features
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    async loadDefaultPokemon() {
        try {
            await this.searchPokemon('pikachu');
        } catch (error) {
            console.error('Failed to load default Pokemon:', error);
        }
    }
}

// Initialize the Pokédex when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const pokedex = new AdvancedPokedex();
});
