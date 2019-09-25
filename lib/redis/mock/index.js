const moment = require('moment');

class Mock {
    constructor() {
        console.log('mock redis');
        this.str = {};
        this.hash = {};
    }

    close() {}

    del(key) {
        delete this.str[key];
    }

    expire(key, seconds) {
        setExpires(this, key, dt => {
            dt.setSeconds(
                dt.getSeconds() + seconds
            );
        });
    }

    get(key) {
        let item = this.str[key];
        return item && (!item.expired || item.expired > new Date()) ? item.value : null;
    }

    hdel(hash, f) {
        if (!this.hash[hash] || !this.hash[hash][f])
            return;

        delete this.hash[hash][f];
    }

    hget(hash, k) {
        return this.hash[hash] && this.hash[hash][k];
    }

    hkeys(hash) {
        if (!this.hash[hash])
            return [];

        return Object.keys(this.hash[hash]);
    }

    hset(hash, f, v) {
        setHashValue(this, hash, f, v);
    }

    hsetnx(hash, f, v) {
        if (this.hash[hash] && this.hash[hash][f])
            return;

        setHashValue(this, hash, f, v);
    }

    pexpire(key, milliseconds) {
        setExpires(this, key, dt => {
            dt.setMilliseconds(
                dt.getMilliseconds() + milliseconds
            );
        });
    }

    set(key, value, ...args) {
        let [expryMode = '', time = 1, setMode = ''] = args;
        if (time <= 0)
            return;

        expryMode = expryMode.toLowerCase();
        setMode = setMode.toLowerCase();
        if (expryMode == 'nx' || setMode == 'nx') {
            if (this.str[key])
                return;
        } else if (expryMode == 'xx' || setMode == 'xx') {
            if (!this.str[key])
                return;
        }

        setValue(this, key, value);
        if (expryMode == 'ex') {
            this.expire(key, time);
        } else if (expryMode == 'px') {
            this.pexpire(key, time);
        }
        return 'OK';
    }

    setex(key, seconds, value) {
        let res = setValue(this, key, value);
        this.expire(key, seconds);
        return res;
    }

    setnx(key, value) {
        if (this.str[key])
            return;

        return setValue(this, key, value)
    }

    time() {
        return [
            moment().unix().toString(),
            '0'
        ];
    }

    ttl(key) {
        let value = this.str[key];
        if (!value)
            return -2;

        if (!value.expired)
            return -1;

        return (value.expired - new Date()) / 1000;
    }
}

function setExpires(self, key, setTime) {
    let item = self.str[key];
    if (item) {
        var dt = new Date();
        setTime(dt);
        item.expired = dt;
    }
}

function setHashValue(self, hash, field, value) {
    if (!self.hash[hash])
        self.hash[hash] = {};
    self.hash[hash][field] = value;
}

function setValue(self, key, value) {
    self.str[key] = {
        value: value
    };
    return 'OK';
}

module.exports = Mock;