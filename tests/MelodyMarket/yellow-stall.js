function createYellowStall(scene, THREE) {
    const stallInfo = { x: 10, z: -10, color: 0xffff00, music: 'music/music4.mp3' };

    // Outer stall geometry (without bottom)
    const stallGeometry = new THREE.BoxGeometry(4, 3, 4);
    stallGeometry.deleteAttribute('position');
    const positions = [
        // Top face
        -2, 1.5, -2,
        -2, 1.5, 2,
        2, 1.5, 2,
        2, 1.5, -2,
        // Side faces
        -2, -1.5, -2,
        -2, 1.5, -2,
        2, 1.5, -2,
        2, -1.5, -2,

        2, -1.5, -2,
        2, 1.5, -2,
        2, 1.5, 2,
        2, -1.5, 2,

        2, -1.5, 2,
        2, 1.5, 2,
        -2, 1.5, 2,
        -2, -1.5, 2,

        -2, -1.5, 2,
        -2, 1.5, 2,
        -2, 1.5, -2,
        -2, -1.5, -2
    ];
    stallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Create a group for the stall to add multiple meshes
    const stallGroup = new THREE.Group();

    // External texture for walls
    const wallTexture = new THREE.TextureLoader().load('https://file.garden/Zy7B0LkdIVpGyzA1/Another%20Me.webp');

    // Outer stall material with texture
    const stallMaterial = new THREE.MeshStandardMaterial({ 
        map: wallTexture,
        side: THREE.DoubleSide,  // Render both sides of the material
        transparent: true,
        opacity: 0.8  // Slightly transparent to see internal structure
    });

    // Create the main stall mesh
    const stall = new THREE.Mesh(stallGeometry, stallMaterial);
    stall.position.set(stallInfo.x, 1.5, stallInfo.z);
    stallGroup.add(stall);

    // Add internal walls
    const wallThickness = 0.1;
    const wallHeight = 2.5;
    
    // Create internal wall materials with the same texture
    const internalWallMaterials = [
        new THREE.MeshStandardMaterial({ 
            map: wallTexture,
            side: THREE.DoubleSide 
        }),
        new THREE.MeshStandardMaterial({ 
            map: wallTexture,
            side: THREE.DoubleSide 
        })
    ];

    // Internal wall along x-axis
    const xWallGeometry = new THREE.BoxGeometry(4, wallHeight, wallThickness);
    const xWall1 = new THREE.Mesh(xWallGeometry, internalWallMaterials[0]);
    xWall1.position.set(stallInfo.x, 1.5, stallInfo.z + 2);
    const xWall2 = new THREE.Mesh(xWallGeometry, internalWallMaterials[1]);
    xWall2.position.set(stallInfo.x, 1.5, stallInfo.z - 2);

    // Internal wall along z-axis
    const zWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, 4);
    const zWall1 = new THREE.Mesh(zWallGeometry, internalWallMaterials[0]);
    zWall1.position.set(stallInfo.x + 2, 1.5, stallInfo.z);
    const zWall2 = new THREE.Mesh(zWallGeometry, internalWallMaterials[1]);
    zWall2.position.set(stallInfo.x - 2, 1.5, stallInfo.z);

    // Create a counter
    const counterGeometry = new THREE.BoxGeometry(3, 1, 0.5);
    const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,  // Wooden brown color
        side: THREE.DoubleSide 
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(stallInfo.x, 0.5, stallInfo.z);
    counter.rotation.y = Math.PI / 4;  // Rotate slightly for visual interest

    // Add internal walls and counter to the group
    stallGroup.add(xWall1, xWall2, zWall1, zWall2, counter);

    // Lazy texture loading function
    function lazyLoadTexture(url) {
        return new Promise((resolve, reject) => {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
                url,
                (texture) => {
                    console.log('Texture loaded successfully:', url);
                    resolve(texture);
                },
                undefined, // onProgress (optional)
                (error) => {
                    console.error('Error loading texture:', url, error);
                    reject(error);
                }
            );
        });
    }

    // Defer texture loading until stall is about to be created
    stallGroup.userData.lazyLoadWallTexture = async () => {
        try {
            const wallTexture = await lazyLoadTexture('https://file.garden/Zy7B0LkdIVpGyzA1/Another%20Me.webp');
            
            // Update outer stall material
            stall.material = new THREE.MeshStandardMaterial({ 
                map: wallTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });

            // Update internal wall materials
            xWall1.material = new THREE.MeshStandardMaterial({ 
                map: wallTexture,
                side: THREE.DoubleSide 
            });
            xWall2.material = new THREE.MeshStandardMaterial({ 
                map: wallTexture,
                side: THREE.DoubleSide 
            });
            zWall1.material = new THREE.MeshStandardMaterial({ 
                map: wallTexture,
                side: THREE.DoubleSide 
            });
            zWall2.material = new THREE.MeshStandardMaterial({ 
                map: wallTexture,
                side: THREE.DoubleSide 
            });

            return wallTexture;
        } catch (error) {
            console.error('Failed to lazy load wall texture:', error);
            throw error;
        }
    };

    // Improved sound loading with AudioContext handling
    const sound = new Howl({
        src: [stallInfo.music],
        loop: true,
        volume: 0,
        onloaderror: (id, err) => {
            console.warn(`Failed to load music ${stallInfo.music}:`, err);
        },
        onload: () => {
            console.log(`Music ${stallInfo.music} loaded successfully`);
            // Defer playing until user interaction
            sound.pause();
        }
    });

    stallGroup.userData = {
        music: stallInfo.music,
        sound: sound
    };

    scene.add(stallGroup);
    return stallGroup;
}

// Export the function if using modules, otherwise it will be a global function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createYellowStall;
}
