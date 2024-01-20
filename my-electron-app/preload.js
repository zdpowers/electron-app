const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer');
const { shell } = require('electron');

//contextBridge.exposeInMainWorld('versions', {
//  node: () => process.versions.node,
//  chrome: () => process.versions.chrome,
//  electron: () => process.versions.electron
//});

// CONTEXT BRIDGE FOR SEARCH PORTION OF APPLICATION
contextBridge.exposeInMainWorld('myapp', {
    openDirectoryDialog: () => {
        ipcRenderer.send('open-directory-dialog');
    },
    setSelected: () => {
        ipcRenderer.on('selected-directory', (event, path) => {
            document.getElementById('selectedDir').innerText = path;
        });
    },
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
    },
    launchFile: (filePath) => {
        // Send the file path to the main process
        ipcRenderer.send('launch-file', filePath);
    },
    navToAI: () => {
        // Navigate to the AI application
        ipcRenderer.send('open-AI-app', './aicode/index.html');
    },
});

// CONTEXT BRIDGE FOR AI PORTION OF APPLICATION
contextBridge.exposeInMainWorld('aiapp', {
    navToSearch: () => {
        // Navigate to the Search Applicaiton
        ipcRenderer.send('open-search-app', './searchcode/index.html');
    }
});