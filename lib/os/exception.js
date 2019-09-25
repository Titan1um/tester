const $ = require('underscore');

class Exception extends Error {
    constructor(code, message) {
        if (!$.isString(message))
            message = JSON.stringify(message);

        super(message);

        this.code = code;
    }
}

module.exports = Exception;