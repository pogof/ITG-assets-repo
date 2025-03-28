// Load the header
fetch('/partials/footer.html')
.then(response => response.text())
.then(data => {
document.getElementById('footer').innerHTML = data;
});