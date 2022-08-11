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

import VerifyGpgKeyService from "../../src/all/background_page/service/crypto/verifyGpgKeyService";
import {OpenpgpAssertion} from "../../src/all/background_page/utils/openpgp/openpgpAssertions";

exports.toBeOpenpgpKeySignedBy = async function(armoredKey, armoredVerifyingKeys) {
  const {printExpected, matcherHint} = this.utils;

  const passMessage =
    `${matcherHint('.not.toBeOpenpgpKeySignedBy')
    }\n\n` +
    `Expected validation not to verify signature(s):\n` +
    `  ${printExpected(verifyingKeys)}\n`;

  const failMessage =
    `${matcherHint('.toBeOpenpgpKeySignedBy')
    }\n\n` +
    `Expected validation to verify signature(s):\n` +
    `  ${printExpected(verifyingKeys)}\n`;

  const key = await OpenpgpAssertion.readKeyOrFail(armoredKey);

  if (!Array.isArray(armoredVerifyingKeys)) {
    armoredVerifyingKeys = [armoredVerifyingKeys];
  }
  const verifyingKeys = await OpenpgpAssertion.readAllKeysOrFail(armoredVerifyingKeys);
  const pass = await VerifyGpgKeyService.verify(key, verifyingKeys);

  return {pass: pass, message: () => (pass ? passMessage : failMessage)};
};
