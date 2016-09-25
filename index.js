'use strict';

/* eslint max-statements: "off" */

var inspect = require('util').inspect;
var isPlainObject = require('lodash.isplainobject');
var copyProps = require('./lib/copy-props');

module.exports = function(src, dst, fromTo, converter, isReversed) {
  if (!isPlainObject(src)) {
    throw new TypeError('The 1st argument need to be a plain object: ' +
      inspect(src));
  }

  if (!isPlainObject(dst)) {
    throw new TypeError('The 2nd argument need to be a plain object: ' +
      inspect(dst));
  }

  if (typeof fromTo === 'boolean') {
    return copyProps(src, dst, undefined, undefined, fromTo);
  }

  if (typeof fromTo === 'function') {
    if (typeof converter === 'boolean') {
      return copyProps(src, dst, undefined, fromTo, converter);
    }
    if (isReversed == null && converter == null) {
      return copyProps(src, dst, undefined, fromTo);
    }
  }

  if (typeof converter === 'boolean') {
    isReversed = converter;
    converter = undefined;
  }

  if (isReversed != null && typeof isReversed !== 'boolean') {
    throw new TypeError('The 5th argument need to be a boolean: ' +
      inspect(isReversed));
  }

  if (converter != null && typeof converter !== 'function') {
    throw new TypeError('The 4th argument need to be a function: ' +
      inspect(converter));
  }

  if (fromTo != null && !isPlainObject(fromTo) && !Array.isArray(fromTo)) {
    throw new TypeError('The 3th argument need to be a plain object or ' +
      'an array: ' + inspect(fromTo));
  }

  return copyProps(src, dst, fromTo, converter, isReversed);
};
