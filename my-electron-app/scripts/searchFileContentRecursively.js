const fs = require('fs');
const path = require('path');
const readline = require('readline-promise');
const pdf = require('pdf-parse');


/**
 * Recursively searches files in a directory for occurrences of a specified text.
 * @param {string} directory - The directory to start the search from.
 * @param {string} searchText - The text to search for in the files.
 * @param {boolean} recursiveFlag - If true search subdirs recursively, if false only search current dir
 * @returns {Array} - An array of full filepaths for all matches.
 */
async function searchFileContentRecursively(directory, searchText, recursiveFlag) {
    const matchingFilePaths = [];
    try {
        const files = fs.readdirSync(directory);

        for (const file of files) {
            const filePath = path.join(directory, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isDirectory()) {
                // If it's a directory, recursively search its contents
                //await searchFileContentRecursively(filePath, searchText);
                if(recursiveFlag == true) {
                    const nestedMatches = await searchFileContentRecursively(filePath, searchText);
                    matchingFilePaths.push(...nestedMatches);
                }
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

module.exports = {
    searchFileContentRecursively,
    readTextFromBinaryFile,
    readTextFromPdfFile,
    countOccurrences,
};