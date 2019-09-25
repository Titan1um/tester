const assert = require('assert');

const custom = require('./custom');
const self = require('./index');
const StrLen = require('./strlen');

describe('lib/cor/mvc/validator', () => {
    it('function', () => {
        let v = self(function () {});
        assert.ok(v.constructor, Object);
    });

    it('string', () => {
        let v = self('id');
        assert.deepEqual(v, custom.create('id'));
    });

    it('strlen', () => {
        let v = self(['strlen', {}]);
        assert.ok(v.constructor, StrLen);
    });
});