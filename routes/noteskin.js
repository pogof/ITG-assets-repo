const express = require('express');

const router = express.Router();

// Basic route for noteskin
router.get('/', (req, res) => {
    res.send('Welcome to the Noteskin page!');
});

module.exports = router;