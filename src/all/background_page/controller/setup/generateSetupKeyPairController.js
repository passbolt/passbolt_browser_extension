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
import GetGpgKeyCreationDateService from "../../service/crypto/getGpgKeyCreationDateService";
import GenerateGpgKeyPairOptionsEntity from "../../model/entity/gpgkey/generate/generateGpgKeyPairOptionsEntity";
import GenerateGpgKeyPairService from "../../service/crypto/generateGpgKeyPairService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import AccountTemporarySessionStorageService from "../../service/sessionStorage/accountTemporarySessionStorageService";
import FindAccountTemporaryService from "../../service/account/findAccountTemporaryService";
import FindUserKeyPoliciesSettingsService
  from "../../service/userKeyPolicies/findUserKeyPoliciesSettingsService";

/**
 * @typedef {({passphrase: string})} GenerateKeyPairPassphraseDto
 */

class GenerateSetupKeyPairController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {ApiClientOptions} apiClientOptions The api client options.
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.apiClientOptions = apiClientOptions;
    // The temporary account stored in the session storage
    this.temporaryAccount = null;
    this.findUserKeyPoliciesSettingsService = new FindUserKeyPoliciesSettingsService(apiClientOptions);
  }

  /**
   * Controller executor.
   * @param {GenerateKeyPairPassphraseDto} generateGpgKeyDto The meta used to generate the user key
   * @returns {Promise<void>}
   */
  async _exec(generateGpgKeyDto) {
    try {
      await this.exec(generateGpgKeyDto);
      this.worker.port.emit(this.requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, 'ERROR', error);
    }
  }

  /**
   * Generate a key pair and associate to the account being set up.
   *
   * @param {GenerateKeyPairPassphraseDto} generateGpgKeyDto
   * @returns {Promise<void>}
   */
  async exec(generateGpgKeyDto) {
    this.temporaryAccount = await FindAccountTemporaryService.exec(this.worker.port._port.name);
    const generateGpgKeyPairOptionsEntity = await this._buildGenerateKeyPairOptionsEntity(generateGpgKeyDto.passphrase);
    const keyPair = await GenerateGpgKeyPairService.generateKeyPair(generateGpgKeyPairOptionsEntity);
    const generatedPublicKey = await OpenpgpAssertion.readKeyOrFail(keyPair.publicKey.armoredKey);

    this.temporaryAccount.account.userKeyFingerprint = generatedPublicKey.getFingerprint().toUpperCase();
    this.temporaryAccount.account.userPrivateArmoredKey = keyPair.privateKey.armoredKey;
    this.temporaryAccount.account.userPublicArmoredKey = keyPair.publicKey.armoredKey;
    // The passphrase will be later use to sign in the user.
    this.temporaryAccount.passphrase = generateGpgKeyDto.passphrase;
    // Update all data in the temporary account stored
    await AccountTemporarySessionStorageService.set(this.temporaryAccount);
  }

  /**
   * Builds a default GenerateGpgKeyPairOptionsEntity with the given passphrase.
   *
   * @param {string} passphrase The passphrase used to protect the key.
   * @returns {Promise<GenerateGpgKeyPairOptionsEntity>}
   * @throw {EntityValidationError} if the generate key pair entity cannot be created with the given data.
   * @private
   */
  async _buildGenerateKeyPairOptionsEntity(passphrase) {
    const userId = this.temporaryAccount.account.userId;
    const authenticationToken = this.temporaryAccount.account.authenticationTokenToken;
    const userKeyPoliciesSettings = await this.findUserKeyPoliciesSettingsService.findSettingsAsGuest(userId, authenticationToken);

    const generateKeyPairOptionsDto = {
      name: `${this.temporaryAccount.account.firstName} ${this.temporaryAccount.account.lastName}`,
      email: this.temporaryAccount.account.username,
      passphrase: passphrase,
      date: await GetGpgKeyCreationDateService.getDate(this.apiClientOptions),
    };

    return GenerateGpgKeyPairOptionsEntity.createForUserKeyGeneration(userKeyPoliciesSettings, generateKeyPairOptionsDto);
  }
}

export default GenerateSetupKeyPairController;
