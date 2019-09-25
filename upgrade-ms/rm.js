const fs = require('fs');
const path = require('path');
const util = require('util');

let readdirAsync = util.promisify(fs.readdir);
let rmdirAsync = util.promisify(fs.rmdir);
let statAsync = util.promisify(fs.stat);
let unlinkAsync = util.promisify(fs.unlink);

async function rm(src, log) {
    if (!fs.existsSync(src))
        return;

    let srcSt = await statAsync(src);
    if (srcSt.isFile())
        return await rmFile(src, log);

    let files = await readdirAsync(src);
    for (let file of files) {
        await rm(
            path.join(src, file),
            log
        );
    }

    await rmDir(src, log);
}

async function rmDir(dirPath, log) {
    if (log)
        log('删除目录: %s', dirPath);
    await rmdirAsync(dirPath);
}

async function rmFile(filePath, log) {
    if (log)
        log('删除文件: %s', filePath);
    await unlinkAsync(filePath);
}

module.exports = rm;