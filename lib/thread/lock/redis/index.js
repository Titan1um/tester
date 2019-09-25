const redis = require('../../../redis');

let redisName = 'distributeLock';

class redisLock {
    async lock(key, expires) {
        let res = await redis.get(redisName).setnx(key, 1, 'ex', expires, 'nx');
        return res == 1;
    }

    async unlock(key) {
        await redis.get(redisName).del(key);
    }
}

module.exports = redisLock;