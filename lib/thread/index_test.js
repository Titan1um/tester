const assert = require('assert');

const self = require('./index');

async function sleep(cb) {
    return new Promise((s, f) => {
        setTimeout(() => {
            cb(s, f);
        }, 100);
    });
}

describe('lib/thread', () => {
    describe('.run(p, s, f)', () => {
        it('async function', () => {
            let run = false;
            try {
                self.run(async () => {
                    run = true;
                    throw new Error('err');
                });
            } catch (ex) {
                assert.ifError(ex);
            }
            assert.ok(run);
        });

        it('normal function', () => {
            let run = false;
            try {
                self.run(() => {
                    run = true;
                });
            } catch (ex) {
            }
            assert.ok(run);
        });

        it('promise', () => {
            try {
                self.run(sleep((_, f) => {
                    f('err')
                }));
            } catch (ex) {
                assert.ifError(ex);
            }
        });
    });
});