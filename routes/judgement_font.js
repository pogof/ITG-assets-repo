const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const judgementFontPath = path.join(__dirname, '../judgement_font');

router.get('/', (req, res) => {
    const searchTerm = req.query.search || '';
    const formatFilters = Array.isArray(req.query.format) ? req.query.format : [req.query.format].filter(Boolean);

    fs.readdir(judgementFontPath, (err, folders) => {
        if (err) {
            return res.status(500).send('Error reading judgement_font directory');
        }

        let html = `
            <html>
            <head>
                <link rel="stylesheet" type="text/css" href="/css/styles.css">
            </head>
            <body>
            <form method="GET" action="/judgement_font">
            <input type="text" name="search" value="${searchTerm}" placeholder="Search by name">
            <div>
            <label>Format:</label>
            <label><input type="checkbox" name="format" value="1x6" ${formatFilters.includes('1x6') ? 'checked' : ''}> 1x6</label>
            <label><input type="checkbox" name="format" value="2x6" ${formatFilters.includes('2x6') ? 'checked' : ''}> 2x6</label>
            <label><input type="checkbox" name="format" value="1x7" ${formatFilters.includes('1x7') ? 'checked' : ''}> 1x7</label>
            <label><input type="checkbox" name="format" value="2x7" ${formatFilters.includes('2x7') ? 'checked' : ''}> 2x7</label>
            </div>
            <button type="submit">Search</button>
            <button type="button" onclick="window.location.href='/judgement_font'">Remove all filters</button>
            </form>
            <div style="display: flex; flex-wrap: wrap;">
        `;

        folders.forEach(folder => {
            const folderPath = path.join(judgementFontPath, folder);
            const files = fs.readdirSync(folderPath);
            const pngFile = files.find(file => file.endsWith('.png'));
            const metadataFile = path.join(folderPath, 'metadata.json');

            if (pngFile && fs.existsSync(metadataFile)) {
                const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));

                // Check if metadata is complete and matches the search term and filters
                if (metadata.font_name && metadata.creator && metadata.formats !== undefined && metadata.has_doubleres !== undefined) {
                    const matchesSearchTerm = metadata.font_name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFormat = formatFilters.length === 0 || formatFilters.some(format => metadata.formats.includes(format));

                    if (matchesSearchTerm && matchesFormat) {
                        const imagePath = path.join('/judgement_font', folder, pngFile);

                        html += `
                        <div class="font-container">
                            <div >
                                <img class="font-item" src="${imagePath}" alt="${metadata.font_name}">
                            </div>
                            <div class="font-info">
                                    <p>Font Name: ${metadata.font_name}</p>
                                    <p>Creator: ${metadata.creator}</p>
                                    <p>Format: ${metadata.formats.join(', ')}</p>
                                    <a href="/download/${folder}" class="download-link">Download</a>

                            </div>

                        </div>





                        `;
                    }
                }
            }
        });

        html += '</div></body></html>';
        res.send(html);
    });
});

router.get('/download/:folder', (req, res) => {
    const folder = req.params.folder;
    const folderPath = path.join(judgementFontPath, folder);

    res.setHeader('Content-Disposition', `attachment; filename=${folder}.zip`);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', (err) => {
        res.status(500).send({ error: err.message });
    });

    archive.pipe(res);

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading folder');
        }

        files.forEach(file => {
            if (file !== 'metadata.json') {
                const filePath = path.join(folderPath, file);
                archive.file(filePath, { name: file });
            }
        });

        archive.finalize();
    });
});

module.exports = router;