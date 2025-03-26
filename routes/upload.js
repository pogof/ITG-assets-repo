const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only PNG files are allowed'));
        }
    }
});

router.get('/', (_, res) => {
    res.send(`
        <html>
        <body>
            <form id="primaryForm">
                <label>
                    <input type="radio" name="contentType" value="judgement_font" required>
                    Judgement Font
                </label>
                <label>
                    <input type="radio" name="contentType" value="noteskin" required disabled>
                    Noteskin
                </label>
                <label>
                    <input type="radio" name="contentType" value="sound_effects" required disabled>
                    Sound Effects
                </label>
                <button type="submit">Next</button>
            </form>
            <script>
                document.getElementById('primaryForm').addEventListener('submit', function(event) {
                    event.preventDefault();
                    const contentType = document.querySelector('input[name="contentType"]:checked').value;
                    window.location.href = '/upload/' + contentType;
                });
            </script>
        </body>
        </html>
    `);
});

router.get('/judgement_font', (_, res) => {
    res.send(`
        <html>
        <body>
            <h1>Upload Judgement Font</h1>
            <form id="judgementFontForm" action="/upload/judgement_font" method="POST" enctype="multipart/form-data">
                <label>Font Name: <input type="text" name="font_name" required></label><br>
                <label>Creator: <input type="text" name="creator" required></label><br>
                <div id="fileUploads">
                    <div class="fileUpload">
                        <label>Upload PNG: <input type="file" name="files" required></label><br>
                        <label>Format:
                            <select name="formats" required>
                                <option value="1x6">1x6</option>
                                <option value="2x6">2x6</option>
                                <option value="1x7">1x7</option>
                                <option value="2x7">2x7</option>
                            </select>
                        </label><br>
                        <label>Has Doubleres: <input type="checkbox" name="has_doubleres"></label><br>
                    </div>
                </div>
                <button type="button" id="addFileUpload">Add Another File</button><br>
                <button type="button" id="removeFileUpload" style="display: none;">Remove Last File</button><br>
                <label>Discord Username: <input type="text" name="discord_username"></label><br>
                <button type="submit">Submit</button>
            </form>
            <script>
                document.getElementById('addFileUpload').addEventListener('click', function() {
                    const fileUploadDiv = document.createElement('div');
                    fileUploadDiv.classList.add('fileUpload');
                    fileUploadDiv.innerHTML = \`
                        <label>Upload PNG: <input type="file" name="files" required></label><br>
                        <label>Format:
                            <select name="formats" required>
                                <option value="1x6">1x6</option>
                                <option value="2x6">2x6</option>
                                <option value="1x7">1x7</option>
                                <option value="2x7">2x7</option>
                            </select>
                        </label><br>
                        <label>Has Doubleres: <input type="checkbox" name="has_doubleres"></label><br>
                    \`;
                    document.getElementById('fileUploads').appendChild(fileUploadDiv);
                    updateRemoveButton();
                });

                document.getElementById('removeFileUpload').addEventListener('click', function() {
                    const fileUploads = document.getElementById('fileUploads');
                    if (fileUploads.children.length > 1) {
                        fileUploads.removeChild(fileUploads.lastChild);
                    }
                    updateRemoveButton();
                });

                function updateRemoveButton() {
                    const fileUploads = document.getElementById('fileUploads');
                    const removeButton = document.getElementById('removeFileUpload');
                    if (fileUploads.children.length > 1) {
                        removeButton.style.display = 'inline';
                    } else {
                        removeButton.style.display = 'none';
                    }
                }

                // Initial call to hide the remove button if only one upload option is present
                updateRemoveButton();
            </script>
        </body>
        </html>
    `);
});

router.post('/judgement_font', upload.array('files'), (req, res) => {
    const { font_name, creator, formats, discord_username } = req.body;
    let { has_doubleres } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded');
    }

    let folderPath = path.join(__dirname, '../not_approved/judgement_font', font_name);

    // Check if the folder already exists in either not_approved/judgement_font or judgement_font
    if (fs.existsSync(folderPath) || fs.existsSync(path.join(__dirname, '../judgement_font', font_name))) {
        const randomString = Math.random().toString(36).substring(2, 9);
        folderPath = path.join(__dirname, '../not_approved/judgement_font', `${font_name}_${randomString}`);
    }

    // Create the folder
    fs.mkdirSync(folderPath, { recursive: true });

    // Ensure has_doubleres is an array
    if (!Array.isArray(has_doubleres)) {
        has_doubleres = [has_doubleres];
    }

    // Move and rename the uploaded files to the new folder
    files.forEach((file, index) => {
        const format = Array.isArray(formats) ? formats[index] : formats;
        const doubleres = has_doubleres[index] === 'on';
        const newFileName = `${font_name} ${format}${doubleres ? ' (doubleres)' : ''}.png`;
        const filePath = path.join(folderPath, newFileName);
        fs.renameSync(file.path, filePath);
    });

    // Create the metadata.json file
    const metadata = {
        font_name,
        creator,
        formats: Array.isArray(formats) ? formats : [formats],
        has_doubleres: has_doubleres.map(d => d === 'on'),
        discord_username: discord_username || ''
    };
    fs.writeFileSync(path.join(folderPath, 'metadata.json'), JSON.stringify(metadata, null, 2));

    res.send('Upload successful');
});

router.get('/noteskin', (_, res) => {
    res.send(`
        <html>
        <body>
            <h1>Upload Noteskin</h1>
            <form action="/upload/noteskin" method="POST" enctype="multipart/form-data">
                <!-- Add your form fields here -->
                <input type="file" name="file" required>
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
    `);
});

router.get('/sound_effects', (_, res) => {
    res.send(`
        <html>
        <body>
            <h1>Upload Sound Effects</h1>
            <form action="/upload/sound_effects" method="POST" enctype="multipart/form-data">
                <!-- Add your form fields here -->
                <input type="file" name="file" required>
                <button type="submit">Upload</button>
            </form>
        </body>
        </html>
    `);
});

module.exports = router;