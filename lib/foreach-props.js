'use strict';

var inspect = require('util').inspect;
var isPlainObject = require('lodash.isplainobject');

module.exports = function(object, fn) {
  if (!isPlainObject(object)) {
    throw new TypeError('The 1st argument need to be an object : ' +
      inspect(object));
  }
  foreachNode(object, '', fn);
};

function foreachNode(node, basekey, fn) {
  var keys = Object.keys(node);
  for (var i = 0, n = keys.length; i < n; i++) {
    var key = keys[i];
    var keychain = basekey + '.' + key;

    var val = node[key];
    if (isPlainObject(val)) {
      foreachNode(val, keychain, fn);
      continue;
    }

    node[key] = fn(val, keychain.slice(1));
  }
}
