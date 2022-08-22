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
import EntityValidationError from "./entityValidationError";

describe("EntityValidationError", () => {
  it("addErrors throw exception if property is not a string", () => {
    const t = () => {
      const e = new EntityValidationError('placeholder message');
      e.addError(null, null, null);
    };
    expect(t).toThrow(TypeError);
  });

  it("addErrors throw exception if rule is not a string", () => {
    const t = () => {
      const e = new EntityValidationError('placeholder message');
      e.addError('prop', null, null);
    };
    expect(t).toThrow(TypeError);
  });

  it("addErrors throw exception if message is not a string", () => {
    const t = () => {
      const e = new EntityValidationError('placeholder message');
      e.addError('prop', 'rule', null);
    };
    expect(t).toThrow(TypeError);
  });

  it("addErrors add exception details", () => {
    const e = new EntityValidationError('placeholder message');
    e.addError('prop1', 'rule1', 'message1');
    e.addError('prop2', 'rule1', 'message1');
    e.addError('prop1', 'rule2', 'message2');
    expect(e.details).toEqual({
      'prop1': {
        'rule1': 'message1',
        'rule2': 'message2'
      },
      'prop2': {
        'rule1': 'message1'
      }
    });

    expect(e.hasError('prop1')).toBe(true);
    expect(e.hasError('prop2')).toBe(true);
    expect(e.hasError('prop3')).toBe(false);
    expect(e.hasError('prop1', 'rule1')).toBe(true);
    expect(e.hasError('prop1', 'rule2')).toBe(true);
    expect(e.hasError('prop2', 'rule1')).toBe(true);
    expect(e.hasError('prop2', 'rule2')).toBe(false);
  });
});
