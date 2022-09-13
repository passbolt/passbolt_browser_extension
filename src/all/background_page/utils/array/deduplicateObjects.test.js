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
 * @since         3.0.4
 */
import deduplicateObjects from "./deduplicateObjects";

describe("deduplicateObjects", () => {
  it("deduplicate array of objects", () => {
    const arr = [{prop: 1}, {prop: 2}, {prop: 1}, {prop: 2}];
    const dedupArr = deduplicateObjects(arr, 'prop');
    expect(dedupArr).toHaveLength(2);
    expect(dedupArr).toEqual(expect.arrayContaining([{prop: 1}, {prop: 2}]));
  });

  it("deduplicate array of objects with object not having the property of interest, should return the object not having this property", () => {
    const arr = [{prop: 1}, {prop: 2}, {noi_prop: 1}, {noi_prop: 2}];
    const dedupArr = deduplicateObjects(arr, 'prop');
    expect(dedupArr).toHaveLength(4);
    expect(dedupArr).toEqual(expect.arrayContaining([{prop: 1}, {prop: 2}, {noi_prop: 1}, {noi_prop: 2}]));
  });

  it("deduplicate array of objects even with not of interest different properties, should return the first occurrence found", () => {
    const arr = [{prop: 1, noi_prop: 1}, {prop: 2, noi_prop: 2}, {prop: 1, noi_prop: 3}, {prop: 2, noi_prop: 4}];
    const dedupArr = deduplicateObjects(arr, 'prop');
    expect(dedupArr).toHaveLength(2);
    expect(dedupArr).toEqual(expect.arrayContaining([{prop: 1, noi_prop: 1}, {prop: 2, noi_prop: 2}]));
  });

  it("deduplicate array of scalar should return all the values present in the original array", () => {
    const arr = [1, 2, 3];
    const dedupArr = deduplicateObjects(arr, 'prop');
    expect(dedupArr).toHaveLength(3);
    expect(dedupArr).toEqual(expect.arrayContaining(arr));
  });

  it("deduplicate with unsupported first parameter should throw an error", () => {
    const scenarios = {
      "null": null,
      "object": {prop: 1},
      "scalar": "string"
    };

    for (const scenario in scenarios) {
      try {
        deduplicateObjects(scenarios[scenario], 'prop');
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
      }
    }
  });

  it("deduplicate with unsupported second parameter should throw an error", () => {
    const scenarios = {
      "null": null,
      "object": {prop: 1},
      "integer": 10
    };

    for (const scenario in scenarios) {
      try {
        deduplicateObjects([{prop: 1}, {prop: 2}], scenarios[scenario]);
        expect(true).toBeFalsy();
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
      }
    }
  });
});
