'use strict';

var copyProps = require('..');
var expect = require('expect');

describe('Arguments', function () {
  describe('When arguments is src and dest', function () {
    it('Should succeed when src and dst is normal', function (done) {
      var src = { a: 1, b: 2 };
      var dst = { a: 9, c: 3 };
      expect(copyProps(src, dst)).toEqual({ a: 1, b: 2, c: 3 });
      done();
    });

    it('Should not change dst when src is not an plain object', function (done) {
      var dst = { a: 9, c: 3 };
      expect(copyProps(undefined, dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(null, dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(true, dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(false, dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(0, dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(123, dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps('', dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps('A', dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps([], dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps([1, 2, 3], dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(new Date(0), dst)).toEqual({ a: 9, c: 3 });
      expect(copyProps(function () {}, dst)).toEqual({ a: 9, c: 3 });
      done();
    });

    it('Should return copy of src when dst is not a plain object', function (done) {
      var src = { a: 9, c: 3 };
      expect(copyProps(src, undefined)).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, null)).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, true)).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, false)).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, 0)).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, 123)).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, '')).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, 'A')).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, [])).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, [1, 2, 3])).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, new Date(0))).toEqual({ a: 9, c: 3 });
      expect(copyProps(src, function () {})).toEqual({ a: 9, c: 3 });
      done();
    });
  });

  describe('When arguments is src, dst, fromto/converter/reverse', function () {
    it('Should succeed when 3rd arg is a plain object', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: 'A', 'b.c': 'B.C' };
      var expected = { A: 1, B: { C: 2, D: 20 } };
      expect(copyProps(src, dst, fromto)).toEqual(expected);
      done();
    });

    it('Should only pass fromto properties of which value is a string', function (done) {
      var src = { a: 1, b: 2 };
      var dst = { A: 10, true: 20 };
      var fromto = { a: 'A', b: true };
      var expected = { A: 1, true: 20 };
      expect(copyProps(src, dst, fromto)).toEqual(expected);
      done();
    });

    it('Should succeed when 3rd arg is an array', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var fromto = ['a', 'b.c'];
      var expected = { a: 1, b: { c: 2, d: 20 } };
      expect(copyProps(src, dst, fromto)).toEqual(expected);
      done();
    });

    it('Should only pas frommto elements which is a string', function (done) {
      var src = { a: 1, 123: 99 };
      var dst = { a: 10, 123: 8 };
      var fromto = ['a', 123];
      var expected = { a: 1, 123: 8 };
      expect(copyProps(src, dst, fromto)).toEqual(expected);
      done();
    });

    it('Should succeed when 3rd arg is a function', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var converter = function (srcInfo) {
        return srcInfo.value * 2;
      };
      var expected = { a: 2, b: { c: 4, d: 20 } };
      expect(copyProps(src, dst, converter)).toEqual(expected);
      done();
    });

    it('Should succeed when 3rd arg is a boolean', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var expected = { a: 10, b: { c: 2, d: 20 } };
      expect(copyProps(src, dst, true)).toEqual(expected);
      done();
    });

    it('Should ignore 3rd arg when it is other type', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var expected = { a: 1, b: { c: 2, d: 20 } };
      expect(copyProps(src, dst, undefined)).toEqual(expected);
      expect(copyProps(src, dst, null)).toEqual(expected);
      expect(copyProps(src, dst, 0)).toEqual(expected);
      expect(copyProps(src, dst, 123)).toEqual(expected);
      expect(copyProps(src, dst, '')).toEqual(expected);
      expect(copyProps(src, dst, 'ABC')).toEqual(expected);
      expect(copyProps(src, dst, new Date(0))).toEqual(expected);
      done();
    });
  });

  describe('When arguments is src, dst, fromto, converter/reverse', function () {
    it('Should succeed when 4th arg is a function', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: 'A', 'b.c': 'B.C' };
      var expected = { A: 2, B: { C: 4, D: 20 } };
      expect(
        copyProps(src, dst, fromto, function (srcInfo) {
          return srcInfo.value * 2;
        })
      ).toEqual(expected);
      done();
    });

    it('Should succeed when 4th arg is a boolean', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: 'A', 'b.c': 'B.C', 'b.d': 'B.D' };
      var expected = { a: 10, b: { c: 2, d: 20 } };
      expect(copyProps(src, dst, fromto, true)).toEqual(expected);
      done();
    });

    it('Should ignore 4th arg when it is other type', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var map = { a: 'A', 'b.c': 'B.C' };
      var expected = { A: 1, B: { C: 2, D: 20 } };
      expect(copyProps(src, dst, map, undefined)).toEqual(expected);
      expect(copyProps(src, dst, map, null)).toEqual(expected);
      expect(copyProps(src, dst, map, 0)).toEqual(expected);
      expect(copyProps(src, dst, map, 123)).toEqual(expected);
      expect(copyProps(src, dst, map, '')).toEqual(expected);
      expect(copyProps(src, dst, map, 'ABC')).toEqual(expected);
      expect(copyProps(src, dst, map, [1, 2])).toEqual(expected);
      expect(copyProps(src, dst, map, { a: 1, b: 2 })).toEqual(expected);
      expect(copyProps(src, dst, map, new Date())).toEqual(expected);
      done();
    });
  });

  describe('When arguments is src, dst, fromto, converter, reverse', function () {
    it('Should succeed when 5th arg is a boolean', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: 'A', 'b.c': 'B.C', 'b.d': 'B.D' };
      var converter = function (srcInfo) {
        return srcInfo.value * 2;
      };
      var expected = { a: 20, b: { c: 2, d: 40 } };
      expect(copyProps(src, dst, fromto, converter, true)).toEqual(expected);
      done();
    });

    it('Should ignore 5th arg when it is other type', function (done) {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: 'A', 'b.c': 'B.C', 'b.d': 'B.D' };
      var converter = function (srcInfo) {
        return srcInfo.value * 2;
      };
      var expected = { A: 2, B: { C: 4, D: 20 } };
      expect(copyProps(src, dst, fromto, converter, undefined)).toEqual(
        expected
      );
      expect(copyProps(src, dst, fromto, converter, null)).toEqual(expected);
      expect(copyProps(src, dst, fromto, converter, 0)).toEqual(expected);
      expect(copyProps(src, dst, fromto, converter, 123)).toEqual(expected);
      expect(copyProps(src, dst, fromto, converter, '')).toEqual(expected);
      expect(copyProps(src, dst, fromto, converter, 'ABC')).toEqual(expected);
      expect(copyProps(src, dst, fromto, converter, [1, 2])).toEqual(expected);
      expect(copyProps(src, dst, fromto, converter, { a: 1, b: 2 })).toEqual(
        expected
      );
      expect(copyProps(src, dst, fromto, converter, new Date())).toEqual(
        expected
      );
      expect(copyProps(src, dst, fromto, converter, function () {})).toEqual(
        expected
      );
      done();
    });
  });
});
