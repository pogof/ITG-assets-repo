const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the judgement_font directory
app.use('/judgement_font', express.static('judgement_font'));

// Serve static files from the css directory
app.use('/css', express.static('css'));

// Serve static files from the js directory
app.use('/js', express.static('js'));

// Serve static files from the partials directory
app.use('/partials', express.static('partials'));

const indexRoute = require('./routes/index');
app.use('/', indexRoute);

const judgementFontsRoute = require('./routes/judgement_font');
app.use('/judgement_font', judgementFontsRoute);

const noteskinRoute = require('./routes/noteskin');
app.use('/noteskin', noteskinRoute);

const uploadRoute = require('./routes/upload');
app.use('/upload', uploadRoute);

app.use((req, res) => {
    res.status(404).send('Sorry, this page does not exist.');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Start the Discord bot
require('./bot');