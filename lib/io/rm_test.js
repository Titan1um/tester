const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const rm = require('./rm');

let srcPath = path.join(__dirname, 'testSrcDir'),
    testFileSrc = path.join(__dirname, 'testFile');

describe('/lib/io/rm.js', () => {
    it('删除文件', async () => {
        await util.promisify(fs.writeFile)(testFileSrc, 'test');

        await rm(testFileSrc);
        assert.strictEqual(fs.existsSync(testFileSrc), false, '出错了');
    });

    it('删除目录', async () => {
        await util.promisify(fs.mkdir)(srcPath, 0777);
        for (let depth = 0; depth < 2; depth++) {
            await util.promisify(fs.writeFile)(path.join(srcPath, Math.random().toString(36).slice(2)), 'test');
        }

        await rm(srcPath);
        assert.equal(fs.existsSync(srcPath), false, '出错了');
    });
});