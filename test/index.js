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

  var ret = copyProps(testcase.src, testcase.dst, testcase.map, testcase.fn,
    testcase.opts);

  assert.strictEqual(src, testcase.src);
  assert.strictEqual(dst, testcase.dst);

  if (testcase.opts && testcase.opts.reverse === true ||
      testcase.fn && testcase.fn.reverse === true ||
      testcase.map && testcase.map.reverse === true) {
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
    name: 'When only src and dst are defined',
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
      {
        name: 'And src contains null value',
        src: { a: { b: 1, c: null } },
        dst: { a: { b: 9, c: 'c' } },
        expected: { a: { b: 1, c: 'c' } },
      },
    ],
  },
  {
    name: 'When only src, dst and map are defined',
    cases: [
      {
        name: 'And both src and dst are empty',
        src: {},
        dst: {},
        map: { a: 'x.y.z', b: 'x.y.w' },
        expected: {},
      },
      {
        name: 'And map contains all src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
        expected: { x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true } },
      },
      {
        name: 'And map does not contains any of src properties',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: {},
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And overwrite dst properties contained by map',
        src: { a: { b1: 123, b2: 'BBB' }, c: true },
        dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        map: { 'a.b1': 'x.y.z', c: 'o.p' },
        expected: { x: { y: { z: 123 }, }, o: { p: true } },
      },
      {
        name: 'And not overwrite dst properties not contained by map',
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
      {
        name: 'And map is an array',
        src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
        dst: { x: { y: { z: 1 }, }, },
        map: ['x.y.z', 'o.p'],
        expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
      },
    ],
  },
  {
    name: 'When only src, dst and converter are defined',
    cases: [
      {
        name: 'And covert all of src property values',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fn: function(value) {
          return value * 2;
        },
        expected: { a: 2, b: { c: 4, d: 6 } },
      },
      {
        name: 'And covert src property values by their keychains',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: {},
        fn: function(value, keychain) {
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
    name: 'When src, dst and opts.reverse are defined',
    cases: [
      {
        name: 'And opts.reverse is false',
        cases: [
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            opts: { reverse: false },
            expected: {},
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true },
            dst: {},
            opts: { reverse: false },
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: {},
            opts: { reverse: false },
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true },
            opts: { reverse: false },
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            opts: { reverse: false },
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 1, b: 'b', c: true },
            dst: { a: 2, b: 'x', c: false },
            opts: { reverse: false },
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src and dst are same compositions and nested objects',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
            opts: { reverse: false },
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src has more properties than dst',
            src: { a: 1, b: 2, c: 3 },
            dst: { a: 9 },
            opts: { reverse: false },
            expected: { a: 1, b: 2, c: 3 },
          },
          {
            name: 'And src has more properties than dst and an nested object',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            opts: { reverse: false },
            expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 9 },
            dst: { a: 1, b: 2, c: 3 },
            opts: { reverse: false },
            expected: { a: 9, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and an nested object',
            src: { a: { a1: 3 },  },
            dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            opts: { reverse: false },
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
        ],
      },
      {
        name: 'And opts.reverse is true',
        cases: [
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            opts: { reverse: true },
            expected: {},
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true },
            opts: { reverse: true },
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            opts: { reverse: true },
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true },
            dst: {},
            opts: { reverse: true },
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            dst: {},
            opts: { reverse: true },
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 2, b: 'x', c: false },
            dst: { a: 1, b: 'b', c: true },
            opts: { reverse: true },
            expected: { a: 1, b: 'b', c: true },
          },
          {
            name: 'And src and dst are same compositions and nested objects',
            src: { a: { a1: 9, a2: 8, a3: 7 }, b: { b1: 'BX', b2: 'BY' } },
            dst: { a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' } },
            opts: { reverse: true },
            expected: {
              a: { a1: 1, a2: 2, a3: 3 }, b: { b1: 'b1', b2: 'b2' },
            },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 9 },
            dst: { a: 1, b: 2, c: 3 },
            opts: { reverse: true },
            expected: { a: 1, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and an nested object',
            src: { a: { a1: 3 },  },
            dst: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            opts: { reverse: true },
            expected: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
          {
            name: 'And dst has more properties than src',
            src: { a: 1, b: 2, c: 3 },
            dst: { a: 9 },
            opts: { reverse: true },
            expected: { a: 9, b: 2, c: 3 },
          },
          {
            name: 'And dst has more properties than src and an nested object',
            src: { a: { a1: 1, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
            dst: { a: { a1: 3 },  },
            opts: { reverse: true },
            expected: { a: { a1: 3, a2: 2 }, b: { b1: 'bbb', b2: 'ccc' } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst and opts.rejectNull are defined',
    cases: [
      {
        name: 'And opts.rejectNull is true',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            opts: { rejectNull: true },
            expected: {},
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true, d: null, e: undefined, f: 0, g: '' },
            dst: {},
            opts: { rejectNull: true },
            expected: { a: 1, b: 'b', c: true, f: 0, g: '' },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: {
              a: { a1: 1, a2: 2, a3: 3, a4: true, a5: '', a6: null },
              b: { b1: 'b1', b2: 'b2', b3: 0, b4: undefined },
            },
            dst: {},
            opts: { rejectNull: true },
            expected: {
              a: { a1: 1, a2: 2, a3: 3, a4: true, a5: '' },
              b: { b1: 'b1', b2: 'b2', b3: 0, },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 1, b: null, c: true },
            dst: { a: 2, b: 'x', c: false },
            opts: { rejectNull: true },
            expected: { a: 1, b: 'x', c: true },
          },
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            opts: { reverse: true, rejectNull: true, },
            expected: {},
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true, d: null, e: undefined, f: 0 },
            opts: { reverse: true, rejectNull: true, },
            expected: { a: 1, b: 'b', c: true, f: 0 },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: {
              a: { a1: 1, a2: 2, a3: null },
              b: { b1: 'b1', b2: undefined },
            },
            opts: { reverse: true, rejectNull: true, },
            expected: {
              a: { a1: 1, a2: 2 },
              b: { b1: 'b1' },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 2, b: 'x', c: false },
            dst: { a: 1, b: null, c: true },
            opts: { reverse: true, rejectNull: true, },
            expected: { a: 1, b: 'x', c: true },
          },
        ],
      },
      {
        name: 'And opts.rejectNull is false',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            opts: { rejectNull: false },
            expected: {},
          },
          {
            name: 'And dst is empty',
            src: { a: 1, b: 'b', c: true, d: null, e: undefined, f: 0, g: '' },
            dst: {},
            opts: { rejectNull: false },
            expected: {
              a: 1, b: 'b', c: true, d: null, e: undefined,  f: 0, g: ''
            },
          },
          {
            name: 'And dst is empty and src is a nested object',
            src: {
              a: { a1: 1, a2: 2, a3: 3, a4: true, a5: '', a6: null },
              b: { b1: 'b1', b2: 'b2', b3: 0, b4: undefined },
            },
            dst: {},
            opts: { rejectNull: false },
            expected: {
              a: { a1: 1, a2: 2, a3: 3, a4: true, a5: '', a6: null },
              b: { b1: 'b1', b2: 'b2', b3: 0, b4: undefined },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 1, b: null, c: true },
            dst: { a: 2, b: 'x', c: false },
            opts: { rejectNull: false },
            expected: { a: 1, b: null, c: true },
          },
          {
            name: 'And src is {} and dst is {}',
            src: {},
            dst: {},
            opts: { reverse: true, rejectNull: false, },
            expected: {},
          },
          {
            name: 'And src is empty',
            src: {},
            dst: { a: 1, b: 'b', c: true, d: null, e: undefined, f: 0 },
            opts: { reverse: true, rejectNull: false, },
            expected: { a: 1, b: 'b', c: true, d: null, e: undefined, f: 0 },
          },
          {
            name: 'And src is empty and dst is a nested object',
            src: {},
            dst: {
              a: { a1: 1, a2: 2, a3: null },
              b: { b1: 'b1', b2: undefined },
            },
            opts: { reverse: true, rejectNull: false, },
            expected: {
              a: { a1: 1, a2: 2, a3: null, },
              b: { b1: 'b1', b2: undefined, },
            },
          },
          {
            name: 'And src and dst are same compositions',
            src: { a: 2, b: 'x', c: false },
            dst: { a: 1, b: null, c: true },
            opts: { reverse: true, rejectNull: false },
            expected: { a: 1, b: null, c: true },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, map and opts.reverse are defined',
    cases: [
      {
        name: 'And opts.reverse is false',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            opts: { reverse: false },
            expected: {},
          },
          {
            name: 'And map contains all src properties',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: {},
            map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
            opts: { reverse: false },
            expected: {
              x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true },
            },
          },
          {
            name: 'And map does not contains parts of src properties',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: {},
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            opts: { reverse: false },
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            opts: { reverse: false },
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And not overwrite dst properties not contained by map',
            src: { a: { b1: 123, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.w', },
            opts: { reverse: false },
            expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
          },
          {
            name: 'And not overwrite dst properties if associated src ' +
                  'properties are not\n\tundefined',
            src: { a: {} },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            opts: { reverse: false },
            expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
          },
          {
            name: 'And map is an array',
            src: { x: { y: { z: 123, zz: 'BBB' }, }, o: { p: true } },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: ['x.y.z'],
            opts: { reverse: false },
            expected: { x: { y: { z: 123 }, }, o: { p: 'a' } },
          },
        ],
      },
      {
        name: 'And opts.reverse is true',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            opts: { reverse: true },
            expected: {},
          },
          {
            name: 'And map contains all dst properties',
            src: {},
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'x.v.w': 'a.b2', 'o.p': 'c' },
            opts: { reverse: true },
            expected: {
              x: { y: { z: 123 }, v: { w: 'BBB' } }, o: { p: true },
            },
          },
          {
            name: 'And map does not contains any of dst properties',
            src: {},
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            opts: { reverse: true },
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            opts: { reverse: true },
            expected: { x: { y: { z: 123 }, }, o: { p: true } },
          },
          {
            name: 'And not overwrite dst properties not contained by map',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: 123, b2: 'BBB' }, c: true },
            map: { 'x.y.w': 'a.b1' },
            opts: { reverse: true },
            expected: { x: { y: { z: 999, w: 123 }, }, o: { p: 'a' } },
          },
          {
            name: 'And not overwrite dst properties if associated src ' +
                  'properties are not\n\tundefined',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: {} },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            opts: { reverse: true },
            expected: { x: { y: { z: 999 }, }, o: { p: 'a' } },
          },
          {
            name: 'And map has duplicated value',
            src: { a: { b: { c: 'A', d: 'B' }, }, },
            dst: { x: { y: { z: 1234 }, }, },
            map: { 'a.b.c': 'x.y.z', 'a.b.d': 'x.y.z' },
            opts: { reverse: true },
            expected: { a: { b: { c: 1234, d: 1234, }, }, },
          },
          {
            name: 'And map is an array',
            src: { x: { y: { z: 123, zz: 'BBB' }, }, o: { p: true } },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: ['x.y.z'],
            opts: { reverse: true },
            expected: { x: { y: { z: 999, zz: 'BBB' }, }, o: { p: true } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, map and opts.rejectNull are defined',
    cases: [
      {
        name: 'And opts.rejectNull is true',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            opts: { rejectNull: true },
            expected: {},
          },
          {
            name: 'And map contains all src properties',
            src: { a: { b1: 123, b2: null }, c: undefined },
            dst: {},
            map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
            opts: { rejectNull: true },
            expected: {
              x: { y: { z: 123 } },
            },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { a: { b1: null, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            opts: { rejectNull: true },
            expected: { x: { y: { z: 999 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by map (array)',
            src: { x: { y: { z: null, w: 2 }, }, o: { p: true } },
            dst: { x: { y: { z: 999, w: 9 }, }, o: { p: 'a' } },
            map: ['x.y.z', 'x.y.w', 'o.p'],
            opts: { rejectNull: true },
            expected: { x: { y: { z: 999, w: 2 }, }, o: { p: true } },
          },
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            opts: { reverse: true, rejectNull: true },
            expected: {},
          },
          {
            name: 'And map contains all dst properties',
            src: {},
            dst: { a: { b1: 123, b2: null }, c: true },
            map: { 'x.y.z': 'a.b1', 'x.v.w': 'a.b2', 'o.p': 'c' },
            opts: { reverse: true, rejectNull: true },
            expected: {
              x: { y: { z: 123 } }, o: { p: true },
            },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: null, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            opts: { reverse: true, rejectNull: true },
            expected: { x: { y: { z: 999 }, }, o: { p: true } },
          },
          {
            name: 'And overwrite dst properties contained by map (array)',
            src: { x: { y: { z: 999, w: 9 }, }, o: { p: 'a' } },
            dst: { x: { y: { z: null, w: 2 }, }, o: { p: true } },
            map: ['x.y.z', 'x.y.w', 'o.p'],
            opts: { reverse: true, rejectNull: true },
            expected: { x: { y: { z: 999, w: 2 }, }, o: { p: true } },
          },
        ],
      },
      {
        name: 'And opts.rejectNull is false',
        cases: [
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            opts: { rejectNull: false },
            expected: {},
          },
          {
            name: 'And map contains all src properties',
            src: { a: { b1: 123, b2: null }, c: undefined },
            dst: {},
            map: { 'a.b1': 'x.y.z', 'a.b2': 'x.v.w', c: 'o.p' },
            opts: { rejectNull: false },
            expected: {
              x: { y: { z: 123 }, v: { w: null } },
              o: { p: undefined },
            },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { a: { b1: null, b2: 'BBB' }, c: true },
            dst: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            map: { 'a.b1': 'x.y.z', c: 'o.p' },
            opts: { rejectNull: false },
            expected: { x: { y: { z: null }, }, o: { p: true } },
          },
          {
            name: 'And both src and dst are empty',
            src: {},
            dst: {},
            map: { a: 'x.y.z', b: 'x.y.w' },
            opts: { reverse: true, rejectNull: false },
            expected: {},
          },
          {
            name: 'And map contains all dst properties',
            src: {},
            dst: { a: { b1: 123, b2: null }, c: true },
            map: { 'x.y.z': 'a.b1', 'x.v.w': 'a.b2', 'o.p': 'c' },
            opts: { reverse: true, rejectNull: false },
            expected: {
              x: { y: { z: 123 }, v: { w: null } }, o: { p: true },
            },
          },
          {
            name: 'And overwrite dst properties contained by map',
            src: { x: { y: { z: 999 }, }, o: { p: 'a' } },
            dst: { a: { b1: null, b2: 'BBB' }, c: true },
            map: { 'x.y.z': 'a.b1', 'o.p': 'c' },
            opts: { reverse: true, rejectNull: false, },
            expected: { x: { y: { z: null }, }, o: { p: true } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, converter and opts.reverse are defined',
    cases: [
      {
        name: 'And opts.reverse is false',
        cases: [
          {
            name: 'And covert all of src property values',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: {},
            fn: function(value) {
              return value * 2;
            },
            opts: { reverse: false },
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: {},
            fn: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            opts: { reverse: false },
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
      {
        name: 'And opts.reverse is true',
        cases: [
          {
            name: 'And covert all of src property values',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            fn: function(value) {
              return value * 2;
            },
            opts: { reverse: true },
            expected: { a: 2, b: { c: 4, d: 6 } },
          },
          {
            name: 'And covert src property values by their keychains',
            src: {},
            dst: { a: 1, b: { c: 2, d: 3 } },
            fn: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            opts: { reverse: true },
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, converter and opts.rejectNull are defined',
    cases: [
      {
        name: 'And opts.rejectNull is true',
        cases: [
          {
            name: 'And covert all of src property values',
            src: { a: 1, b: { c: -2, d: 3 } },
            dst: {},
            fn: function(value) {
              return (value < 0) ? null : value * 2;
            },
            opts: { rejectNull: true },
            expected: { a: 2, b: { d: 6 } },
          },
          {
            name: 'And covert all of src property values',
            src: {},
            dst: { a: 1, b: { c: -2, d: 3 } },
            fn: function(value) {
              return (value < 0) ? null : value * 2;
            },
            opts: { reverse: true, rejectNull: true },
            expected: { a: 2, b: { d: 6 } },
          },
        ],
      },
      {
        name: 'And opts.rejectNull is false',
        cases: [
          {
            name: 'And covert all of src property values',
            src: { a: 1, b: { c: -2, d: 3 } },
            dst: {},
            fn: function(value) {
              return (value < 0) ? null : value * 2;
            },
            opts: { rejectNull: false },
            expected: { a: 2, b: { c: null, d: 6 } },
          },
          {
            name: 'And covert all of src property values',
            src: {},
            dst: { a: 1, b: { c: -2, d: 3 } },
            fn: function(value) {
              return (value < 0) ? null : value * 2;
            },
            opts: { reverse: true, rejectNull: false },
            expected: { a: 2, b: { c: null, d: 6 } },
          },
        ],
      },
    ],
  },
  {
    name: 'When only src, dst, map and converter are defined',
    cases: [
      {
        name: 'And convert and copy to mapped properties',
        src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
        dst: { x: { y: { z: '-' }, }, },
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
  {
    name: 'When src, dst, map, converter and opts.reverse are defined',
    cases: [
      {
        name: 'And opts.reverse is false',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
            dst: { x: { y: { z: '-' }, }, },
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
            opts: { reverse: false },
            expected: { x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } } },
          },
        ],
      },
      {
        name: 'And opts.reverse is true',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { x: { y: { z: '-' }, }, },
            dst: { a: 1, b: { c: 'ccc', d: 'ddd' }, },
            map: { 'x.y.z': 'a', 'x.y.w': 'b.c', 'x.u.v': 'b.d', },
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
            opts: { reverse: true },
            expected: { x: { y: { z: 10, w: 'CCC' }, u: { v: 'DDD' } } },
          },
        ],
      },
    ],
  },
  {
    name: 'When src, dst, map, converter and opts.rejectNull are defined',
    cases: [
      {
        name: 'And opts.rejectNull is true',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { a: 1, b: { c: null, d: 'ddd' }, },
            dst: { x: { y: { z: '-', w: '?' }, }, },
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
            opts: { reverse: false },
            expected: { x: { y: { z: 10, w: '?' }, u: { v: 'DDD' } } },
          },
          {
            name: 'And convert and copy to mapped properties',
            src: { x: { y: { z: '-', w: '?' }, }, },
            dst: { a: 1, b: { c: null, d: 'ddd' }, },
            map: { 'x.y.z': 'a', 'x.y.w': 'b.c', 'x.u.v': 'b.d', },
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
            opts: { reverse: true, rejectNull: true },
            expected: { x: { y: { z: 10, w: '?' }, u: { v: 'DDD' } } },
          },
        ],
      },
      {
        name: 'And opts.rejectNull is false',
        cases: [
          {
            name: 'And convert and copy to mapped properties',
            src: { a: 1, b: { c: null, d: 'ddd' }, },
            dst: { x: { y: { z: '-', w: '?' }, }, },
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
            opts: { reverse: false, rejectNull: false },
            expected: { x: { y: { z: 10, w: undefined }, u: { v: 'DDD' } } },
          },
          {
            name: 'And convert and copy to mapped properties',
            src: { x: { y: { z: '-', w: '?' }, }, },
            dst: { a: 1, b: { c: null, d: 'ddd' }, },
            map: { 'x.y.z': 'a', 'x.y.w': 'b.c', 'x.u.v': 'b.d', },
            fn: function(value) {
              switch (typeof value) {
                case 'number': {
                  return value * 10;
                }
                case 'string': {
                  return value.toUpperCase();
                }
                default: {
                  return null;
                }
              }
            },
            opts: { reverse: true, rejectNull: false },
            expected: { x: { y: { z: 10, w: null }, u: { v: 'DDD' } } },
          },
        ],
      },
    ],
  },
  {
    name: 'When converter is defined as 3rd argument',
    cases: [
      {
        name: 'And covert all of src property values',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: { a: 'x' },
        map: function(value) {
          return value * 2;
        },
        expected: { a: 2, b: { c: 4, d: 6 } },
      },
      {
        name: 'And covert src property values by their keychains',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: { a: 'x' },
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
      {
        name: 'And opts.reverse is defined as 4th argument',
        cases: [
          {
            name: 'And isReversed is false',
            src: { a: 1, b: { c: 2, d: 3 } },
            dst: { a: 'x' },
            map: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            fn: { reverse: false },
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
          {
            name: 'And isReversed is true',
            src: { a: 'x' },
            dst: { a: 1, b: { c: 2, d: 3 } },
            map: function(value, keychain) {
              if (keychain === 'a') {
                return value * 2;
              } else if (keychain === 'b.c') {
                return 'x';
              } else if (keychain === 'b.d') {
                return value * 10;
              }
            },
            fn: { reverse: true },
            expected: { a: 2, b: { c: 'x', d: 30 } },
          },
        ],
      },
    ],
  },
  {
    name: 'When opts is defined as 4th argument And 3rd is null',
    cases: [
      {
        name: 'And isReversed is false',
        src: { a: 1, b: { c: 2, d: 3 } },
        dst: { a: 'x' },
        map: null,
        fn: { reverse: false },
        expected: { a: 1, b: { c: 2, d: 3 } },
      },
      {
        name: 'And isReversed is true',
        src: { a: 'x' },
        dst: { a: 1, b: { c: 2, d: 3 } },
        map: null,
        fn: { reverse: true },
        expected: { a: 1, b: { c: 2, d: 3 } },
      },
    ],
  },
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
      {
        name: 'And 5th argument is not an object',
        src: {},
        dst: {},
        map: {},
        fn: function() {},
        opts: 123,
        error: TypeError,
      },
      {
        name: 'And 5th argument is specified but 3th is not an object',
        src: {},
        dst: {},
        map: 123,
        fn: function() {},
        opts: {},
        error: TypeError,
      },
      {
        name: 'And 5th argument is specified but 4th is not a function',
        src: {},
        dst: {},
        map: {},
        fn: {},
        opts: {},
        error: TypeError,
      },
      {
        name: 'And 4th argument is an object but 3th is neither an object ' +
        'nor a\n\tfunciton',
        src: {},
        dst: {},
        map: 123,
        fn: {},
        error: TypeError,
      },
    ],
  },
]);
