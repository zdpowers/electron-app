// IN MAIN:
// FULL SEARCH
ipcMain.on('start-search', async (event, args) => {
    //args[2] = 0 = non-recursive, args[2] = 1 = recursive
    //args[3] = 0 = name and content, 1 = file names, 2 = file content
    var matchingFilePaths;
    try  {
        if(args[2] == 0) {
            switch(args[3]) {
                case 0:
                    //matchingFilePaths = await sfr.searchFilesRecursively(args[0], args[1], false);
                    matchingFilePaths = await sfnr.searchFileNamesRecursively(args[0], args[1], false);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case 1:
                    matchingFilePaths = await sfnr.searchFileNamesRecursively(args[0], args[1], false);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case 2:
                    matchingFilePaths = await sfcr.searchFileContentRecursively(args[0], args[1], false);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
            }
        } else if (args[2] == 1) {
            switch(args[3]) {
                case 0:
                    //matchingFilePaths = await sfr.searchFilesRecursively(args[0], args[1], true);
                    matchingFilePaths = await sfnr.searchFileNamesRecursively(args[0], args[1], true);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case 1:
                    matchingFilePaths = await sfnr.searchFileNamesRecursively(args[0], args[1], true);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case 2:
                    matchingFilePaths = await sfcr.searchFileContentRecursively(args[0], args[1], true);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
            }
        }
    } catch (error) {
        console.error('Error during recursive content search:', error.message);
        // If there is an error during the search, emit 'search-error' with an error message
        // Example: event.sender.send('search-error', 'An error occurred during the search');
    }
});


// ADD RECURSIVE FLAGS TO FUNCTIONS


// IN PRELOAD:
startSearch: (args) => {
    return new Promise((resolve, reject) => {
        ipcRenderer.send('start-search', args);

        ipcRenderer.on('search-result', (event, matchingFilePaths) => {
            // Handle the search result here
            console.log('Received matching file paths:', matchingFilePaths);
            resolve(matchingFilePaths);
        });

        ipcRenderer.on('search-error', (event, errorMessage) => {
            // Handle the search error here
            console.error('Search error:', errorMessage);
            reject(new Error(errorMessage));
        });
    });
}

