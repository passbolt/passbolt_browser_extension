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
 * @since         4.10.1
 */

import {OpenpgpAssertion} from "../../src/all/background_page/utils/openpgp/openpgpAssertions";
import DecryptMessageService from "../../src/all/background_page/service/crypto/decryptMessageService";

exports.toDecryptAndEqualTo = async function(armoredMessage, armoredPrivateKey, expectedMessage) {
  const {matcherHint} = this.utils;

  let pass, errorCause;
  try {
    const message = await OpenpgpAssertion.readMessageOrFail(armoredMessage);
    const privateKey = await OpenpgpAssertion.readKeyOrFail(armoredPrivateKey);
    const decryptedMessage = await DecryptMessageService.decrypt(message, privateKey);
    pass = decryptedMessage === expectedMessage;
  } catch (error) {
    errorCause = error;
    pass = false;
  }

  const passMessage =
    `${matcherHint('.not.toDecryptedDataEqualTo')
    }\n\n` +
    `Expected decrypted message not to be equal to`;

  let failMessage =
    `${matcherHint('.toDecryptedDataEqualTo')
    }\n\n` +
    `Expected decrypted message to be equal to`;

  if (errorCause) {
    failMessage += `\n\n${errorCause.message}`;
  }

  return {pass: pass, message: () => (pass ? passMessage : failMessage)};
};
