const fs = require('fs');
const path = require('path');
const util = require('util');

let readdirAsync = util.promisify(fs.readdir);
let statAsync = util.promisify(fs.stat);

async function scanFile(src, action) {
    let srcSt = await statAsync(src);
    if (srcSt.isFile())
        return action(src);

    let files = await readdirAsync(src);
    for (let file of files) {
        let fileSrc = path.join(src, file);
        await scanFile(fileSrc, action);
    }
}

module.exports = scanFile;