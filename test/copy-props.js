'use strict';

var assert = require('assert');
var testrun = require('testrun').mocha;
var assign = require('lodash.assign');
var copyProps = require('../');

function testfn(testcase) {
  var src = testcase.src;
  var dst = testcase.dst;
  var srcBak = assign({}, testcase.src);
  var dstBak = assign({}, testcase.dst);

  var ret = copyProps(testcase.src, testcase.dst, testcase.fromto,
    testcase.converter, testcase.reverse);

  assert.strictEqual(src, testcase.src);
  assert.strictEqual(dst, testcase.dst);

  if (testcase.reverse === true ||
      testcase.converter === true ||
      testcase.fromto === true) {
    assert.strictEqual(ret, testcase.src);
    assert.deepEqual(dst, dstBak);
  } else {
    assert.strictEqual(ret, testcase.dst);
    assert.deepEqual(src, srcBak);
  }

  return ret;
}

testrun('copyProps', testfn, [
  {
    name: 'When only src and dst are specified',
    cases: [
      {
        name: 'And src is {} and dst is {}',
        src: {},
        dst: {},
        expected: {},
      },
      {
        name: 'And dst is empty',
        src: { a: 1, b: 'b', c: true },
        dst: {},
        expected: { a: 1, b: 'b', c: true },
      },
      {
        name: 'And dst is empty and src is a nested object',
        src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
        dst: {},
        expected: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
      },
      {
        name: 'And src is empty',
        src: {},
        dst: { a: 1, b: 'b', c: true },
        expected: { a: 1, b: 'b', c: true },
      },
      {
        name: 'And src is empty and dst is a nested object',
        src: {},
        dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
        expected: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
      },
      {
        name: 'And src and dst are same compositions',
        src: { a: 1, b: 'b', c: true },
        dst: { a: 2, b: 'x', c: false },
        expected: { a: 1, b: 'b', c: true },
      },
      {
        name: 'And src and dst are same compositions and nested objects',
        src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
        dst: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
        expected: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
      },
      {
        name: 'And src has more properties than dst',
        src: { a: 1, b: 2, c: 3 },
        dst: { a: 9 },
        expected: { a: 1, b: 2, c: 3 },
      },
      {
        name: 'And src has more properties than dst and a nested object',
        src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
        dst: { a: { a1: 3 },  },
        expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
      },
      {
        name: 'And dst has more properties than src',
        src: { a: 9 },
        dst: { a: 1, b: 2, c: 3 },
        expected: { a: 9, b: 2, c: 3 },
      },
      {
        name: 'And dst has more properties than src and a nested object',
        src: { a: { a1: 3 },  },
        dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
        expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
      },
      {
        name: 'And src contains null value',
        src: { a: { b: 1, c: null } },
        dst: { a: { b: 9, c: 'c' } },
        expected: { a: { b: 1, c: null } },
      },
      {
        name: 'And src contains undefined value (not copied)',
        src: { a: { b: 1, c: undefined } },
        dst: { a: { b: 9, c: 'c' } },
        expected: { a: { b: 1, c: 'c' } },
      },
    ],
  },
  {
    name: 'When fromto is specified',
    cases: [
      {
        name: 'And both src and dst are empty',
        src: {},
        dst: {},
        fromto: { a: 'x.y.z', b: 'x.y.w' },
        expected: {},
      },
      {
        name: 'And fromto contains all src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        fromto: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
        expected: { x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true } },
      },
      {
        name: 'And fromto does not contains any of src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        fromto: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And overwrite dst properties contained by fromto',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        fromto: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And not overwrite dst properties not contained by fromto',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        fromto: { 'a.b1': 'x.y.w', },
        expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
      },
      {
        name: 'And not overwrite dst properties if associated src properties' +
        ' are not\n\tundefined',
        src: { a: {} },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        fromto: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
      },
      {
        name: 'And fromto is an array',
        src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        dst: { x: { y: { z: 1 }, }, },
        fromto: ['x.y.z', 'o.p'],
        expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
      },
    ],
  },
  {
    name: 'When converter is specified',
    cases: [
      {
        name: 'And covert all of src property values',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        converter: function(value) {
          return value * 2;
        },
        expected: { a: 2, b: { c: 4, d: 6 } },
      },
      {
        name: 'And covert src property values by their keychains',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        converter: function(value, keychain) {
          if (keychain === 'a') {
            return value * 2;
          } else if (keychain === 'b.c') {
            return 'x';
          } else if (keychain === 'b.d') {
            return value * 10;
          }
        },
        expected: { a: 2, b: { c: 'x', d: 30 } },
      },
      {
        name: 'And converter specified as 3rd argument',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fromto: function(value, keychain) {
          if (keychain === 'a') {
            return value * 2;
          } else if (keychain === 'b.c') {
            return 'x';
          } else if (keychain === 'b.d') {
            return value * 10;
          }
        },
        expected: { a: 2, b: { c: 'x', d: 30 } },
      },
      {
        name: 'And skip copying if result of converter is undefined',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fromto: function(value, keychain) {
          if (keychain === 'a') {
            return value * 2;
          } else if (keychain === 'b.c') {
            return undefined;
          } else if (keychain === 'b.d') {
            return value * 10;
          }
        },
        expected: { a: 2, b: { d: 30 } },
      },
      {
        name: 'And not skip copying if result of converter is null',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fromto: function(value, keychain) {
          if (keychain === 'a') {
            return value * 2;
          } else if (keychain === 'b.c') {
            return null;
          } else if (keychain === 'b.d') {
            return value * 10;
          }
        },
        expected: { a: 2, b: { c: null, d: 30 } },
      },
    ],
  },
  {
    name: 'When src, dst, fromto and converter are specified',
    cases: [
      {
        name: 'And convert and copy to mapped properties',
        src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
        dst: { x: { y: { z: '-' }, }, },
        fromto: { a: 'x.y.z', 'b.c': 'x.y.w', 'b.d': 'x.u.v', },
        converter: function(value) {
          switch (typeof value) {
            case 'number': {
              return value * 10;
            }
            case 'string': {
              return value.toUpperCase();
            }
          }
        },
        expected: { x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } } },
      },
      {
        name: 'And skip copying if result of converter is undefined',
        src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
        dst: { x: { y: { z: '-' }, }, },
        fromto: { a: 'x.y.z', 'b.c': 'x.y.w', 'b.d': 'x.u.v', },
        converter: function(value) {
          switch (typeof value) {
            case 'number': {
              return value * 10;
            }
            case 'string': {
              return undefined;
            }
          }
        },
        expected: { x: { y: { z: 10 } } },
      },
      {
        name: 'And not skip copying if result of converter is null',
        src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
        dst: { x: { y: { z: '-' }, }, },
        fromto: { a: 'x.y.z', 'b.c': 'x.y.w', 'b.d': 'x.u.v', },
        converter: function(value) {
          switch (typeof value) {
            case 'number': {
              return value * 10;
            }
            case 'string': {
              return null;
            }
          }
        },
        expected: { x: { y: { z: 10, w: null }, u: { v: null } } },
      },
    ],
  },
  {
    name: 'When reverse is specified',
    cases: [
      {
        name: 'And reverse is false',
        cases: [
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            reverse: false,
            expected: {},
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true },
            dst: {},
            reverse: false,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: {},
            reverse: false,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true },
            reverse: false,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            reverse: false,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 1, b: 'b', c: true },
            dst: { a: 2, b: 'x', c: false },
            reverse: false,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src and dst are same compositions and nested objects',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
            reverse: false,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src has more properties than dst',
            src: { a: 1, b: 2, c: 3 },
            dst: { a: 9 },
            reverse: false,
            expected: { a: 1, b: 2, c: 3 },
          },
          {
            name: 'And src has more properties than dst and is a nested ' +
                  'object',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            reverse: false,
            expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 9 },
            dst: { a: 1, b: 2, c: 3 },
            reverse: false,
            expected: { a: 9, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and is a nested ' +
                  'object',
            src: { a: { a1: 3 },  },
            dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            reverse: false,
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
        ],
      },
      {
        name: 'And reverse is true',
        cases: [
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            reverse: true,
            expected: {},
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true },
            reverse: true,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            reverse: true,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true },
            dst: {},
            reverse: true,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: {},
            reverse: true,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 2, b: 'x', c: false },
            dst: { a: 1, b: 'b', c: true },
            reverse: true,
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src and dst are same compositions and is a nested ' +
                  'objects',
            src: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            reverse: true,
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 9 },
            dst: { a: 1, b: 2, c: 3 },
            reverse: true,
            expected: { a: 1, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and is a nested ' +
                  'object',
            src: { a: { a1: 3 },  },
            dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            reverse: true,
            expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 1, b: 2, c: 3 },
            dst: { a: 9 },
            reverse: true,
            expected: { a: 9, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and is a nested ' +
                  'object',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            reverse: true,
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And reverse is specified as 4th argument',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            converter: true,
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And reverse is specified as 3rd argument',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            fromto: true,
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, fromto and reverse are defined',
    cases: [
      {
        name: 'And reverse is false',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            fromto: { a: 'x.y.z', b: 'x.y.w' },
            reverse: false,
            expected: {},
          },
          {
            name: 'And fromto contains all src properties',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: {},
            fromto: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
            reverse: false,
            expected: {
              x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true },
            },
          },
          {
            name: 'And fromto does not contains parts of src properties',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: {},
            fromto: { 'a.b1': 'x.y.z', c: 'o.p' },
            reverse: false,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by fromto',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            fromto: { 'a.b1': 'x.y.z', c: 'o.p' },
            reverse: false,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And not overwrite dst properties not contained by fromto',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            fromto: { 'a.b1': 'x.y.w', },
            reverse: false,
            expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
          },
          {
            name: 'And not overwrite dst properties if associated src ' +
                  'properties are not\n\tundefined',
            src: { a: {} },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            fromto: { 'a.b1': 'x.y.z', c: 'o.p' },
            reverse: false,
            expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
          },
          {
            name: 'And fromto is an array',
            src: { x: { y: { z: 123, zz: 'BBB' }, }, o: { p: true } },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            fromto: ['x.y.z'],
            reverse: false,
            expected: { x: { y: { z: 123 }, }, o: { p: 'a' } },
          },
        ],
      },
      {
        name: 'And reverse is true',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            fromto: { a: 'x.y.z', b: 'x.y.w' },
            reverse: true,
            expected: {},
          },
          {
            name: 'And fromto contains all dst properties',
            src: {},
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            fromto: { 'x.y.z': 'a.b1', 'x.v.w': 'a.b2', 'o.p': 'c' },
            reverse: true,
            expected: {
              x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true },
            },
          },
          {
            name: 'And fromto does not contains any of dst properties',
            src: {},
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            fromto: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            reverse: true,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by fromto',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            fromto: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            reverse: true,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And not overwrite dst properties not contained by fromto',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            fromto: { 'x.y.w': 'a.b1' },
            reverse: true,
            expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
          },
          {
            name: 'And not overwrite dst properties if associated src ' +
                  'properties are not\n\tundefined',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: {} },
            fromto: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            reverse: true,
            expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
          },
          {
            name: 'And fromto has duplicated value',
            src: { a: { b: { c: 'A', d: 'B' }, }, },
            dst: { x: { y: { z: 1234 }, }, },
            fromto: { 'a.b.c': 'x.y.z', 'a.b.d': 'x.y.z' },
            reverse: true,
            expected: { a: { b: { c: 1234, d: 1234, }, }, },
          },
          {
            name: 'And fromto is an array',
            src: { x: { y: { z: 123, zz: 'BBB' }, }, o: { p: true } },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            fromto: ['x.y.z'],
            reverse: true,
            expected: { x: { y: { z: 999, zz: 'BBB' }, }, o: { p: true } },
          },
          {
            name: 'And reverse is specified as 4th argument',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            fromto: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            converter: true,
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, fromto, converter and reverse are defined',
    cases: [
      {
        name: 'And reverse is false',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { a: 1, b: { c: 'ccc', d: 'ddd' }, e: true, f: false },
            dst: { x: { y: { z: '-' }, }, },
            fromto: {
              a: 'x.y.z',
              'b.c': 'x.y.w',
              'b.d': 'x.u.v',
              e: 's',
              f: 't',
            },
            converter: function(value) {
              switch (typeof value) {
                case 'number': {
                  return value * 10;
                }
                case 'string': {
                  return value.toUpperCase();
                }
                case 'boolean': {
                  if (value) {
                    return null;
                  } else {
                    return undefined;
                  }
                }
              }
            },
            reverse: false,
            expected: {
              x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } }, s: null,
            },
          },
        ],
      },
      {
        name: 'And reverse is true',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { x: { y: { z: '-' }, }, },
            dst: { a: 1, b: { c: 'ccc', d: 'ddd' }, e: true, f: false, },
            fromto: {
              'x.y.z': 'a',
              'x.y.w': 'b.c',
              'x.u.v': 'b.d',
              s: 'e',
              t: 'f',
            },
            converter: function(value) {
              switch (typeof value) {
                case 'number': {
                  return value * 10;
                }
                case 'string': {
                  return value.toUpperCase();
                }
                case 'boolean': {
                  if (value) {
                    return null;
                  } else {
                    return undefined;
                  }
                }
              }
            },
            reverse: true,
            expected: {
              x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } },
              s: null,
            },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, converter and reverse are defined',
    cases: [
      {
        name: 'And reverse is false',
        cases: [
          {
            name: 'And covert all of src property values',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: {},
            converter: function(value) {
              return value * 2;
            },
            reverse: false,
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: {},
            converter: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            reverse: false,
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
      {
        name: 'And reverse is true',
        cases: [
          {
            name: 'And covert all of src property values',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            converter: function(value) {
              return value * 2;
            },
            reverse: true,
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            converter: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            reverse: true,
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
      {
        name: 'And converter and reverse is specified as 3rd and 4th argument',
        cases: [
          {
            name: 'And covert all of src property values',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            fromto: function(value) {
              return value * 2;
            },
            converter: true,
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            fromto: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            converter: true,
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
    ],
  },
]);

