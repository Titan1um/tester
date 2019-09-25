const assert = require('assert');

const Self = require('./auth');

describe('lib/cor/mvc/auth.js', () => {
    describe('.handle', () => {
        it('ctx.err', async () => {
            let ctx = {
                err: 1
            };
            let ok = false;
            await new Self('', {
                createNullUserFunc: () => {
                    ok = true;
                }
            }).handle(ctx);
            assert.equal(ok, false);
            assert.equal(ctx.err, 1);
        });

        it('no sessionID', async () => {
            let ctx = {
                action: {}
            };
            await new Self('', {
                createUserFunc: () => {
                    return {
                        isNull: 1
                    };
                }
            }).handle(ctx);
            assert.ok(ctx.err);
            assert.equal(ctx.err.code, 99);
        });

        it('no sessionID and unauth', async () => {
            let ctx = {
                action: {
                    unauth: 1
                }
            };
            await new Self('', {
                createUserFunc: () => {
                    return {
                        isNull: 1
                    }
                }
            }).handle(ctx);
            assert.ifError(ctx.err);
        });

        it('has sessionID', async () => {
            let ctx = {
                action: {}
            };
            let isCalled = false;
            await new Self('', {
                createUserFunc: () => {
                    return {
                        sdk: {
                            call: () => {
                                isCalled = true;
                            }
                        },
                        sessionID: 'sessionID',
                        isNull: 1
                    };
                }
            }).handle(ctx);
            assert.equal(isCalled, true);
            assert.ok(ctx.err);
            assert.equal(ctx.err.code, 99);
        });

        it('has sessionID and has user', async () => {
            let ctx = {
                action: {}
            };
            let entry;
            await new Self('', {
                createUserFunc: () => {
                    return {
                        sdk: {
                            call: () => {
                                return {
                                    id: 'has sessionID and has user'
                                }
                            }
                        },
                        sessionID: 'sessionID',
                        isNull: 1,
                        setEntry: res => entry = res
                    };
                }
            }).handle(ctx);
            assert.deepEqual(entry, {
                id: 'has sessionID and has user'
            });
        });
    });
});