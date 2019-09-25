const assert = require('assert');
const Maker = require('./sql-maker');

const table = 'model-test';
const where = 'id > ?';
const take = 6;
const skip = 8;
const order = [
    {field: 'id', sortKey: 'ASC'},
    {field: 'name', sortKey: 'DESC'}
];
const maker = new Maker(0, Number.MAX_SAFE_INTEGER);

describe('/lib/db-factory/mysql/sql-maker.js', () => {
    describe('.makeremove()', () => {
        it('只有表', () => {
            let val = maker.makeRemove(table, {
                id: '11',
                name: 'xxx',
                password: 'xxxx'
            });
            assert.equal(
                val.sql,
                `DELETE FROM \`${table}\` WHERE id = ?`
            );
            assert.equal(
                val.args.toString(),
                `11`
            );
        });
    });

    describe('.makeSave()', () => {
        it('只有表', () => {
            let val = maker.makeSave(table, {
                id: '11',
                name: 'xxx',
                password: 'xxxx'
            });
            assert.equal(
                val.sql,
                `UPDATE \`${table}\` SET \`id\` = ? , \`name\` = ? , \`password\` = ? WHERE id = ?`
            );
            assert.equal(
                val.args.toString(),
                '11,xxx,xxxx,11',
            );
        });
    });

    describe('.makeAdd()', () => {
        it('只有表', () => {
            let val = maker.makeAdd(table, {
                id: 110,
                name: 'test',
                password: 'test'
            });
            assert.equal(
                val.sql,
                `INSERT INTO \`${table}\` (\`id\`,\`name\`,\`password\`) VALUES (?,?,?)`
            );
            assert.equal(
                val.args.toString(),
                '110,test,test',
            );
        });
    });

    describe('.makeCount()', () => {
        it('只有表', () => {
            assert.equal(
                maker.makeCount({
                    table: table
                }),
                `SELECT COUNT (id) FROM \`${table}\``
            );
        });

        it('有表和where条件', () => {
            assert.equal(
                maker.makeCount({
                    table: table,
                    whereValue: 'id > ?'
                }),
                `SELECT COUNT (id) FROM \`${table}\` WHERE ${where}`
            );
        });
    });

    describe('.makeSelect()', () => {
        it('只有表', () => {
            assert.equal(
                maker.makeSelect({
                    table: table
                }),
                `SELECT * FROM \`${table}\``
            );
        });

        it('有表和where条件', () => {
            assert.equal(
                maker.makeSelect({
                    table: table,
                    whereValue: 'id > ?'
                }),
                `SELECT * FROM \`${table}\` WHERE ${where}`
            );
        });

        it('有表和order条件', () => {
            assert.equal(
                maker.makeSelect({
                    table: table,
                    orderValues: order
                }),
                `SELECT * FROM \`${table}\` ORDER BY \`id\` ASC,\`name\` DESC`
            );
        });

        it('有表,take条件', () => {
            assert.equal(
                maker.makeSelect({
                    table: table,
                    takeValue: 6
                }),
                `SELECT * FROM \`${table}\` LIMIT 0 , ${take}`
            );
        });

        it('有表,skip条件', () => {
            assert.equal(
                maker.makeSelect({
                    table: table,
                    skipValue: 8
                }),
                `SELECT * FROM \`${table}\` LIMIT ${skip} , ${Number.MAX_SAFE_INTEGER}`
            );
        });

        it('有表,take,skip条件', () => {
            assert.equal(
                maker.makeSelect({
                    table: table,
                    takeValue: 6,
                    skipValue: 8
                }),
                `SELECT * FROM \`${table}\` LIMIT ${skip} , ${take}`
            );
        });

        it('有表,where,order,take,skip条件', () => {
            assert.equal(
                maker.makeSelect({
                    table: table,
                    whereValue: 'id > ?',
                    orderValues: order,
                    takeValue: 6,
                    skipValue: 8
                }),

                `SELECT * FROM \`${table}\` WHERE ${where} ORDER BY \`id\` ASC,\`name\` DESC LIMIT ${skip} , ${take}`
            );
        });
    });
});