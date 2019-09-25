const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const Service = require('./service');

const dir = path.join(__dirname, 'test-service');
const filePath = path.join(dir, 'test-service.js');
const mkdirAsync = util.promisify(fs.mkdir);
const rmdirAsync = util.promisify(fs.rmdir);
const unlinkAsync = util.promisify(fs.unlink);
const writeFileAsync = util.promisify(fs.writeFile);

describe('lib/net/mvc/service', () => {
    after(async () => {
        await unlinkAsync(filePath);
        await rmdirAsync(dir);
    });

    before(async () => {
        await mkdirAsync(dir);
        await writeFileAsync(filePath, 'exports.xx = {};');
    });

    describe('.handleFunc', () => {
        it('服务不存在', async () => {
            let ctx = {
                req: {
                    params: {
                        service: 'nonexistent',
                    }
                }
            };

            let service = new Service();
            await service.handle(ctx)

            assert.equal(ctx.service, undefined);
        });

        it('服务存在', async () => {
            let ctx = {
                req: {
                    params: {
                        service: 'test-service',
                    }
                }
            };

            let service = new Service(dir);
            await service.handle(ctx);

            assert.ok(ctx.service);
        });
    });
});