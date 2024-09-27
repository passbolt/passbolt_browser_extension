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
 * @since         4.9.4
 */

import splitBySize from "./splitBySize";

describe("splitBySize", () => {
  it('splits an array of length 6 into chunks of size 2', () => {
    expect.assertions(1);

    const arr = [1, 2, 3, 4, 5, 6];
    const size = 2;
    const result = splitBySize(arr, size);
    expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('splits an array of length 5 into chunks of size 2, with the last chunk smaller', () => {
    expect.assertions(1);

    const arr = [1, 2, 3, 4, 5];
    const size = 2;
    const result = splitBySize(arr, size);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('splits an array of length 1 into chunks of size 1', () => {
    expect.assertions(1);

    const arr = [1];
    const size = 1;
    const result = splitBySize(arr, size);
    expect(result).toEqual([[1]]);
  });

  it('splits an empty array into empty chunks', () => {
    expect.assertions(1);

    const arr = [];
    const size = 3;
    const result = splitBySize(arr, size);
    expect(result).toEqual([]);
  });

  it('splits an array into a single chunk if the size is larger than the array length', () => {
    expect.assertions(1);

    const arr = [1, 2, 3];
    const size = 5;
    const result = splitBySize(arr, size);
    expect(result).toEqual([[1, 2, 3]]);
  });

  it('splits an array into the correct number of chunks if the size is 1', () => {
    expect.assertions(1);

    const arr = [1, 2, 3];
    const size = 1;
    const result = splitBySize(arr, size);
    expect(result).toEqual([[1], [2], [3]]);
  });
});
