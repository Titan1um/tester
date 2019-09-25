const assert = require('assert');
const path = require('path');

const Self = require('./copy');

let gitDir = path.join(__dirname, 'test');

describe('upgrade/copy', () => {
    describe('.handle(ctx)', () => {
        it('ok', async () => {
            let files = [
                [
                    'api', 'a.js'
                ],
                [
                    'api', 'b.js'
                ],
            ];
            let ctx = {
                gitDir: gitDir
            };
            let arr = [];
            await new Self(files, (src, dst) => {
                arr.push({
                    src: src,
                    dst: dst
                });
            }).handle(ctx);
            assert.deepEqual(arr, [{
                src: path.join(__dirname, 'test', 'api', 'a.js'),
                dst: path.join(__dirname, '..', 'api', 'a.js'),
            }, {
                src: path.join(__dirname, 'test', 'api', 'b.js'),
                dst: path.join(__dirname, '..', 'api', 'b.js'),
            }, ]);
        });
    });
});