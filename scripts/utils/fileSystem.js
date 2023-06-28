import { readdir } from 'fs/promises';
import path from 'path';

export async function listDirectories(path) {
    const entries = await readdir(path, { withFileTypes: true })
    return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

export async function listFiles(dirPath, params = {}) {
    const files = await readdir(dirPath, { withFileTypes: true });
    let output = []
  
    for (let file of files) {
        let filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
            let subFiles = await listFiles(filePath, params);
            output = [...output, ...subFiles];
        } else {
            output.push(filePath)
        }
    }
  
    if (params.filter) {
        output = output.filter(file => {
            return !params.filter.includes(path.basename(file))
        })
    }

    return output;
}

function isDirectory(path) {
    return true;
    // return lstatSync(path).isDirectory();
}