// avianosModel.js

/**
 * Creates a simplified version of the Avianos model for the bestiary view
 */
function createBestiaryAvianos() {
    const color = 0x4169E1; // Royal blue base color

    // Create base body
    const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        emissive: new THREE.Color(0x1E90FF),
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Create wings
    function createWing(isLeft) {
        const wingGroup = new THREE.Group();

        // Main wing shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(3, 2, 6, 0);
        shape.quadraticCurveTo(3, -1.8, 0, 0);

        const geometry = new THREE.ShapeGeometry(shape, 32);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
            shininess: 100,
            emissive: new THREE.Color(0x1E90FF),
            emissiveIntensity: 0.3
        });

        const wing = new THREE.Mesh(geometry, material);
        wing.scale.set(0.3, 0.3, 0.3);
        wing.position.set(isLeft ? -0.8 : 0.8, 0.5, 0);
        wing.rotation.z = isLeft ? Math.PI / 6 : -Math.PI / 6;

        // Add feather details
        const featherCount = 8;
        for (let i = 0; i < featherCount; i++) {
            const feather = new THREE.Mesh(geometry, material);
            feather.scale.set(0.15, 0.15, 0.15);
            feather.position.set(
                (isLeft ? -1 : 1) * (0.1 * i),
                0.1 * i,
                0.05 * i
            );
            feather.rotation.z = (isLeft ? 1 : -1) * Math.PI * 0.1;
            wingGroup.add(feather);
        }

        wingGroup.add(wing);
        return wingGroup;
    }

    // Add wings
    const leftWing = createWing(true);
    const rightWing = createWing(false);

    // Create head
    const headGeometry = new THREE.SphereGeometry(0.4, 24, 24);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.2, 0);

    // Create beak
    const beakGeometry = new THREE.ConeGeometry(0.1, 0.4, 4);
    const beakMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFA500,
        shininess: 100
    });
    const beak = new THREE.Mesh(beakGeometry, beakMaterial);
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, 1.2, 0.4);

    // Create group and add all parts
    const avianos = new THREE.Group();
    avianos.add(body, leftWing, rightWing, head, beak);
    
    // Add animation
    avianos.wingAnimation = function(time) {
        leftWing.rotation.y = Math.sin(time * 2) * 0.2;
        rightWing.rotation.y = -Math.sin(time * 2) * 0.2;
    };

    return avianos;
}

/**
 * Initializes and renders the Avianos 3D model for the bestiary
 * @param {string} containerId - The ID of the container where the model will be rendered
 */
function initializeAvianosModel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 5;
    camera.position.y = 1;

    // Create and add Avianos model
    const avianos = createBestiaryAvianos();
    scene.add(avianos);

    // Animation
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;
        
        avianos.rotation.y += 0.005;
        avianos.wingAnimation(time);
        
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}
