'use strict';

var isPlainObject = require('lodash.isplainobject');

module.exports = function(object, fn) {
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

    fn(val, keychain.slice(1));
  }
}
