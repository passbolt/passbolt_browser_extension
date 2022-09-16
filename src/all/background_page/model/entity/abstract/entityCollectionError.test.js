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
 * @since         2.13.0
 */
import EntityCollectionError from "./entityCollectionError";

describe("EntityCollectionError", () => {
  it("constructor throw exception if position is empty", () => {
    const t = () => { new EntityCollectionError(null, null, null); };
    expect(t).toThrow(TypeError);
  });

  it("constructor throw exception if position is not a number", () => {
    const t = () => { new EntityCollectionError('test', 'test', 'test'); };
    expect(t).toThrow(TypeError);
  });

  it("constructor throw exception if rule is empty", () => {
    const t = () => { new EntityCollectionError(0, null, null); };
    expect(t).toThrow(TypeError);
  });

  it("constructor throw exception if rule is not a string", () => {
    const t = () => { new EntityCollectionError(0, [], 'test'); };
    expect(t).toThrow(TypeError);
  });

  it("constructor use default mesage if empty", () => {
    const e = new EntityCollectionError(0, 'test');
    expect(e.position).toBe(0);
    expect(e.rule).toBe('test');
    expect(e.message).toBe('Entity collection error.');
  });

  it("constructor throw exception if mesage is not a string", () => {
    const t = () => { new EntityCollectionError(0, 'test', []); };
    expect(t).toThrow(TypeError);
  });

  it("constructor throw exception if mesage is not a string", () => {
    const e = new EntityCollectionError(0, 'test', 'test');
    expect(e.position).toBe(0);
    expect(e.rule).toBe('test');
    expect(e.message).toBe('test');
  });
});
