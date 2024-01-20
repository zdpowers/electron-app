
// Set search results section display to none, because its not working when set in html for whatever reasone
document.getElementById('searchresults').style.display = "none";

// Navigate to AI application
document.getElementById('aiButton').addEventListener('click', () => {
    myapp.navToAI();
});

// Open Directory
document.getElementById('opnDirBtn').addEventListener('click', () => {
    // Select the dir
    myapp.openDirectoryDialog();
    // Set the Dir Path
    myapp.setSelected()
});



// Start Search
const searchResultsList = document.getElementById('searchResultsList');
document.getElementById('searchBtn').addEventListener('click', async () => {
    //fpath, keyword, location, type
    let fpath = document.getElementById('selectedDir').textContent;
    let keyword = document.getElementById('searchword').value;
    let location = document.querySelector('input[name="searchlocation"]:checked').value;
    let type = document.querySelector('input[name="searchtype"]:checked').value;
    document.getElementById('searchparameters').style.display = "none";
    document.getElementById('searchresults').style.display = "block";
    
    // Start the search
    //startSearch(fpath, keyword, location, type);
    let args = [fpath, keyword, location, type];

    try {
        const matchingFilePaths = await myapp.startSearch(args);

        // Clear previous search results
        searchResultsList.innerHTML = '';

        // Display the new search results
        if (matchingFilePaths.length > 0) {
            matchingFilePaths.forEach(filePath => {
                const li = document.createElement('li');
                li.textContent = filePath;
                li.classList = "result-list-item";

                searchResultsList.appendChild(li);
            });
        } else {
            // No results found
            const li = document.createElement('li');
            li.textContent = 'No matching files found.';
            searchResultsList.appendChild(li);
        }
    } catch (error) {
        // Handle the error
        console.error('Error during search:', error.message);
    }
});


// Attach a click event listener to the parent ul element (using event delegation)
searchResultsList.addEventListener('click', (event) => {
    const target = event.target;
    console.log(target.textContent);

    // Check if the clicked element is an li element
    if (target.tagName.toLowerCase() === 'li') {
        // Get the text content (file path) of the clicked list item
        const filePath = target.textContent;

        // Open the document with the default application
        openDocument(filePath);
    }
});

// Function to open the document with the default application
function openDocument(filePath) {
    //const { shell } = require('electron');
    //shell.showItemInFolder(filePath);
    //shell.openPath(filePath);
    //alert(filePath);
    myapp.launchFile(filePath);
}


// Back button
document.getElementById('searchBackBtn').addEventListener('click', () => {
    // CLEAR SEARCH RESULTS
    searchResultsList.innerHTML = '<li><div class="loading-results">Loading</div></li>';

    document.getElementById('searchresults').style.display = "none";
    document.getElementById('searchparameters').style.display = "block";
})


// Display information about the application
const information = document.getElementById('info');
information.innerText = `This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`;
