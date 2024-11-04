// traits.js
const availableTraits = [
    {
        name: 'Strong',
        description: 'Increases strength by 5.',
        effects: { strength: 5 },
        prerequisites: []
    },
    {
        name: 'Agile',
        description: 'Increases dexterity by 5.',
        effects: { dexterity: 5 },
        prerequisites: []
    },
    {
        name: 'Lucky',
        description: 'Increases reputation gain by 2.',
        effects: { reputation: 2 },
        prerequisites: []
    },
    {
        name: 'Cold-Hearted',
        description: 'Decreases karma by 5.',
        effects: { karma: -5 },
        prerequisites: []
    },
    // Add more traits as desired
];
