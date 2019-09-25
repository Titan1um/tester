const moment = require('moment');

const redisAccessor = require('../redis');

exports.redisName = 'time-redis';

exports.fromUnix = unix => {
    return moment.unix(unix).toDate();
};

exports.unix = async function () {
    let redis = redisAccessor.tryGet(this.redisName);
    if (redis) {
        let res = await redis.time();
        return parseInt(res[0]);
    }
    
    return moment().unix();
};