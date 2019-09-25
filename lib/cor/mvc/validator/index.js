const $ = require('underscore');

const custom = require('./custom');

module.exports = v => {
    if ($.isString(v))
        return custom.create(v);

    if ($.isFunction(v)) {
        return {
            valid: v
        };
    }

    let Validator = require(`./${v[0]}`);
    return new Validator(v[1]);
};