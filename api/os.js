const os = require('../lib/os/index');

exports.version = {
    fn: async () => {
        return os.getEnvWithThrow('VERSION');
    },
    unauth: true
};