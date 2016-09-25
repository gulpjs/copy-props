'use strict';

/* eslint max-statements: "off" */

var inspect = require('util').inspect;
var isPlainObject = require('lodash.isplainobject');
var copyProps = require('./lib/copy-props');

module.exports = function(src, dst, fromTo, converter, opts) {
  if (!isPlainObject(src)) {
    throw new TypeError('The 1st argument need to be a plain object: ' +
      inspect(src));
  }

  if (!isPlainObject(dst)) {
    throw new TypeError('The 2nd argument need to be a plain object: ' +
      inspect(dst));
  }

  if (opts == null) {
    if (isPlainObject(converter)) {
      opts = converter;

      if (typeof fromTo === 'function') {
        converter = fromTo;
        fromTo = null;
      } else {
        converter = null;
      }

    } else if (converter == null) {

      if (typeof fromTo === 'function') {
        converter = fromTo;
        fromTo = null;
      }
    }
  }

  if (opts != null && !isPlainObject(opts)) {
    throw new TypeError('The 5th argument need to be an object: ' +
      inspect(opts));
  }

  if (converter != null && typeof converter !== 'function') {
    throw new TypeError('The 4th argument need to be a function: ' +
      inspect(converter));
  }

  if (fromTo != null && !isPlainObject(fromTo) && !Array.isArray(fromTo)) {
    throw new TypeError('The 3th argument need to be a plain object or ' +
      'an array: ' + inspect(fromTo));
  }

  return copyProps(src, dst, fromTo, converter, opts);
};
