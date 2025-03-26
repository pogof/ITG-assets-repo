const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the judgement_font directory
app.use('/judgement_font', express.static('judgement_font'));

const indexRoute = require('./routes/index');
app.use('/', indexRoute);

const uploadRoute = require('./routes/upload');
app.use('/upload', uploadRoute);

app.use((req, res) => {
    res.status(404).send('Sorry, this page does not exist.');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});