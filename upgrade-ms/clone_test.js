const assert = require('assert');

const Self = require('./clone');

describe('upgrade/clone', () => {
    describe('.handle(ctx)', () => {
        it('ok', async () => {
            let ctx = {};
            await new Self(s => {
                ctx.cmd = s;
            }).handle(ctx);
            assert.equal(ctx.cmd, `git clone https://gitlab-sz.dianchu.cc/lite/nodejs-ms-tpl.git ${ctx.gitDir}`)
        });
    });
});