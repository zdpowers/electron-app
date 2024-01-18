const fs = require('fs');
const path = require('path');

/**
 * Recursively searches a directory for files and folders containing a specified string in their name.
 * @param {string} directory - The directory to start the search from.
 * @param {string} searchString - The string to search for in file and folder names.
 * @returns {Array} - An array of full filepaths for all matches.
 */
function searchFileNamesRecursively(directory, searchString) {
    const matchingPaths = [];

    function searchRecursively(currentDir) {
        const files = fs.readdirSync(currentDir);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isDirectory()) {
                // Recursively search subdirectories
                searchRecursively(filePath);
            } else {
                // Check if the file name contains the search string
                if (file.includes(searchString)) {
                    matchingPaths.push(filePath);
                }
            }
        }
    }

    // Start the recursive search
    searchRecursively(directory);

    return matchingPaths;
}

// Example: Search for files and folders containing 'example' in their name in the current directory
const searchDirectory = __dirname; // Replace with the desired directory path
const searchString = 'example';

const matches = searchFilesAndFolders(searchDirectory, searchString);

console.log('Matching file and folder paths:');
console.log(matches);
