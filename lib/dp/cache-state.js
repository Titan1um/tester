const redis = require('../redis');
const time = require('../time');

class CacheState {
    constructor(hash, field, redisName) {
        // distribute cache time
        this.hash = `dct-${hash}`;
        this.field = field;
        this.redisName = redisName;
        this.modifiedOn = 0;
    }


    async isChanged() {
        let value = await redis.get(this.redisName).hget(this.hash, this.field);
        return value > this.modifiedOn;
    }

    async updateState() {
        let unix = await time.unix();
        await redis.get(this.redisName).hset(this.hash, this.field, unix);
        this.modifiedOn = unix;
    }
}

module.exports = CacheState;