const assert = require('assert');

const Self = require('./strlen.js')

describe('lib/cor/mvc/validator/strlen', () => {
    describe('.vaild(v)', () => {
        it('可空或Null', () => {
            let valid = new Self({
                max: 2
            });

            assert.ok(
                valid.valid(null)
            );

            assert.ok(
                valid.valid('')
            );
        });

        it('不限长度', () => {
            assert.ok(
                new Self({
                    min: 2
                }).valid('teststr')
            );
        });

        it('长度区间内', () => {
            let valid = new Self({
                min: 3,
                max: 5
            });

            assert.ok(
                valid.valid('str')
            );

            assert.ok(
                valid.valid('test')
            );
        });

        it('超出长度区间', () => {
            let valid = new Self({
                min: 4,
                max: 6
            });

            assert.ok(
                !valid.valid('str')
            );

            assert.ok(
                !valid.valid('strTest')
            );
        });
    })
});