// terrainCollision.js

function addTerrainCollisions() {
    const collidableTerrainObjects = [];

    function addPlantsToTerrain() {
        const numElements = 3000; // Total number of natural elements

        const elementTypes = [
            // Tree
            {
                geometry: new THREE.ConeGeometry(20, 200, 20),
                material: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
                yOffset: 100, // Adjusted for height
            },
            // Small Rock
            {
                geometry: new THREE.DodecahedronGeometry(3, 2),
                material: new THREE.MeshLambertMaterial({ color: 0x808080 }),
                yOffset: 3,
            },
            // Large Rock
            {
                geometry: new THREE.DodecahedronGeometry(6, 2),
                material: new THREE.MeshLambertMaterial({ color: 0x696969 }),
                yOffset: 6,
            },
            // Bush
            {
                geometry: new THREE.SphereGeometry(4, 12, 13),
                material: new THREE.MeshLambertMaterial({ color: 0x006400 }),
                yOffset: 4,
            },
            // Add more elements as desired
        ];

        for (let i = 0; i < numElements; i++) {
            const typeIndex = Math.floor(Math.random() * elementTypes.length);
            const element = new THREE.Mesh(
                elementTypes[typeIndex].geometry,
                elementTypes[typeIndex].material
            );

            // Random position within the terrain bounds, avoiding the safe zone
            let x = Math.random() * 10000 - 5000;
            let z = Math.random() * 10000 - 5000;
            while (Math.sqrt(x * x + z * z) < 400) {
                x = Math.random() * 10000 - 5000;
                z = Math.random() * 10000 - 5000;
            }

            element.position.set(x, elementTypes[typeIndex].yOffset, z);
            element.rotation.y = Math.random() * Math.PI * 2; // Random rotation
            scene.add(element);

            // Add to collidable objects
            collidableTerrainObjects.push(element);
        }
    }

    addPlantsToTerrain();

    return collidableTerrainObjects;
}
