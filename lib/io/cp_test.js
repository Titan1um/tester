const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const cp = require('./cp');
const rm = require('./rm');

var dstPath = path.join(__dirname, 'testDstDir'),
    srcPath = path.join(__dirname, 'testSrcDir'),
    testFileSrc = path.join(__dirname, 'testFile'),
    testFileDst = path.join(__dirname, 'testFile');

describe('/lib/io/cp.js', () => {
    it('文件不存在', async () => {
        await cp('', dstPath);
        assert.ok(!fs.existsSync(dstPath));
    });

    it('复制文件', async () => {
        await util.promisify(fs.writeFile)(testFileSrc, 'test');

        await cp(testFileSrc, testFileDst);
        assert.strictEqual(fs.existsSync(testFileSrc), true, '出错');

        for (let filePath of [testFileSrc, testFileDst]) {
            await rm(filePath);
        }
    });

    it('复制目录', async () => {
        await util.promisify(fs.mkdir)(srcPath, 0777);
        for (let depth = 0; depth < 2; depth++) {
            await util.promisify(fs.writeFile)(path.join(srcPath, Math.random().toString(36).slice(2)), 'test');
        }

        await cp(srcPath, dstPath);
        assert.strictEqual(fs.existsSync(dstPath), true, '出错了');

        for (let dirPath of [srcPath, dstPath]) {
            await rm(dirPath);
        }
    });

    it('dst父目录不存在复制文件', async () => {
        await util.promisify(fs.writeFile)(testFileSrc, 'test');

        let dstPath = path.join(__dirname, 'a', 'b', 'c.txt');
        await cp(testFileSrc, dstPath);

        assert.ok(fs.existsSync(dstPath));
        await rm(testFileSrc);
        await rm(path.join(__dirname, 'a'));
    });

    it('dst父目录不存在复制目录', async () => {
        await util.promisify(fs.mkdir)(srcPath);
        await util.promisify(fs.writeFile)(path.join(srcPath, 'test.txt'), 'test');

        let dstPath = path.join(__dirname, 'a', 'b');
        await cp(srcPath, dstPath);

        assert.ok(fs.existsSync(path.join(dstPath, 'test.txt')));
        await rm(srcPath);
        await rm(path.join(__dirname, 'a'));
    });
});