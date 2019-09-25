const assert = require('assert');
const fs = require('fs');
const path = require('path');
const util = require('util');

const Conn = require('./conn');
const Query = require('../sql/query');
const SqlMaker = require('../sql/sql-maker');
const Uow = require('../sql/uow');

let connCfg = {
    filePath: path.join(__dirname, 'sqlite-test-uow.db')
};
let conn = new Conn(connCfg);
let sqlMaker = new SqlMaker(-1, -1);

describe('/lib/db-factory/sqlite/uow.js', () => {
    after(async () => {
        await new Promise(s => {
            conn.db.close(() => {
                s();
            });
        });
        await util.promisify(fs.unlink)(connCfg.filePath);
    });

    describe('.commit()', () => {
        beforeEach(async () => {
            await conn.exec([{
                sql: 'CREATE TABLE testTable (id int,name varchar(255),password varchar(255))'
            }])
        });

        afterEach(async () => {
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

            let result = await new Query(conn, 'testTable', sqlMaker).where('id = ?', 1).toArray();
            assert.deepEqual(result, [{
                id: '1',
                name: 'change_name',
                password: 'change_password',
            }]);
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
            let result = await q.where('id = ?', 4).toArray();
            assert.deepEqual(result, [{
                id: '4',
                name: 'name4',
                password: 'password4',
            }]);

            let count = await q.where('id = ?', 1).count();
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

            let err;
            try {
                await u.commit();
            } catch (error) {
                err = error;
            }
            assert.equal(err.message, 'SQLITE_ERROR: no such table: AAAA');
            assert.equal(err.code, 'SQLITE_ERROR');
        });
    });
});