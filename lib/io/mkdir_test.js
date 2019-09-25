const assert = require('assert');
const fs = require('fs');
const path = require('path');

const self = require('./mkdir');
const rm = require('./rm');

var dstPath = path.join(__dirname, 'a', 'b', 'c', 'd');;

describe('/lib/io/mkdir', () => {
    after(async () => {
        await rm(path.join(__dirname, 'a'));
    });

    describe('mkdir', () => {
        it('success', async () => {
            await self(dstPath);
            assert.ok(fs.existsSync(dstPath));
        });

        it('file', async () => {
            let filePath = path.join(dstPath, 'e.txt');
            await self(filePath, true);

            assert.ok(fs.existsSync(dstPath));
            assert.ok(
                !fs.existsSync(filePath)
            );
        });
    });
});