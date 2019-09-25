const fs = require('fs');
const path = require('path');
const util = require('util');

let readdirAsync = util.promisify(fs.readdir);
let rmdirAsync = util.promisify(fs.rmdir);
let statAsync = util.promisify(fs.stat);
let unlinkAsync = util.promisify(fs.unlink);

async function rm(src) {
    if (!fs.existsSync(src))
        return;

    let srcSt = await statAsync(src);
    if (srcSt.isFile())
        return await rmFile(src);

    let files = await readdirAsync(src);
    for (let file of files) {
        await rm(
            path.join(src, file)
        );
    }

    await rmDir(src);
}

async function rmDir(dirPath) {
    await rmdirAsync(dirPath);

    while (fs.existsSync(dirPath)) {}
}

async function rmFile(filePath) {
    await unlinkAsync(filePath);

    while (fs.existsSync(filePath)) {}
}

module.exports = rm;