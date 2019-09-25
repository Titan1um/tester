const assert = require('assert');

const Self = require('./index');

let cfg = {
    userName: 'test',
    password: 'test',
    url: 'http://test',
    projectID: 1,
};
let rancher;

describe('lib/rancher', () => {
    describe('addService', () => {
        before(() => {
            rancher = new Self(
                cfg, {
                    postFunc: (data, cb) => {
                        switch (data.body.name) {
                            case 'group-addFail':
                                cb(new Error('创建rancherService 失败!'), null, null);
                            case 'group-reqFail':
                                cb(new Error('请求失败'), null, null);
                            case 'group-success':
                                cb(null, null, {});
                        }
                    },
                }
            );
        });

        it('请求错误', async () => {
            let err;
            try {
                await rancher.addService('group', 'reqFail', '', '');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '请求失败');
        });

        it('创建rancherService 失败!', async () => {
            let err;
            try {
                await rancher.addService('group', 'addFail', '', '');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '创建rancherService 失败!')
        });

        it('success', async () => {
            assert.ifError(await rancher.addService('group', 'success', '', ''));
        });
    });

    describe('addWebHook', () => {
        before(() => {
            rancher = new Self(
                cfg, {
                    postFunc: (data, cb) => {
                        switch (data.body.name) {
                            case 'group-addFail-upgrade':
                                cb(null, null, {
                                    type: 'error',
                                    message: '添加错误'
                                });
                            case 'group-reqFail-upgrade':
                                cb(new Error('请求错误'), null, null);
                            case 'group-success-upgrade':
                                cb(null, null, 'success');
                        }
                    }
                }
            );
        });

        it('请求错误', async () => {
            let err;
            try {
                await rancher.addWebHook('group', 'reqFail');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '请求错误');
        });

        it('添加错误', async () => {
            let err;
            try {
                await rancher.addWebHook('group', 'addFail');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '添加错误');
        });

        it('success', async () => {
            let res = await rancher.addWebHook('group', 'success');
            assert.equal(res, 'success');
        });
    });

    describe('getService', () => {
        it('请求错误', async () => {
            rancher = new Self(
                cfg, {
                    getFunc: (data, cb) => {
                        cb(new Error('请求错误'), null, null);
                    }
                }
            );

            let err;
            try {
                await rancher.getService('group-reqFail');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '请求错误');
        });

        it('获取错误', async () => {
            rancher = new Self(
                cfg, {
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            message: '获取错误',
                            type: 'error',
                        })
                    }
                }
            );

            let err;
            try {
                await rancher.getService('group', 'success');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '获取错误');
        });

        it('success', async () => {
            rancher = new Self(
                cfg, {
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            data: [{
                                name: 'group-success'
                            }]
                        });
                    }
                }
            );

            let res = await rancher.getService('group', 'success');
            assert.equal(res.name, 'group-success');
        });
    });

    describe('getWebHook', () => {
        it('请求错误', async () => {
            rancher = new Self(
                cfg, {
                    getFunc: (data, cb) => {
                        cb(new Error('请求错误'), null, null);
                    }
                }
            );

            let err;
            try {
                await rancher.getWebHook('group', 'reqFail');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '请求错误');
        });

        it('获取错误', async () => {
            rancher = new Self(
                cfg, {
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            message: '获取错误',
                            type: 'error',
                        })
                    }
                }
            );

            let err;
            try {
                await rancher.getWebHook('group', 'success');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '获取错误');
        });

        it('success', async () => {
            rancher = new Self(
                cfg, {
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            data: [{
                                name: 'group-success-upgrade'
                            }]
                        });
                    }
                }
            );

            let res = await rancher.getWebHook('group', 'success');
            assert.equal(res.name, 'group-success-upgrade');
        });
    });

    describe('removeService', () => {
        it('请求错误', async () => {
            rancher = new Self(
                cfg, {
                    deleteFunc: (data, cb) => {
                        cb(new Error('请求错误'), null, null);
                    },
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            data: [{
                                id: 1,
                                name: 'group-success'
                            }]
                        })
                    }
                }
            );

            let err;
            try {
                await rancher.removeService('group', 'success');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '请求错误');
        });

        it('success', async () => {
            rancher = new Self(
                cfg, {
                    deleteFunc: (data, cb) => {
                        cb(null, null, 1);
                    },
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            data: [{
                                id: 1,
                                name: 'group-success'
                            }]
                        })
                    }
                }
            );

            let res = await rancher.removeService('group', 'success');
            assert.equal(res, 1);
        });
    });

    describe('removeWebHook', () => {
        it('请求错误', async () => {
            rancher = new Self(
                cfg, {
                    deleteFunc: (data, cb) => {
                        cb(new Error('请求错误'), null, null);
                    },
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            data: [{
                                id: 1,
                                name: 'group-success-upgrade'
                            }]
                        })
                    }
                }
            );

            let err;
            try {
                await rancher.removeWebHook('group', 'success');
            } catch (ex) {
                err = ex;
            }
            assert.equal(err.message, '请求错误');
        });

        it('success', async () => {
            rancher = new Self(
                cfg, {
                    deleteFunc: (data, cb) => {
                        cb(null, null, 1);
                    },
                    getFunc: (data, cb) => {
                        cb(null, null, {
                            data: [{
                                id: 1,
                                name: 'group-success-upgrade'
                            }]
                        })
                    }
                }
            );

            let res = await rancher.removeWebHook('group', 'success');
            assert.equal(res, 1);
        });
    });
});