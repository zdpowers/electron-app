const { app, BrowserWindow, dialog, ipcMain } = require('electron/main')
const npath = require('node:path')

const sfcr = require('./searchcode/scripts/searchFileContentRecursively'); // search file content recursively
const sfnr = require('./searchcode/scripts/searchFileNamesRecursively'); // search file names recursively
const sfr = require('./searchcode/scripts/searchFileRecursively'); //search file names and content

//To open files
const { shell } = require('electron');

// Writing a reusable function to instantiate windows
const createWindow = () => {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    titleBarStyle: "hidden",
    titleBarOverlay: {
        //color: '#222',
        //symbolColor: '#f0f0f0',
        color: '#fff',
        symbolColor: '#333',
    },
    //titleBarOverlay: true,
    //frame: false,
    webPreferences: {
        preload: npath.join(__dirname, 'preload.js'),
        nodeIntegrationInWorker: true
    }
  });

  // TO CHANGE DEFAULT HOME PAGE CHANGE THE LINE BELOW
  win.loadFile('./searchcode/index.html');

  // GO TO AI APP
  ipcMain.on('open-AI-app', (event, filePath) => {
    win.loadFile(filePath);
  })
  // GO TO SEARCH APP
  ipcMain.on('open-search-app', (event, filePath) => {
    win.loadFile(filePath);
  });
  // OPEN DIRECTORY DIALOG
  ipcMain.on('open-directory-dialog', async () => openDirectoryProcess(win));
  // OPEN FILE
  ipcMain.on('launch-file', (event, filePath) => {
    //shell.openPath(filePath);
    shell.showItemInFolder(filePath);
  });
  // FILE SEARCH
  ipcMain.on('start-search', async (event, args) => {
    //args[2] = 0 = non-recursive, args[2] = 1 = recursive
    //args[3] = 0 = name and content, 1 = file names, 2 = file content
    console.log(typeof(args[2]), typeof(args[3]));
    var matchingFilePaths;
    try  {
        if(args[2] == '0') {
          // NON RECURSIVE SEARCHED
            switch(args[3]) {
                case '0':
                    matchingFilePaths = await sfr.searchFileRecursively(args[0], args[1], false);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case '1':
                  // SEARCH FILE NAMES
                    matchingFilePaths = await sfnr.searchFileNamesRecursively(args[0], args[1], false);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case '2':
                  // SEARCH FILE CONTENT
                    matchingFilePaths = await sfcr.searchFileContentRecursively(args[0], args[1], false);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
            }
        } else if (args[2] == '1') {
            switch(args[3]) {
                case '0':
                    matchingFilePaths = await sfr.searchFileRecursively(args[0], args[1], true);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case '1':
                  // SEARCH FILE NAMES RECURSIVELY
                    matchingFilePaths = await sfnr.searchFileNamesRecursively(args[0], args[1], true);
                    event.sender.send('search-result', matchingFilePaths);
                    break;
                case '2':
                  // SEARCH FILE CONTENT RECURSIVELY
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