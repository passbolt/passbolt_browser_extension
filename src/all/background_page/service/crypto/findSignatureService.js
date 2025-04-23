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
 * @since         5.1.0
 */

import * as openpgp from 'openpgp';
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import ExternalGpgSignatureEntity from "passbolt-styleguide/src/shared/models/entity/gpgkey/externalGpgSignatureEntity";
import Uint8ArrayConvert from "../../utils/format/uint8ArrayConvert";

class FindSignatureService {
/**
 * Finds the signature for a given GPG key within an array of signatures.
 *
 * @param {Array<openpgp.VerificationResult>} verificationResults - An array of verified signatures to search through.
 * @param {openpgp.PublicKey|openpgp.PrivateKey} verifiedKey - The GPG key (public or private) to find the signature for.
 * @returns {ExternalGpgSignatureEntity} The signature entity corresponding to the verified key.
 */
  static async findSignatureForGpgKey(verificationResults, verifiedKey) {
    verificationResults.forEach(async verificationResult => await OpenpgpAssertion.assertVerificationResult(verificationResult));
    OpenpgpAssertion.assertKey(verifiedKey);

    for (const verificationResult of verificationResults) {
      const signature = await verificationResult.signature;

      const signatureKeyFingerprint = signature.packets.findPacket(openpgp.enums.packet.signature)?.issuerFingerprint;
      if (!signatureKeyFingerprint) { return; }

      const signatureKeyFingerprintHex = Uint8ArrayConvert.toHex(signatureKeyFingerprint).toLowerCase();
      if (verifiedKey.getFingerprint().toLowerCase() === signatureKeyFingerprintHex) {
        const isVerified = await verificationResult.verified.catch(() => false);

        return new ExternalGpgSignatureEntity({
          issuer_fingerprint: verifiedKey.getFingerprint(),
          is_verified: isVerified,
          created: signature.packets.findPacket(openpgp.enums.packet.signature).created.toISOString(),
        });
      }
    }
    return null;
  }
}

export default FindSignatureService;
