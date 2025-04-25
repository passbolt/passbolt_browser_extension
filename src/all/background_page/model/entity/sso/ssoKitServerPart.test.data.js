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
 * @since         3.9.0
 */

import {buildMockedCryptoKey} from "../../../utils/assertions.test.data";

export const generateSsoKitServerData = async({alg = "AES-GCM", ext = true, key_ops = ["encrypt", "decrypt"]} = {}) => {
  const ssoServerKey = await buildMockedCryptoKey({algoName: alg, extractable: ext, usages: key_ops});
  const exportedKey = await crypto.subtle.exportKey("jwk", ssoServerKey);
  return Buffer.from(JSON.stringify(exportedKey)).toString("base64");
};
