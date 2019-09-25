const fs = require('fs');
const path = require('path');
const util = require('util');

let mkdirAsync = util.promisify(fs.mkdir);

async function mkdir(filePath, isFile) {
    if (fs.existsSync(filePath))
        return;

    await mkdir(path.dirname(filePath));

    if (isFile)
        return;

    await mkdirAsync(filePath);
}

module.exports = mkdir;