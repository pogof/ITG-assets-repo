const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const judgementFontPath = path.join(__dirname, '../judgement_font');

router.get('/', (req, res) => {
    const searchTerm = req.query.search || '';
    const formatFilters = Array.isArray(req.query.format) ? req.query.format : [req.query.format].filter(Boolean);
    const hasDoubleresFilter = req.query.has_doubleres || '';

    fs.readdir(judgementFontPath, (err, folders) => {
        if (err) {
            return res.status(500).send('Error reading judgement_font directory');
        }

        let html = `
            <html>
            <body>
            <form method="GET" action="/">
            <input type="text" name="search" value="${searchTerm}" placeholder="Search by name">
            <div>
            <label>Format:</label>
            <label><input type="checkbox" name="format" value="1x6" ${formatFilters.includes('1x6') ? 'checked' : ''}> 1x6</label>
            <label><input type="checkbox" name="format" value="2x6" ${formatFilters.includes('2x6') ? 'checked' : ''}> 2x6</label>
            <label><input type="checkbox" name="format" value="1x7" ${formatFilters.includes('1x7') ? 'checked' : ''}> 1x7</label>
            <label><input type="checkbox" name="format" value="2x7" ${formatFilters.includes('2x7') ? 'checked' : ''}> 2x7</label>
            </div>
            <label for="has_doubleres">Has Doubleres:</label>
            <input type="checkbox" name="has_doubleres" value="true" ${hasDoubleresFilter === 'true' ? 'checked' : ''}>
            <button type="submit">Search</button>
            <button type="button" onclick="window.location.href='/'">Remove all filters</button>
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
                if (metadata.font_name && metadata.creator && metadata.format !== undefined && metadata.has_lowres !== undefined && metadata.has_doubleres !== undefined) {
                    const matchesSearchTerm = metadata.font_name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFormat = formatFilters.length === 0 || formatFilters.some(format => metadata.format.includes(format));
                    const matchesDoubleres = hasDoubleresFilter === '' || metadata.has_doubleres.toString() === hasDoubleresFilter;

                    if (matchesSearchTerm && matchesFormat && matchesDoubleres) {
                        const imagePath = path.join('/judgement_font', folder, pngFile);

                        html += `
                            <div style="width: 100px; height: 100px; margin: 10px; background-image: url('${imagePath}'); background-size: cover;">
                                <div style="background: rgba(255, 255, 255, 0.8); padding: 5px;">
                                    <p>Font Name: ${metadata.font_name}</p>
                                    <p>Creator: ${metadata.creator}</p>
                                    <p>Format: ${metadata.format.join(', ')}</p>
                                    <p>Has Lowres: ${metadata.has_lowres}</p>
                                    <p>Has Doubleres: ${metadata.has_doubleres}</p>
                                    <a href="/download/${folder}" style="display: block; margin-top: 10px;">Download</a>
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