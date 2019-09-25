const $ = require('underscore');

const Manager = require('./manager');
const Accessor = require('../../dp/accessor');

let accessor = new Accessor();

module.exports = data => {
    $.each(data, (v, k) => {
        accessor.set(k, new Manager(k, v));
    });
    
    return name => accessor.get(name);
};