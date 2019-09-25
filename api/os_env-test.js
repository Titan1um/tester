const assert = require('assert');

const self = require('./os');
const os = require('../lib/os/index');

describe('api/os.js', () => {
    it('success', async () => {
        await os.init();
        let version = await self.version.fn();
        assert.strictEqual(version, os.getEnvWithThrow('VERSION'));
    });
});