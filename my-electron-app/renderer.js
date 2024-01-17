
// Set search results section display to none, because its not working when set in html for whatever reasone
document.getElementById('searchresults').style.display = "none";

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
    let args = [fpath, keyword];
    console.log(fpath);
    console.log(keyword);
    console.log(args);
    //myapp.startRecursiveContentSearch(args);
    try {
        console.log('Before search');
        const matchingFilePaths = await myapp.startRecursiveContentSearch(args);
        console.log('After search');

        // Clear previous search results
        searchResultsList.innerHTML = '';

        // Display the new search results
        if (matchingFilePaths.length > 0) {
            matchingFilePaths.forEach(filePath => {
                const li = document.createElement('li');
                li.textContent = filePath;

                // Add click event listener to open the document
                //li.addEventListener('click', () => {
                //    openDocument(filePath);
                //});

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
    document.getElementById('searchresults').style.display = "none";
    document.getElementById('searchparameters').style.display = "block";
})


// Display information about the application
const information = document.getElementById('info');
information.innerText = `This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`;


function startSearch(fpath, keyword, location, type) {
    //Location = 0 = non-recursive Location = 1 = recursive
    //type = 0 = name and content, 1 = file names, 2 = file content
    if (location == 0) {
        //TODO: implement non-recursive searches
    } else if (location == 1) {
        // Search is recursive
        if(type == 0) {
            //TODO: implement name&content search
        } else if (type == 1) {
            //TODO: file name search
        } else if (type == 2) {
            // TODO: file contents search
            myapp.startRecursiveContentSearch(fpath, keyword);
        }
    }
}