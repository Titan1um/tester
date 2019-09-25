const assert = require('assert');

const Self = require('./range');

describe('lib/cor/mvc/validator/range', () => {
    describe('.valid(v)', () => {
        it('范围内', () => {
            assert.ok(
                new Self({
                    min: 0,
                    max: 5
                }).valid(2)
            );
        });
        it('最小值', () => {
            assert.ok(
                new Self({
                    min: 0,
                    max: 5
                }).valid(0)
            );
        });
        it('最大值', () => {
            assert.ok(
                !new Self({
                    min: 0,
                    max: 5
                }).valid(5)
            );
        });
        it('接近最大值', () => {
            assert.ok(
                new Self({
                    min: 0,
                    max: 5
                }).valid(4)
            );
        });
        it('范围外', () => {
            assert.ok(
                !new Self({
                    min: 0,
                    max: 5
                }).valid(-1)
            );
        });
    });
});