const $ = require('underscore');

exports.run = (p, s, f) => {
    if (exports.mockRun)
        return exports.mockRun(p, s, f);

    if ($.isFunction(p))
        p = p();

    p && p.then && p.then(s || emptyFunc, f || emptyFunc);
};

exports.sleep = timeout => {    
    return new Promise(s => {
        setTimeout(() => {
            s();
        }, timeout);
    });
};

function emptyFunc() {}