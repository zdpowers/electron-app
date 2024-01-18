const { app, BrowserWindow, dialog, ipcMain } = require('electron/main')
const npath = require('node:path')

const sfcr = require('./scripts/searchFileContentRecursively'); // Import the fileSearch module

//To open files
const { shell } = require('electron');

// Writing a reusable function to instantiate windows
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    //titleBarOverlay: {
    //    color: '#2f3241',
    //    symbolColor: '#74b1be',
    //},
    titleBarOverlay: true,
    //frame: false,
    webPreferences: {
        preload: npath.join(__dirname, 'preload.js'),
        nodeIntegrationInWorker: true
    }
  });
  win.loadFile('index.html');
  // OPEN DIRECTORY DIALOG
  ipcMain.on('open-directory-dialog', async () => openDirectoryProcess(win));
  // OPEN FILE
  ipcMain.on('launch-file', (event, filePath) => {
    //shell.openPath(filePath);
    shell.showItemInFolder(filePath);
  });
  // RECURSIVE CONTENT SEARCH
  ipcMain.on('recursive-content-search', async (event, args) => {
    try {
        if (args && args.length >= 2) {
            console.log('Received arguments:', args);
            const matchingFilePaths = await sfcr.searchFileContentRecursively(args[0], args[1]);
            console.log('Matching file paths:', matchingFilePaths);
             // If the search is successful, emit 'search-result' with the matching file paths
            event.sender.send('search-result', matchingFilePaths);
        } else {
            console.error('Invalid arguments for recursive content search. Args:', args);
        }
    } catch (error) {
        console.error('Error during recursive content search:', error.message);
        // If there is an error during the search, emit 'search-error' with an error message
        // Example: event.sender.send('search-error', 'An error occurred during the search');
    }
  });
}

// Calling your function when the app is ready
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit the app when all windows are closed 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * This function was created to handle the logic of selecting/opening a directory via IPC
 * @param {*} win this is the window object/context
 * @author Zack Powers
 */
async function openDirectoryProcess(win) {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    
    if (!result.canceled) {
        const selectedDir = result.filePaths[0];
        win.webContents.send('selected-directory', selectedDir);
    }
}