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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Uint8ArrayConvert from "../../utils/format/uint8ArrayConvert";
import * as openpgp from "openpgp";


class GetSessionKeyService {
  /**
   * Returns the session key of the message.
   *
   * @param {openpgp.Message} message message message to get the session key.
   * @return {string}
   */
  static getFromGpgMessage(message) {
    OpenpgpAssertion.assertDecryptedMessage(message);
    const packetWithSessionKey = message.packets.findPacket(openpgp.enums.packet.publicKeyEncryptedSessionKey);
    const sessionKeyData = Uint8ArrayConvert.toHex(packetWithSessionKey.sessionKey);
    const sessionKeyAlgorithm = packetWithSessionKey.sessionKeyAlgorithm;

    return `${sessionKeyAlgorithm}:${sessionKeyData}`;
  }
}

export default GetSessionKeyService;
