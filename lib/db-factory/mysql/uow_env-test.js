const assert = require('assert');

const Conn = require('./conn');
const Query = require('../sql/query');
const SqlMaker = require('../sql/sql-maker');
const Uow = require('../sql/uow');

let conn = new Conn({
    host: '10.47.133.237',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'lite-db'
});
let sqlMaker = new SqlMaker(0, Number.MAX_SAFE_INTEGER);

describe('/lib/db-factory/mysql/uow.js', () => {
    describe('.commit()', () => {
        after(() => {
            conn.pool.end();
        });

        beforeEach(async function () {
            await conn.exec([{
                sql: 'CREATE TABLE testTable (id int,name varchar(255),password varchar(255))'
            }])
        });

        afterEach(async function () {
            await conn.exec([{
                sql: 'DROP TABLE testTable'
            }]);
        });

        it('更新且只有一条', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'name1\',\'password1\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'2\',\'name2\',\'password2\')'
            }]);

            let u = new Uow(conn, sqlMaker);
            u.registerSave('testTable', {
                id: 1,
                name: 'change_name',
                password: 'change_password'
            });
            await u.commit();

            let q = new Query(conn, 'testTable', sqlMaker);
            q.where('id = ?', 1);
            let result = await q.toArray();
            assert.equal(result[0]['name'], 'change_name');
            assert.equal(result[0]['password'], 'change_password');
        });

        it('删除和插入', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'111\',\'111\')'
            }, {
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'3\',\'333\',\'333\')'
            }]);

            let u = new Uow(conn, sqlMaker);
            u.registerRemove('testTable', {
                id: 1,
                name: 'test',
                password: 'test'
            });
            u.registerAdd('testTable', {
                id: 4,
                name: 'name4',
                password: 'password4'
            });
            await u.commit();

            let q = new Query(conn, 'testTable', sqlMaker);
            q.where('id = ?', 4);
            let result = await q.toArray();
            assert.equal(result[0]['name'], 'name4');
            assert.equal(result[0]['password'], 'password4');
            q.where('id = ?', 1);
            let count = await q.count();
            assert.equal(count, 0);
        });

        it('错误语句', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'111\',\'111\')'
            }]);

            let u = new Uow(conn, sqlMaker);
            u.registerSave('AAAA', {
                id: 3013,
                name: 'test',
                password: 'test'
            });

            try {
                await u.commit();
            } catch (err) {
                assert.equal(err.code, 'ER_NO_SUCH_TABLE');
            }
        });

        it('回滚事务', async () => {
            await conn.exec([{
                sql: 'INSERT INTO testTable (id,name,password) VALUES (\'1\',\'111\',\'111\')'
            }]);

            let u = new Uow(conn, sqlMaker);
            u.registerAdd('testTable', {
                id: 3201,
                name: 'test',
                password: 'test'
            });
            u.registerSave('AAAA', {
                id: 3017,
                name: 'change',
                password: 'change'
            });

            try {
                await u.commit();
            } catch (err) {
                assert.equal(err.code, 'ER_NO_SUCH_TABLE', '事务错误');
                let q = new Query(conn, 'testTable', sqlMaker);
                let count = await q.where('id = ?', 3201).count();
                assert.equal(count, 0);
            }
        });
    });
});