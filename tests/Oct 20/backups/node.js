const fs = require('fs');
const path = require('path');

// Path to your images folder
const imageFolderPath = path.join(__dirname, 'images');

// Map to store the album data with corresponding image and details
const albumDetails = {
    'Success the Obsession.png': { id: 'success-modal', title: 'Success the Obsession (Concept Version)', details: 'Single - 2024 - 1 song' },
    'DOT..png': { id: 'dot-modal', title: 'DOT.', details: 'Album - 2024 - 17 songs' },
    'Riddle Me.png': { id: 'riddle-me-modal', title: 'Riddle Me', details: 'Single - 2024 - 1 song' },
    'Glad You\'re Mine.png': { id: 'glad-mine-modal', title: 'Glad You\'re Mine', details: 'Single - 2024 - 1 song' },
    'Moral Compass.png': { id: 'moral-compass-modal', title: 'Moral Compass', details: 'Single - 2024 - 1 song' },
    'Its Not About The Weather.png': { id: 'not-weather-modal', title: 'It\'s Not About the Weather', details: 'Single - 2024 - 1 song' },
    'Shoot Me Down.png': { id: 'shoot-me-down-modal', title: 'Shoot Me Down', details: 'Single - 2023 - 1 song' },
    'svt.png': { id: 'svt-modal', title: 'S.V.T. (Out In The Cold)', details: 'Single - 2024 - 1 song' },
    'hellstrom.png': { id: 'hellstrom-modal', title: 'Hellstrom', details: 'Hellstrom - Album - WIP' },
    'supernova2.png': { id: 'supernova-modal', title: 'Supernova', details: 'Single - 2024 - 1 song' }
};

function getAlbumData() {
    return new Promise((resolve, reject) => {
        fs.readdir(imageFolderPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            const albumData = files.map(file => {
                if (albumDetails[file]) {
                    return {
                        id: albumDetails[file].id,
                        title: albumDetails[file].title,
                        image: file,
                        details: albumDetails[file].details
                    };
                }
            }).filter(Boolean);

            resolve(albumData);
        });
    });
}

// Example of how to use this function
getAlbumData().then(albumData => {
    console.log(JSON.stringify(albumData, null, 2));
}).catch(err => {
    console.error('Error reading the images folder:', err);
});
