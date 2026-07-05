/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.13.0
 */

import CborEncoderService from "./cborEncoderService";

const hex = (bytes) => Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

describe("CborEncoderService", () => {
  describe("::encode integers (RFC 8949 appendix A vectors)", () => {
    it.each([
      [0, "00"],
      [1, "01"],
      [10, "0a"],
      [23, "17"],
      [24, "1818"],
      [100, "1864"],
      [1000, "1903e8"],
      [1000000, "1a000f4240"],
      [-1, "20"],
      [-10, "29"],
      [-100, "3863"],
      [-1000, "3903e7"],
    ])("encodes %p as %p", (value, expected) => {
      expect(hex(CborEncoderService.encode(value))).toStrictEqual(expected);
    });

    it("throws on non-integer numbers", () => {
      expect(() => CborEncoderService.encode(1.5)).toThrow();
    });
  });

  describe("::encode strings and byte strings", () => {
    it("encodes an empty text string", () => {
      expect(hex(CborEncoderService.encode(""))).toStrictEqual("60");
    });

    it("encodes a text string", () => {
      expect(hex(CborEncoderService.encode("IETF"))).toStrictEqual("6449455446");
    });

    it("encodes a byte string", () => {
      expect(hex(CborEncoderService.encode(new Uint8Array([1, 2, 3, 4])))).toStrictEqual("4401020304");
    });
  });

  describe("::encode arrays and simple values", () => {
    it("encodes an empty array", () => {
      expect(hex(CborEncoderService.encode([]))).toStrictEqual("80");
    });

    it("encodes an array of integers", () => {
      expect(hex(CborEncoderService.encode([1, 2, 3]))).toStrictEqual("83010203");
    });

    it("encodes booleans and null", () => {
      expect(hex(CborEncoderService.encode(false))).toStrictEqual("f4");
      expect(hex(CborEncoderService.encode(true))).toStrictEqual("f5");
      expect(hex(CborEncoderService.encode(null))).toStrictEqual("f6");
    });
  });

  describe("::encode maps (CTAP2 canonical ordering)", () => {
    it("encodes an empty map", () => {
      expect(hex(CborEncoderService.encode(new Map()))).toStrictEqual("a0");
    });

    it("encodes a small integer-keyed map", () => {
      expect(hex(CborEncoderService.encode(new Map([[1, 2], [3, 4]])))).toStrictEqual("a201020304");
    });

    it("reorders keys into canonical order regardless of insertion order", () => {
      // Inserted 3 before 1, must be emitted 1 before 3.
      expect(hex(CborEncoderService.encode(new Map([[3, 4], [1, 2]])))).toStrictEqual("a201020304");
    });

    it("orders positive keys before negative keys of the same encoded length", () => {
      // key 1 -> 0x01, key -1 -> 0x20; length-first then bytewise => 1 before -1.
      expect(hex(CborEncoderService.encode(new Map([[-1, 1], [1, 1]])))).toStrictEqual("a201012001");
    });

    it("encodes a COSE-like EC2 key header deterministically", () => {
      // {1: 2, 3: -7, -1: 1} -> canonical keys 1,3,-1 => a3 0102 0326 2001
      const map = new Map([[3, -7], [-1, 1], [1, 2]]);
      expect(hex(CborEncoderService.encode(map))).toStrictEqual("a3010203262001");
    });
  });
});
