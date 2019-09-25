const assert = require('assert');

const Query = require('./query');

let mockCache = {};
const table = 'test';

describe('lib/db-factory/mock/query', () => {
    beforeEach(() => {
        mockCache[table] = {
            whereFunc: (r, args) => {
                return r.ID == args[1];
            },
            data: [{
                ID: 3,
                name: 'test3',
                key: 'key1'
            }, {
                ID: 1,
                name: 'test1',
                key: 'key1'
            }, {
                ID: 2,
                name: 'test2',
                key: 'key2'
            }]
        }
    });

    describe('.count', () => {
        it('数据为空(无条件)', () => {
            mockCache[table]['data'] = [];

            assert.equal(new Query(table, mockCache).count(), 0, 'count操作有误')
        });

        it('数据为空(有条件)', () => {
            mockCache[table]['data'] = [];

            assert.equal(new Query(table, mockCache).where('ID = ?', 1).count(), 0, 'count操作有误');
        });

        it('数据不为空(无条件)', () => {
            assert.equal(new Query(table, mockCache).count(), 3, 'count操作有误');
        });

        it('数据不为空(有条件)', () => {
            assert.equal(new Query(table, mockCache).where('ID = ?', 1).count(), 1, 'count操作有误');
        });
    });


    describe('.order', () => {
        it('单独正序条件', () => {
            let orderResults = new Query(table, mockCache).order('ID').toArray();
            assert.equal(orderResults[0]['ID'], '1');
            assert.equal(orderResults[1]['ID'], '2');
            assert.equal(orderResults[2]['ID'], '3');
        });

        it('多正序条件', () => {
            let orderResults = new Query(table, mockCache).order('key', 'ID').toArray();
            assert.equal(orderResults[0]['ID'], '1');
            assert.equal(orderResults[1]['ID'], '3');
            assert.equal(orderResults[2]['ID'], '2');
        });
    });

    describe('.orderByDesc', () => {
        it('单独倒序条件', () => {
            let orderResults = new Query(table, mockCache).orderByDesc('ID').toArray();
            assert.equal(orderResults[0]['ID'], '3');
            assert.equal(orderResults[1]['ID'], '2');
            assert.equal(orderResults[2]['ID'], '1');
        });

        it('多倒序条件', async () => {
            let orderResults = new Query(table, mockCache).orderByDesc('key', 'ID').toArray();
            assert.equal(orderResults[0]['ID'], '2');
            assert.equal(orderResults[1]['ID'], '3');
            assert.equal(orderResults[2]['ID'], '1');
        });

        it('混合正序倒序', () => {
            let orderResults = new Query(table, mockCache).order('key').orderByDesc('ID').toArray();
            assert.equal(orderResults[0]['ID'], '3');
            assert.equal(orderResults[1]['ID'], '1');
            assert.equal(orderResults[2]['ID'], '2');
        });
    });

    describe('.skip', () => {
        it('跳过1个', () => {
            assert.equal(new Query(table, mockCache).skip(1).toArray().length, 2, 'skip操作有误');
        });

        it('oder skip', () => {
            let res = new Query(table, mockCache).orderByDesc('ID').skip(1).toArray();
            assert.deepEqual(res, [{
                ID: 2,
                name: 'test2',
                key: 'key2'
            }, {
                ID: 1,
                key: 'key1',
                name: 'test1'
            }]);
        });
    });

    describe('.take', () => {
        it('取前2个', () => {
            assert.equal(new Query(table, mockCache).take(2).toArray().length, 2, 'skip操作有误')
        });

        it('oder take', () => {
            let res = new Query(table, mockCache).orderByDesc('ID').take(2).toArray();
            assert.deepEqual(res, [{
                    ID: 3,
                    name: 'test3',
                    key: 'key1'
                },
                {
                    ID: 2,
                    name: 'test2',
                    key: 'key2'
                }
            ]);
        });
    });

    describe('.toArray', () => {
        it('数据为空(无条件)', () => {
            mockCache[table]['data'] = [];

            assert.deepEqual(new Query(table, mockCache).toArray(), [], 'toArray操作有误');
        });

        it('数据为空(有条件)', () => {
            mockCache[table]['data'] = [];

            assert.deepEqual(new Query(table, mockCache).where('ID = ?', 1).toArray(), [], 'toArray操作有误');
        });

        it('数据不为空(无条件)', () => {
            assert.notDeepEqual(new Query(table, mockCache).toArray(), [], 'toArray操作有误');
        });

        it('数据不为空(有条件)', () => {
            let result = new Query(table, mockCache).where('ID = ?', 1).toArray();
            assert.deepEqual(result, [{
                ID: 1,
                name: 'test1',
                key: 'key1'
            }], 'toArray操作有误');
        });
    });

    describe('.where', () => {
        it('没有条件', () => {
            let result = new Query(table, mockCache).toArray();
            assert.deepEqual(result, [{
                ID: 3,
                name: 'test3',
                key: 'key1'
            }, {
                ID: 1,
                name: 'test1',
                key: 'key1'
            }, {
                ID: 2,
                name: 'test2',
                key: 'key2'
            }], 'where条件筛选有误');
        });

        it('按条件查询', () => {
            let result = new Query(table, mockCache).where('ID = ?', 1).toArray();
            assert.deepEqual(result, [{
                ID: 1,
                name: 'test1',
                key: 'key1'
            }], 'where筛选有误');
        });
    });
});