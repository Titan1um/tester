const $ = require('underscore');

const MIN_TIMESTAMP = new Date(2000, 1, 1).getTime();
const ipv4Reg = /^(\d{1,3}\.){3}\d{1,3}$/;

let keyOfValid = {
    '标识': v => {
        return $.isString(v) && v.length >= 24 && v.length <= 32;
    },
    '端口': v => {
        return Number.isInteger(v) && v > 0 && v <= 65535
    },
    '分页大小': v => {
        return Number.isInteger(v) && v > 0 && v < 1000;
    },
    '分页页码': v => {
        return Number.isInteger(v) && v > 0 && v < 10000;
    },
    'ipv4': v => {
        return ipv4Reg.test(v) && $.all(
            v.split('.'),
            r => r <= 255
        );
    },
    '可空标识': v => {
        return $.isString(v) && (v == '' || (v.length >= 24 && v.length <= 32));
    },
    '密码': v => {
        return $.isString(v) && v.length >= 6 && v.length <= 20;
    },
    '时间戳': v => {
        return Number.isInteger(v) && v >= MIN_TIMESTAMP;
    },
    '应用名': v => {
        return $.isString(v) && v.length >= 1 && v.length <= 32
    },
    '整数': v => {
        return Number.isInteger(v);
    },
    '正整数': v => {
        return Number.isInteger(v) && v > 0;
    }
};

class Validator {
    constructor(key) {
        this.key = key;
    }

    async valid(v) {
        let valid = keyOfValid[this.key];
        if (!valid)
            return false;

        return await valid(v);
    }
}

exports.create = key => {
    return new Validator(key);
}

exports.registry = obj => {
    $.each(obj, (v, k) => {
        keyOfValid[k] = v;
    });
};