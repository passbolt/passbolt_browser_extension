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
const {AbstractService} = require('../abstract/abstractService');
const {GetGpgKeyInfoService} = require("../../crypto/getGpgKeyInfoService");
const {GpgAuth} = require('../../../model/gpgauth');
const {Keyring} = require('../../../model/keyring');

const ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME = '/account-recovery/organization-policies';

class AccountRecoveryOrganizationPolicyService extends AbstractService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @public
   */
  constructor(apiClientOptions) {
    super(apiClientOptions, AccountRecoveryOrganizationPolicyService.RESOURCE_NAME);
  }

  /**
   * API Resource Name
   *
   * @returns {string}
   * @public
   */
  static get RESOURCE_NAME() {
    return ACCOUNT_RECOVERY_ORGANIZATION_POLICY_SERVICE_RESOURCE_NAME;
  }

  /**
   * Return the list of supported options for the contain option in API find operations
   *
   * @returns {Array<string>} list of supported option
   */
  static getSupportedContainOptions() {
    return [
      "creator",
      "creator.gpgkey",
    ];
  }

  /**
   * Find an organization settings of an accountRecovery
   *
   * @returns {Promise<*>} response body
   * @throws {Error} if options are invalid or API error
   * @public
   */
  async find(contains) {
    const options = contains ? this.formatContainOptions(contains, AccountRecoveryOrganizationPolicyService.getSupportedContainOptions()) : null;
    const response = await this.apiClient.findAll(options);
    return response.body;
  }

  /**
   * Save organization settings of an accountRecovery using Passbolt API
   *
   * @param {Object} accountRecoveryOrganizationPolicyDto
   * @returns {Promise<*>} Response body
   * @throw {TypeError} if account recovery organization policy dto is null
   * @public
   */
  async saveOrganizationPolicy(accountRecoveryOrganizationPolicyDto) {
    this.assertNonEmptyData(accountRecoveryOrganizationPolicyDto);

    const response = await this.apiClient.create(accountRecoveryOrganizationPolicyDto);
    return response.body;
  }

  /**
   * Validate the new ORK by checking that the key:
   * - uses the right algorithm
   * - is public
   * - is not revoked
   * - is not expired
   * - size/length is at least 4096
   * - it's not the server key
   * - it's not already used by a user
   * - it's not the previous ORK
   *
   * @param {AccountRecoveryOrganizationPublicKeyDto} newAccountRecoveryOrganizationPublicKeyDto
   * @param {AccountRecoveryOrganizationPublicKeyDto} currentAccountRecoveryOrganizationPublicKeyDto
   * @throws {Error} if any of the checks are wrong
   */
  static async validatePublicKey(newAccountRecoveryOrganizationPublicKeyDto, currentAccountRecoveryOrganizationPublicKeyDto) {
    const keyInfo = await GetGpgKeyInfoService.getKeyInfo(newAccountRecoveryOrganizationPublicKeyDto.armored_key);

    if (keyInfo.algorithm !== "RSA") {
      throw new Error(`The algorithm used for the key is ${keyInfo.algorithm} but, must be RSA.`);
    }

    if (keyInfo.private) {
      throw new Error(`The key must be a public key.`);
    }

    if (keyInfo.revoked) {
      throw new Error(`The key is revoked.`);
    }

    if (keyInfo.expires !== "Never") {
      const now = Date.now();
      const expirationDate = new Date(keyInfo.expires);

      if (expirationDate < now) {
        throw new Error(`The key is expired.`);
      }
    }

    if (keyInfo.length < 4096) {
      throw new Error(`The key size is of ${keyInfo.length} bits but, must be at least of 4096 bits.`);
    }

    const keyring = new Keyring();
    const gpgAuth = new GpgAuth(keyring);

    const serverKey = await gpgAuth.getServerKey();
    if (serverKey.fingerprint.toUpperCase() === keyInfo.fingerprint) {
      throw new Error("The key is the current server key, the organization recovery key must be a new one.");
    }

    await keyring.sync();
    const publicKeys = keyring.getPublicKeysFromStorage();
    for (const id in publicKeys) {
      const publicKey = publicKeys[id];
      if (publicKey.fingerprint.toUpperCase() === keyInfo.fingerprint) {
        throw new Error("The key is already being used, the organization recovery key must be a new one.");
      }
    }

    if (!currentAccountRecoveryOrganizationPublicKeyDto) {
      return;
    }

    const currentOrkInfo = await GetGpgKeyInfoService.getKeyInfo(currentAccountRecoveryOrganizationPublicKeyDto.armored_key);
    if (currentOrkInfo.fingerprint === keyInfo.fingerprint) {
      throw new Error("The key is the current organization recovery key, you must provide a new one.");
    }
  }
}

exports.AccountRecoveryOrganizationPolicyService = AccountRecoveryOrganizationPolicyService;
