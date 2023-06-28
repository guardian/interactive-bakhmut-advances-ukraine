import AWS from 'aws-sdk';
import path from 'path';
import config from '../project.config.js';
import { listDirectories } from './utils/fileSystem.js';

const s3 = new AWS.S3();
const bucketName = 'gdn-cdn';

const args = process.argv.slice(2);
const preview = (args[0] && args[0] === '--preview') || false;

const logFileName = preview ? 'preview.log' : 'live.log';

getLogs()

async function getLogs() {
    const atoms = await listDirectories(path.resolve('src/atoms'));
    for (let atom of atoms) {
        const logPath = path.join('atoms', config.path, atom, logFileName)
        const log = await getObject(bucketName, logPath)
        console.log(log.Body.toString())
    }
}

function getObject(bucketName, key) {
    return s3.getObject({
        Bucket: bucketName,
        Key: key
    }).promise()
}