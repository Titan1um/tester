const assert = require('assert');
const fs = require('fs');
const Path = require('path');
const util = require('util');

const fileHelper = require('./index');

var dstPath = 'D:\\testDstDir',
    srcPath = 'D:\\testSrcDir',
    testFileSrc = 'D:\\testFile',
    testFileDst = Path.join(__dirname, 'testFile');

describe('/lib/io', () => {
    describe('.cp(src, dst)', () => {
        it('文件不存在', async () => {
            await fileHelper.cp('', dstPath);
            assert.ok(!fs.existsSync(dstPath));
        });

        it('复制文件', async () => {
            await util.promisify(fs.writeFile)(testFileSrc, 'test');

            await fileHelper.cp(testFileSrc, testFileDst);
            assert.strictEqual(fs.existsSync(testFileSrc), true, '出错');

            for (let path of [testFileSrc, testFileDst]) {
                await fileHelper.rm(path);
            }
        });

        it('复制目录', async () => {
            for (let depth = 0; depth < 2; depth++) {
                await util.promisify(fs.mkdir)(srcPath, 0777);
                await util.promisify(fs.writeFile)(Path.join(srcPath, Math.random().toString(36).slice(2)), 'test');
                srcPath = Path.join(srcPath, Math.random().toString(36).slice(2));
            }

            srcPath = 'D:\\testSrcDir';
            await fileHelper.cp(srcPath, dstPath);
            assert.strictEqual(fs.existsSync(dstPath), true, '出错了');

            for (let path of [srcPath, dstPath]) {
                await fileHelper.rm(path);
            }
        });
    });

    describe('.mkdir(src)', () => {
        it('创建多级目录', async () => {
            let srcPath = Path.join(__dirname, 'a', 'b', 'c', 'd');;
            await fileHelper.mkdir(srcPath);

            assert.ok(fs.existsSync(srcPath));
            await fileHelper.rm(Path.join(__dirname, 'a'));
        });
    });

    describe('.rm(src)', () => {
        it('删除文件', async () => {
            await util.promisify(fs.writeFile)(testFileSrc, 'test');

            await fileHelper.rm(testFileSrc);
            assert.strictEqual(fs.existsSync(testFileSrc), false, '出错了');
        });

        it('删除目录', async () => {
            for (let depth = 0; depth < 2; depth++) {
                await util.promisify(fs.mkdir)(srcPath, 0777);
                await util.promisify(fs.writeFile)(Path.join(srcPath, Math.random().toString(36).slice(2)), 'test');
                srcPath = Path.join(srcPath, Math.random().toString(36).slice(2));
            }

            srcPath = 'D:\\testSrcDir';
            await fileHelper.rm(srcPath);
            assert.equal(fs.existsSync(srcPath), false, '出错了');
        });
    });

    describe('.mv(src, dst)', () => {
        it('文件不存在', async () => {
            await fileHelper.mv('', dstPath);
            assert.equal(fs.existsSync(dstPath), false, '出错了');
        });

        it('移动文件', async () => {
            await util.promisify(fs.writeFile)(testFileSrc, 'test');

            await fileHelper.mv(testFileSrc, testFileDst);
            assert.equal(fs.existsSync(testFileDst), true, '出错了');

            await fileHelper.rm(testFileDst);
        });

        it('移动目录', async () => {
            for (let depth = 0; depth < 2; depth++) {
                await util.promisify(fs.mkdir)(srcPath, 0777);
                await util.promisify(fs.writeFile)(Path.join(srcPath, Math.random().toString(36).slice(2)), 'test');
                srcPath = Path.join(srcPath, Math.random().toString(36).slice(2));
            }

            srcPath = 'D:\\testSrcDir';
            await fileHelper.mv(srcPath, dstPath);
            assert.equal(fs.existsSync(dstPath), true, '出错了');

            await fileHelper.rm(dstPath);
        });
    });
});