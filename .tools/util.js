"use strict";
const fs = require("fs");
exports.readFile = promisifyFn(fs.readFile);
exports.writeFile = promisifyFn(fs.writeFile);
exports.readDir = promisifyFn(fs.readdir);
function promisifyFn(fn) {
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn(...args, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
}
exports.promisifyFn = promisifyFn;
