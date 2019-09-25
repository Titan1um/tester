const assert = require('assert');

const self = require('./os');
const os = require('../lib/os/index');

describe('api/os.js', () => {
    it('success', async () => {
        os.mock('VERSION', '0.0.1');
        let version = await self.version.fn();
        assert.strictEqual(version, '0.0.1');
    });
});