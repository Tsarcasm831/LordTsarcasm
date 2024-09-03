const express = require('express');
const app = express();
const port = 3000;

app.get('/api/albums', async (req, res) => {
    try {
        const albumData = await getAlbumData();
        res.json(albumData);
    } catch (err) {
        res.status(500).send('Error reading the images folder.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
