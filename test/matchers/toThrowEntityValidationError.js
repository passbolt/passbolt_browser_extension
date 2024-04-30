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
 * @since         4.8.0
 */

exports.toThrowEntityValidationError = function(received, propertyName, validationRule, dto) {
  const {printExpected, printReceived, matcherHint} = this.utils;
  let errorDetails;

  try {
    received();
  } catch (error) {
    errorDetails = error.details;
  }

  let expectedPropertyMessage = propertyName;
  if (validationRule) {
    expectedPropertyMessage += `:${validationRule}`;
  }

  let passMessage =
    `${matcherHint('.not.toThrowEntityValidationErrorOnProperty')
    }\n\n` +
    `Expected validation to not fail on property & optionally validation rule: ` +
    `  ${printExpected(expectedPropertyMessage)}\n` +
    `Received:\n` +
    `  ${printReceived(errorDetails)}`;

  let failMessage =
    `${matcherHint('.toThrowEntityValidationErrorOnProperty')
    }\n\n` +
    `Expected validation to fail on properties:\n` +
    `  ${printExpected(expectedPropertyMessage)}\n` +
    `Received:\n` +
    `  ${printReceived(errorDetails)}`;

  if (dto) {
    passMessage += `\nDTO:\n` +
    `  ${printReceived(dto)}\n`;
    failMessage += `\nDTO:\n` +
    `  ${printReceived(dto)}\n`;
  }

  const pass = Boolean(errorDetails)
    && propertyName in errorDetails
    && (!validationRule || validationRule in errorDetails[propertyName]);

  return {pass: pass, message: () => (pass ? passMessage : failMessage)};
};
