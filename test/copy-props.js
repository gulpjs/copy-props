'use strict';

var assert = require('assert');
var testrun = require('testrun').mocha;
var copyProps = require('../');

function testfn(testcase) {
  var ret = copyProps(testcase.src, testcase.dst, testcase.map, testcase.fn);
  assert.strictEqual(ret, testcase.dst);
  return ret;
}

testrun('#copyProps', testfn, [
  {
    name: 'When data type of arguments are illegal',
    cases: [
      {
        name: 'And src is ${testcase.src}',
        src: undefined,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: null,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: true,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: false,
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: [],
        dst: {},
        error: TypeError,
      },
      {
        name: 'And src is ${testcase.src}',
        src: new Date(),
        dst: {},
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: undefined,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: null,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: true,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: false,
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: [],
        error: TypeError,
      },
      {
        name: 'And dst is ${testcase.dst}',
        src: {},
        dst: new Date(),
        error: TypeError,
      },
      {
        name: 'And 3rd argument is neither an object nor a function',
        src: {},
        dst: {},
        map: 'aaa',
        error: TypeError,
      },
      {
        name: 'And 4th argument is not a function',
        src: {},
        dst: {},
        map: {},
        fn: 123,
        error: TypeError,
      },
      {
        name: 'And 4th argument is specified but 3rd is not an object',
        src: {},
        dst: {},
        map: function() {},
        fn: function() {},
        error: TypeError,
      },
    ],
  },
  {
    name: 'When both map and converter are undefined',
    cases: [
      {
        name: 'And src is ${testcase.src} and dst is ${testcase.dst}',
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
        name: 'And src has more properties than dst and an nested object',
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
        name: 'And dst has more properties than src and an nested object',
        src: { a: { a1: 3 },  },
        dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
        expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
      },
    ],
  },
  {
    name: 'When fromToProps is defined',
    cases: [
      {
        name: 'And both src and dst are empty',
        src: {},
        dst: {},
        map: { a: 'x.y.z', b: 'x.y.w' },
        expected: {},
      },
      {
        name: 'And fromToProps contains all src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
        expected: { x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true } },
      },
      {
        name: 'And fromToProps does not contains any of src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And overwrite dst properties contained by fromToProps',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And not overwrite dst properties not contained by fromToProps',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.w', },
        expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
      },
      {
        name: 'And not overwrite dst properties if associated src properties' +
        ' are not\n\tundefined',
        src: { a: {} },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
      },
    ],
  },
  {
    name: 'When converter is defined as 3rd argument',
    cases: [
      {
        name: 'And covert all of src property values',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        map: function(value) {
          return value * 2;
        },
        expected: { a: 2, b: { c: 4, d: 6 } },
      },
      {
        name: 'And covert src property values by their keychains',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        map: function(value, keychain) {
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
    ],
  },
  {
    name: 'When both map and converter are defined',
    cases: [
      {
        name: 'And convert and copy to mapped properties',
        src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
        dst: {},
        map: { a: 'x.y.z', 'b.c': 'x.y.w', 'b.d': 'x.u.v', },
        fn: function(value) {
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
    ],
  },
]);
