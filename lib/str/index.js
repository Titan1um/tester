const cryptoRandomString = require('crypto-random-string');
const ObjectID = require('mongodb').ObjectID;

exports.rand = len => {
    return cryptoRandomString({
        length: len
    });
};

exports.randID = () => {
    return new ObjectID().toHexString();
};