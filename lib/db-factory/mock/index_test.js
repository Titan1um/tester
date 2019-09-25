const assert = require('assert');

const dbFactory = require('../index');
const mock = require('./index');

dbFactory.set(new mock.Factory());

describe('/lib/db-factory/mock/index', () => {
    describe('flushAll', () => {
        it('正常运行', () => {
            let db = dbFactory.db('test');
            db.add({
                id: 1
            });
            db.add({
                id: 2
            });
            let beforeFlushRes = db.query().toArray();
            assert.strictEqual(beforeFlushRes.length, 2);
            mock.flushAll();

            let afterFlushRes = db.query().toArray();
            assert.strictEqual(afterFlushRes.length, 0);
        })
    });
});