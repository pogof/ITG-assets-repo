const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to ITG Assets Repository</h1>
        <ul>
            <li><a href="/upload">Upload Page</a></li>
            <li><a href="/judgement_font">Judgement Font Page</a></li>
        </ul>
    `);
});

module.exports = router;