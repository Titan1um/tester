const assert = require('assert');

const Uow = require('./uow');

let mockCache = {};
let idAssert = (oldItem, newItem) => {
    return oldItem.ID == newItem.ID;
};
const table = 'test';

describe('lib/db-factory/mock/uow', () => {
    beforeEach(() => {
        mockCache[table] = {
            data: []
        }
    });

    describe('.commit', () => {
        it('事务队列为空', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.commit();
            assert.deepEqual(mockCache[table]['data'], [], '事务提交有误');
        });

        it('事务队列不为空', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            uow.commit();
            assert.notDeepEqual(mockCache[table]['data'], [], '事务操作有误');
        });
    });

    describe('.registerAdd', () => {
        it('添加操作(不提交)', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            assert.deepEqual(mockCache[table]['data'], [], '添加操作事务有误');
        });

        it('添加操作(提交)', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            uow.commit();
            assert.notDeepEqual(mockCache[table]['data'], [], '添加操作事务有误');
        });
    });

    describe('.registerRemove', async () => {
        it('删除操作(不提交)', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            uow.commit();
            uow.registerRemove(table, {
                ID: 1
            });
            assert.notDeepEqual(mockCache[table]['data'], [], '删除操作事务有误');
        });

        it('删除操作(提交)', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            uow.commit();
            uow.registerRemove(table, {
                ID: 1
            });
            uow.commit();
            assert.deepEqual(mockCache[table]['data'], [], '删除操作事务有误');
        });
    });

    describe('.registerSave', () => {
        it('修改操作(不提交)', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            uow.commit();
            uow.registerSave(table, {
                ID: 1,
                name: 'save'
            });
            assert.equal(mockCache[table]['data'][0].name, 'test', '修改操作事务有误');
        });

        it('修改操作(提交)', () => {
            let uow = new Uow(mockCache, idAssert);
            uow.registerAdd(table, {
                ID: 1,
                name: 'test'
            });
            uow.commit();
            uow.registerSave(table, {
                ID: 1,
                name: 'save'
            });
            uow.commit();
            assert.equal(mockCache[table]['data'][0].name, 'save', '修改操作事务有误');
        });
    });
});