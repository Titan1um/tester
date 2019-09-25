const assert = require('assert');
const self = require('./index');

describe('/lib/str', () => {
    describe('.rand(length)', () => {
        it('ok', () => {
            let dict = {};
            for (let i = 0; i < 1000; i++) {
                let s = self.rand(10);
                dict[s] = dict[s] || 0;
                dict[s]++;
            }
            for (let k in dict) {
                assert.equal(dict[k], 1);
            }
        });
    });

    describe('.randID()', () => {
        it('ok', () => {
            let id = self.randID();
            assert.ok(id && id.length > 0);
        });
    });
});