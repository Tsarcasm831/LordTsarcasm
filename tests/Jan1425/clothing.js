// clothing.js

export function createTShirt(humanoid) {
    const shirtMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff }); // Blue T-shirt

    // Shirt Body
    const shirtBodyGeometry = new THREE.BoxGeometry(5.2, 7, 2.2); // Slightly larger than torso
    const shirtBody = new THREE.Mesh(shirtBodyGeometry, shirtMaterial);
    shirtBody.position.set(0, 0, 0);
    humanoid.body.add(shirtBody);

    // Left Sleeve
    const leftSleeveGeometry = new THREE.BoxGeometry(1.2, 4, 1.2); // Sleeve size
    const leftSleeve = new THREE.Mesh(leftSleeveGeometry, shirtMaterial);
    leftSleeve.position.set(-3.1, -1, 0); // Adjusted position for visibility
    humanoid.leftArm.add(leftSleeve); // Attach directly to leftArm

    // Right Sleeve
    const rightSleeve = leftSleeve.clone();
    rightSleeve.position.set(3.1, -1, 0); // Adjusted position for visibility
    humanoid.rightArm.add(rightSleeve); // Attach directly to rightArm
}

export function createPants(humanoid) {
    const pantsMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown pants

    // Pants Body
    const pantsBodyGeometry = new THREE.BoxGeometry(4.2, 3, 2.7); // Slightly larger than lower body
    const pantsBody = new THREE.Mesh(pantsBodyGeometry, pantsMaterial);
    pantsBody.position.set(0, 0, 0);
    humanoid.lowerBody.add(pantsBody);

    // Left Leg Pants
    const leftLegPantsGeometry = new THREE.BoxGeometry(1.7, 8, 1.7); // Cover upper and lower leg
    const leftLegPants = new THREE.Mesh(leftLegPantsGeometry, pantsMaterial);
    leftLegPants.position.set(0, -4, 0); // Adjust to cover leg
    humanoid.leftLeg.upperLegGroup.add(leftLegPants);

    // Right Leg Pants
    const rightLegPants = leftLegPants.clone();
    humanoid.rightLeg.upperLegGroup.add(rightLegPants);
}

export function createHat(humanoid) {
    const hatMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red hat

    // Hat Geometry
    const hatGeometry = new THREE.CylinderGeometry(1.6, 1.6, 1, 16);
    const hat = new THREE.Mesh(hatGeometry, hatMaterial);
    hat.position.set(0, 1.8, 0);
    humanoid.head.add(hat);

    // Hat Brim
    const brimGeometry = new THREE.CylinderGeometry(2.0, 2.0, 0.2, 16);
    const brim = new THREE.Mesh(brimGeometry, hatMaterial);
    brim.position.set(0, 1.3, 0);
    humanoid.head.add(brim);
}

export function applyClothing(humanoid) {
    createTShirt(humanoid);
    createPants(humanoid);
    createHat(humanoid);
}
