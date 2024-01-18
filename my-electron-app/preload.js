const { ipcRenderer } = require('electron');
const { contextBridge } = require('electron/renderer');
const { shell } = require('electron');

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

contextBridge.exposeInMainWorld('myapp', {
    openDirectoryDialog: () => {
        ipcRenderer.send('open-directory-dialog');
    },
    setSelected: () => {
        ipcRenderer.on('selected-directory', (event, path) => {
            document.getElementById('selectedDir').innerText = path;
        });
    },
    startRecursiveContentSearch: (args) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('recursive-content-search', args);

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
    startRecursiveNameSearch: (args) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('recursive-name-search', args);

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
});