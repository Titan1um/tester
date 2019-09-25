const assert = require('assert')

const Net = require('./manager');
const sdk = require('../../sdk');

let enumAttrs = [{
        key: 'idle',
        value: 0,
        text: '空闲'
    },
    {
        key: 'running',
        value: 1,
        text: '执行中'
    },
    {
        key: 'completed',
        value: 2,
        text: '完成'
    }
];

describe('/lib/enum/net/manager.js', () => {
    describe('.all', () => {
        it('err', async () => {
            let err;
            sdk.init({
                call: () => {
                    throw new Error('error');
                }
            });
            try {
                await new Net().all('allName', 'allAppName');
            } catch (error) {
                err = error;
            }
            assert.equal(err.message, 'error');
        });

        it('success', async () => {
            let res, err, reqAppName, reqRoute, reqData;
            sdk.init({
                call: (appName, route, data) => {
                    reqAppName = appName;
                    reqRoute = route;
                    reqData = data;
                    return {
                        allName: enumAttrs
                    };
                }
            });
            try {
                res = await new Net('allName', 'allAppName').all();
            } catch (error) {
                err = error;
            }
            assert.ifError(err);
            assert.equal(reqAppName, 'allAppName');
            assert.equal(reqRoute, '/enum/find');
            assert.deepEqual(reqData, {
                name: 'allName'
            });
            assert.deepEqual(res, enumAttrs);
        });
    });

    describe('.has', () => {
        it('success', async () => {
            let res, err;
            sdk.init({
                call: () => {
                    return {
                        hasName: enumAttrs
                    };
                }
            });
            try {
                res = await new Net('hasName', 'hasAppName').has('running');
            } catch (error) {
                err = error;
            }
            assert.ifError(err);
            assert.ok(res);
        });
    });

    describe('.get', () => {
        it('success', async () => {
            let res, err;
            sdk.init({
                call: () => {
                    return {
                        getName: enumAttrs
                    };
                }
            });
            try {
                res = await new Net('getName', 'getAppName').get('running');
            } catch (error) {
                err = error;
            }
            assert.ifError(err);
            assert.deepEqual(res, {
                key: 'running',
                text: '执行中',
                value: 1
            });
        });
    });
});