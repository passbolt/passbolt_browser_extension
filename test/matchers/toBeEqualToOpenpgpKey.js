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
import GetGpgKeyInfoService from "../../src/all/background_page/service/crypto/getGpgKeyInfoService";
import {OpenpgpAssertion} from "../../src/all/background_page/utils/openpgp/openpgpAssertions";

export const contains = (equals, list, value) => list.findIndex(item => equals(item, value)) > -1;

exports.toBeEqualToOpenpgpKey = async function(armoredKeyA, armoredKeyB) {
  const {printExpected, printReceived, matcherHint} = this.utils;
  const keyA = await OpenpgpAssertion.readKeyOrFail(armoredKeyA);
  const keyB = await OpenpgpAssertion.readKeyOrFail(armoredKeyB);
  const keyAInfo = await GetGpgKeyInfoService.getKeyInfo(keyA);
  const keyBInfo = await GetGpgKeyInfoService.getKeyInfo(keyB);

  const passMessage =
    `${matcherHint('.not.toBeEqualToOpenpgpKey')
    }\n\n` +
    `Expected validation to not fail on key:\n` +
    `  ${printExpected(keyBInfo)}\n` +
    `Received:\n` +
    `  ${printReceived(keyAInfo)}`;

  const failMessage =
    `${matcherHint('.toBeEqualToOpenpgpKey')
    }\n\n` +
    `Expected validation to fail on key:\n` +
    `  ${printExpected(keyBInfo)}\n` +
    `Received:\n` +
    `  ${printReceived(keyAInfo)}`;

  const pass = keyAInfo.keyId === keyBInfo.keyId
    && keyAInfo.fingerprint === keyBInfo.fingerprint;

  return {pass: pass, message: () => (pass ? passMessage : failMessage)};
};
