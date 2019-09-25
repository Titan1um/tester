const Manager = require('./manager');
const Accessor = require('../../dp/accessor');

let accessor = new Accessor();

module.exports = name => {
    return accessor.getOrSet(
        name,
        new Manager(name)
    );
};