'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isFunc = function isFunc(el) {
    return typeof el === 'function';
};
var isPromise = function isPromise(el) {
    return !!el && ((typeof el === 'undefined' ? 'undefined' : _typeof(el)) === 'object' || isFunc(el)) && isFunc(el.then);
};
var isDefined = function isDefined(el) {
    return typeof el !== 'undefined';
};

/**
 * Transforms current value to Promise
 * @param {Promise|Function|Object} current
 * @param {Array} args for apply if current is function
 * @returns {Promise}
 */
var transform = function transform(current, args) {
    return isFunc(current) ? promisify(current.apply(null, args)) : promisify(current);
};

/**
 * Resolve value as promise
 * @param value
 * @returns {Promise}
 */
var promisify = function promisify(value) {
    return isPromise(value) ? value : Promise.resolve(value);
};

/**
 * Appends result to results array
 * @param {Array} results
 */
var appender = function appender(results) {
    return function (result) {
        isDefined(result) && results.push(result);

        return results;
    };
};

var process = function process(results, append) {
    return function (prev, value) {
        return prev.then(function (result) {
            return transform(value, [result, results]).then(append);
        });
    };
};

/**
 * Executes array of values as promise sequence
 * @param {Array} sequence
 * @param {Array} [results]
 * @returns {Promise}
 * @throws Error
 */
module.exports = function (sequence) {
    var results = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    return new Promise(function (resolve, reject) {
        if (!Array.isArray(sequence)) throw 'promise-sequence expects array as first argument';

        return sequence.reduce(process(results, appender(results)), promisify()).then(function () {
            return resolve(results);
        }, function (error) {
            return reject(appender(results)(error));
        });
    });
};
