const fs = require('fs');
const path = require('path');
const util = require('util');

const mkdir = require('./mkdir');

let readdirAsync = util.promisify(fs.readdir);
let statAsync = util.promisify(fs.stat);

async function cp(src, dst) {
    if (!fs.existsSync(src))
        return;

    let srcSt = await statAsync(src);
    if (srcSt.isFile()) {
        await mkdir(dst, true);
        return await cpFile(src, dst);
    }

    await mkdir(dst);
    
    let files = await readdirAsync(src);
    for (let file of files) {
        let fileSrc = path.join(src, file);
        let fileDst = path.join(dst, file);
        await cp(fileSrc, fileDst);
    }
};

function cpFile(src, dst) {
    console.log('拷贝文件: %s -> %s', src, dst);
    return new Promise((s, f) => {
        fs.createReadStream(src)
            .on('err', f)
            .on('end', s)
            .pipe(
                fs.createWriteStream(dst)
            );
    });
}

module.exports = cp;