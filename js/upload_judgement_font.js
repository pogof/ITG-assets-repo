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
