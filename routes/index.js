const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send(`
        <html>

        <head>
            <link rel="stylesheet" type="text/css" href="/css/styles.css">
        </head>
        
        <body>
            <div id="header"></div>
            <h1>Welcome to ITG Assets Repository</h1>
            <main class="main-container">
            <p>Lorem ipsum dolor</p>
            </main>
            <footer>
                <div id="footer"></div>
            </footer>
            <script src="/js/header.js"></script>
            <script src="/js/footer.js"></script>
            </body>
        </html>


    `);
});

module.exports = router;

