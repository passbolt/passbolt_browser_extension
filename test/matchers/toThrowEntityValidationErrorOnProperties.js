/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

export const contains = (equals, list, value) => list.findIndex(item => equals(item, value)) > -1;

/**
 * @deprecated To remove or adapt, works on promise only.
 */
exports.toThrowEntityValidationErrorOnProperties = function(error, expected) {
  const {printExpected, printReceived, matcherHint} = this.utils;
  const actual = error.details || [];

  const passMessage =
    `${matcherHint('.not.toThrowEntityValidationErrorOnProperties')
    }\n\n` +
    `Expected validation to not fail on properties:\n` +
    `  ${printExpected(expected)}\n` +
    `Received:\n` +
    `  ${printReceived(Object.keys(actual))}`;

  const failMessage =
    `${matcherHint('.toThrowEntityValidationErrorOnProperties')
    }\n\n` +
    `Expected validation to fail on properties:\n` +
    `  ${printExpected(expected)}\n` +
    `Received:\n` +
    `  ${printReceived(Object.keys(actual))}`;

  const objectKeys = Object.keys(actual);
  const pass = objectKeys.length === expected.length && expected.every(key => contains(this.equals, objectKeys, key));

  return {pass: pass, message: () => (pass ? passMessage : failMessage)};
};
