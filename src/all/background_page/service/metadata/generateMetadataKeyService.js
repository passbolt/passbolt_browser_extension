/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com"k)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.11.0
 */
import ExternalGpgKeyPairEntity from "passbolt-styleguide/src/shared/models/entity/gpgkey/external/externalGpgKeyPairEntity";
import * as openpgp from "openpgp";
import {assertString} from "../../utils/assertions";
import DecryptPrivateKeyService from "../crypto/decryptPrivateKeyService";
import SignGpgKeyService from "../crypto/signGpgKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";

class GenerateMetadataKeyService {
  /**
   * @param {AccountEntity} account The user account
   */
  constructor(account) {
    this.account = account;
  }

  /**
   * Generate metadata key.
   * @param {string} passphrase The user passphrase.
   * @return {Promise<ExternalGpgKeyPairEntity>}
   */
  async generateKey(passphrase) {
    assertString(passphrase);
    const userPrivateKey = await DecryptPrivateKeyService.decryptArmoredKey(this.account.userPrivateArmoredKey, passphrase);
    const email = `no-reply+${crypto.randomUUID()}@passbolt.com`;
    const keyOptions = {
      type: "ecc",
      curve: "ed25519",
      userIDs: [{name: "Passbolt Metadata Key", email: email}],
      format: "armored",
    };

    const key = await openpgp.generateKey(keyOptions);
    const publicKey = await OpenpgpAssertion.readKeyOrFail(key.publicKey);
    const signedPublicKey = await SignGpgKeyService.sign(publicKey, [userPrivateKey]);

    return new ExternalGpgKeyPairEntity({
      public_key: {armored_key: signedPublicKey.armor()},
      private_key: {armored_key: key.privateKey},
    });
  }
}

export default GenerateMetadataKeyService;
