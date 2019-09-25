const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const rm = require('./rm');
const self = require('./scan-file');

describe('/lib/io/scan-file', () => {
    describe('.scanFile', () => {
        it('文件', async () => {
            let res;
            let src = path.join(__dirname, 'scan-file.js');
            let action = (src) => {
                res = src;
            }
            await self(src, action);
            assert.strictEqual(res, src);
        });

        it('路径', async () => {
            let src = path.join(__dirname, 'testDir');
            await util.promisify(fs.mkdir)(src);
            await util.promisify(fs.writeFile)(path.join(src, 'test1.txt'), 'test1');
            await util.promisify(fs.writeFile)(path.join(src, 'test2.txt'), 'test2');
            await util.promisify(fs.writeFile)(path.join(src, 'test3.txt'), 'test3');

            let res = [];
            let action = (src) => {
                res.push(src);
            }
            await self(src, action);

            assert.deepEqual(res, [
                path.join(src, 'test1.txt'),
                path.join(src, 'test2.txt'),
                path.join(src, 'test3.txt'),
            ]);
            await rm(src);
        });
    });
});