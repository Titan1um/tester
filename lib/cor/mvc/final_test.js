const assert = require('assert');

const Self = require('./final');
const Exception = require('../../os/exception');

describe('lib/cor/mvc/final', () => {
    describe('.handle', () => {
        it('no err', async () => {
            let res;
            let ctx = {
                resp: {
                    json: _res => {
                        res = _res;
                    }
                }
            };
            await new Self(null, () => {}).handle(ctx);
            assert.deepEqual(res, {
                err: 0,
                data: undefined
            });
        });

        it('err is Exception', async () => {
            let res;
            let ctx = {
                err: new Exception(55, 'ex'),
                resp: {
                    json: _res => {
                        res = _res;
                    }
                }
            };
            let hasMock;
            await new Self(null, () => {
                hasMock = true;
            }).handle(ctx);
            assert.equal(hasMock, undefined);
            assert.deepEqual(res, {
                err: 55,
                data: 'ex'
            });
        });

        it('err is Exception and code > 500', async () => {
            let res;
            let ctx = {
                err: new Exception(999, 'ex'),
                resp: {
                    json: _res => {
                        res = _res;
                    }
                }
            };
            let hasMock;
            await new Self(null, () => {
                hasMock = true;
            }).handle(ctx);
            assert.equal(hasMock, undefined);
            assert.deepEqual(res, {
                err: 500,
                data: 'ex'
            });
        });

        it('err no Exception', async () => {
            let res;
            let ctx = {
                err: new Error('error'),
                resp: {
                    json: _res => {
                        res = _res;
                    }
                }
            };
            let hasMock;
            await new Self(null, () => {
                hasMock = true;
                return new Exception(66, 'ee');
            }).handle(ctx);
            assert.equal(hasMock, true);
            assert.deepEqual(res, {
                err: 66,
                data: 'ee'
            });
        });
    });
});