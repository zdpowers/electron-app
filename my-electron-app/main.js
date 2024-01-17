const { app, BrowserWindow, dialog, ipcMain } = require('electron/main')
const npath = require('node:path')

//This if for file searching
const fs = require('fs');
const path = require('path');
const readline = require('readline-promise');
const pdf = require('pdf-parse');

//To opn files
const { shell } = require('electron');

// Writing a reusable function to instantiate windows
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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
            const matchingFilePaths = await searchFileContentRecursively(args[0], args[1]);
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

/**
 * Recursively searches files in a directory for occurrences of a specified text.
 * @param {string} directory - The directory to start the search from.
 * @param {string} searchText - The text to search for in the files.
 */
async function searchFileContentRecursively(directory, searchText) {
    const matchingFilePaths = [];
    try {
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isDirectory()) {
                // If it's a directory, recursively search its contents
                //await searchFileContentRecursively(filePath, searchText);
                const nestedMatches = await searchFileContentRecursively(filePath, searchText);
                matchingFilePaths.push(...nestedMatches);
            } else {
                // If it's a file, determine its type and search for the specified text
                if (path.extname(filePath).toLowerCase() === '.pdf') {
                    // PDF file
                    try {
                        const content = await readTextFromPdfFile(filePath);
                        if (content.includes(searchText)) {
                            var count = countOccurrences(content, searchText);
                            console.log('Match found in PDF file:', filePath);
                            console.log(count);
                            matchingFilePaths.push(filePath);
                        }
                    } catch (pdfError) {
                        console.error(`Error reading PDF file '${filePath}': ${pdfError.message}`);
                    }
                } else if (path.extname(filePath).toLowerCase() === '.ppt' || path.extname(filePath).toLowerCase() === '.pptx') {
                    // PowerPoint file
                    try {
                        const content = await readTextFromBinaryFile(filePath);
                        if (content.includes(searchText)) {
                            var count = countOccurrences(content, searchText);
                            console.log('Match found in PowerPoint file:', filePath);
                            console.log(count);
                            matchingFilePaths.push(filePath);
                        }
                    } catch (binaryFileError) {
                        console.error(`Error reading binary file '${filePath}': ${binaryFileError.message}`);
                    }
                } else {
                    // text-based file...ideally (readFileSync vs readFile)
                    try {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        if (content.includes(searchText)) {
                            var count = countOccurrences(content, searchText);
                            console.log('Match found in text file:', filePath);
                            console.log(count);
                            matchingFilePaths.push(filePath);
                        }
                    } catch (textFileError) {
                        console.error(`Error reading text file '${filePath}': ${textFileError.message}`);
                    }
                }
            }
        }
    } catch (dirReadError) {
        console.error(`Error reading directory '${directory}': ${dirReadError.message}`);
    }
    return matchingFilePaths;
}


/**
 * Reads text from a binary file and returns the content in string format.
 *
 * @param {string} filePath - The path of the binary file to read.
 * @returns {Promise<string>} - A promise that resolves to the content of the file.
 */
function readTextFromBinaryFile(filePath) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath, { encoding: 'binary' }),
            output: process.stdout,
            terminal: false
        });

        let content = '';

        rl.on('line', line => {
            // Concatenate lines to form the content
            content += line;
        });

        rl.on('close', () => {
            resolve(content);
        });

        rl.on('error', error => {
            reject(error);
        });
    });
}

/**
 * Reads text from a PDF file and returns the content in string format.
 * @param {string} filePath - The path of the PDF file to read.
 * @returns {Promise<string>} - A promise that resolves to the contents of the file.
 */
function readTextFromPdfFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            pdf(data).then(pdfData => {
                const pdfText = pdfData.text;
                resolve(pdfText);
            }).catch(pdfError => {
                reject(pdfError);
            });
        });
    });
}

/**
 * Counts the occurrences of a specified text in a given content.
 * @param {string} content - The content to search for occurrences.
 * @param {string} searchText - The text to search for.
 * @returns {number} - The number of occurrences of the text in the content.
 */
function countOccurrences(content, searchText) {
    const regex = new RegExp(searchText, 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
}