const Manager = require('./manager');

module.exports = (appName, enumName, user) => new Manager(enumName, appName, user);