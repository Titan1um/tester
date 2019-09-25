const cp = require('./cp');
const mkdir = require('./mkdir');
const rm = require('./rm');
const scanFile = require('./scan-file');

exports.cp = cp;

exports.mkdir = mkdir;

exports.mv = async (src, dst) => {
    await cp(src, dst);
    await rm(src, dst);
};

exports.rm = rm;

exports.scanFile = scanFile;