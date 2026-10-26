"use strict";

var assert = require("node:assert");
var { describe, it } = require("node:test");

var copyProps = require("..");

describe("Arguments", function () {
  describe("When arguments is src and dest", function () {
    it("Should succeed when src and dst is normal", function () {
      var src = { a: 1, b: 2 };
      var dst = { a: 9, c: 3 };
      assert.deepStrictEqual(copyProps(src, dst), { a: 1, b: 2, c: 3 });
    });

    it("Should not change dst when src is not an plain object", function () {
      var dst = { a: 9, c: 3 };
      assert.deepStrictEqual(copyProps(undefined, dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(null, dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(true, dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(false, dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(0, dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(123, dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps("", dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps("A", dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps([], dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps([1, 2, 3], dst), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(new Date(0), dst), { a: 9, c: 3 });
      assert.deepStrictEqual(
        copyProps(function () {}, dst),
        { a: 9, c: 3 },
      );
    });

    it("Should return copy of src when dst is not a plain object", function () {
      var src = { a: 9, c: 3 };
      assert.deepStrictEqual(copyProps(src, undefined), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, null), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, true), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, false), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, 0), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, 123), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, ""), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, "A"), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, []), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, [1, 2, 3]), { a: 9, c: 3 });
      assert.deepStrictEqual(copyProps(src, new Date(0)), { a: 9, c: 3 });
      assert.deepStrictEqual(
        copyProps(src, function () {}),
        { a: 9, c: 3 },
      );
    });
  });

  describe("When arguments is src, dst, fromto/converter/reverse", function () {
    it("Should succeed when 3rd arg is a plain object", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: "A", "b.c": "B.C" };
      var expected = { A: 1, B: { C: 2, D: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, fromto), expected);
    });

    it("Should only pass fromto properties of which value is a string", function () {
      var src = { a: 1, b: 2 };
      var dst = { A: 10, true: 20 };
      var fromto = { a: "A", b: true };
      var expected = { A: 1, true: 20 };
      assert.deepStrictEqual(copyProps(src, dst, fromto), expected);
    });

    it("Should succeed when 3rd arg is an array", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var fromto = ["a", "b.c"];
      var expected = { a: 1, b: { c: 2, d: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, fromto), expected);
    });

    it("Should only pas frommto elements which is a string", function () {
      var src = { a: 1, 123: 99 };
      var dst = { a: 10, 123: 8 };
      var fromto = ["a", 123];
      var expected = { a: 1, 123: 8 };
      assert.deepStrictEqual(copyProps(src, dst, fromto), expected);
    });

    it("Should succeed when 3rd arg is a function", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var converter = function (srcInfo) {
        return srcInfo.value * 2;
      };
      var expected = { a: 2, b: { c: 4, d: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, converter), expected);
    });

    it("Should succeed when 3rd arg is a boolean", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var expected = { a: 10, b: { c: 2, d: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, true), expected);
    });

    it("Should ignore 3rd arg when it is other type", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { a: 10, b: { d: 20 } };
      var expected = { a: 1, b: { c: 2, d: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, undefined), expected);
      assert.deepStrictEqual(copyProps(src, dst, null), expected);
      assert.deepStrictEqual(copyProps(src, dst, 0), expected);
      assert.deepStrictEqual(copyProps(src, dst, 123), expected);
      assert.deepStrictEqual(copyProps(src, dst, ""), expected);
      assert.deepStrictEqual(copyProps(src, dst, "ABC"), expected);
      assert.deepStrictEqual(copyProps(src, dst, new Date(0)), expected);
    });
  });

  describe("When arguments is src, dst, fromto, converter/reverse", function () {
    it("Should succeed when 4th arg is a function", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: "A", "b.c": "B.C" };
      var expected = { A: 2, B: { C: 4, D: 20 } };
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, function (srcInfo) {
          return srcInfo.value * 2;
        }),
        expected,
      );
    });

    it("Should succeed when 4th arg is a boolean", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: "A", "b.c": "B.C", "b.d": "B.D" };
      var expected = { a: 10, b: { c: 2, d: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, fromto, true), expected);
    });

    it("Should ignore 4th arg when it is other type", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var map = { a: "A", "b.c": "B.C" };
      var expected = { A: 1, B: { C: 2, D: 20 } };
      assert.deepStrictEqual(copyProps(src, dst, map, undefined), expected);
      assert.deepStrictEqual(copyProps(src, dst, map, null), expected);
      assert.deepStrictEqual(copyProps(src, dst, map, 0), expected);
      assert.deepStrictEqual(copyProps(src, dst, map, 123), expected);
      assert.deepStrictEqual(copyProps(src, dst, map, ""), expected);
      assert.deepStrictEqual(copyProps(src, dst, map, "ABC"), expected);
      assert.deepStrictEqual(copyProps(src, dst, map, [1, 2]), expected);
      assert.deepStrictEqual(
        copyProps(src, dst, map, { a: 1, b: 2 }),
        expected,
      );
      assert.deepStrictEqual(copyProps(src, dst, map, new Date()), expected);
    });
  });

  describe("When arguments is src, dst, fromto, converter, reverse", function () {
    it("Should succeed when 5th arg is a boolean", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: "A", "b.c": "B.C", "b.d": "B.D" };
      var converter = function (srcInfo) {
        return srcInfo.value * 2;
      };
      var expected = { a: 20, b: { c: 2, d: 40 } };
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, true),
        expected,
      );
    });

    it("Should ignore 5th arg when it is other type", function () {
      var src = { a: 1, b: { c: 2 } };
      var dst = { A: 10, B: { D: 20 } };
      var fromto = { a: "A", "b.c": "B.C", "b.d": "B.D" };
      var converter = function (srcInfo) {
        return srcInfo.value * 2;
      };
      var expected = { A: 2, B: { C: 4, D: 20 } };
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, undefined),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, null),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, 0),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, 123),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, ""),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, "ABC"),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, [1, 2]),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, { a: 1, b: 2 }),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, new Date()),
        expected,
      );
      assert.deepStrictEqual(
        copyProps(src, dst, fromto, converter, function () {}),
        expected,
      );
    });
  });
});
