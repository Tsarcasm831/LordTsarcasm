const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the current directory
app.use(express.static(__dirname));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
