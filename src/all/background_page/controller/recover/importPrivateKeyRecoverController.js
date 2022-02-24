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

const {SetupEntity} = require("../../model/entity/setup/setupEntity");
const {GpgAuth} = require("../../model/gpgauth");
const {GpgKeyError} = require("../../error/GpgKeyError");
const {assertPrivateKeys} = require('../../utils/openpgp/openpgpAssertions');

class ImportPrivateKeyRecoverController {
  /**
   * Constructor.
   * @param {Worker} worker The associated worker.
   * @param {string} requestId The associated request id.
   * @param {SetupEntity} setupEntity The associated setup entity.
   */
  constructor(worker, requestId, setupEntity) {
    if (!setupEntity) {
      throw new Error("The setupEntity can't be null");
    }

    if (!(setupEntity instanceof SetupEntity)) {
      throw new Error("the setupEntity must be of type SetupEntity");
    }

    this.worker = worker;
    this.requestId = requestId;
    this.setupEntity = setupEntity;
    this.legacyAuthModel = new GpgAuth();
  }

  /**
   * Controller executor.
   * @param {string} armoredKey The key to import
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
   * Import user key.
   * @param {string} armoredKey The key to import
   * @returns {Promise<void>}
   */
  async exec(armoredKey) {
    const privateOpenpgpKey = await assertPrivateKeys(armoredKey);
    await this._assertImportKeyOwnedByUser(privateOpenpgpKey.fingerprint);
    this.setupEntity.userPrivateArmoredKey = privateOpenpgpKey.armor();
    this.setupEntity.userPublicArmoredKey = privateOpenpgpKey.toPublic().armor();
  }

  /**
   * Assert import key is owned by the user doing the recover.
   * @todo for now the function only check that the key is recognized by the server. The API does offer yet a way to verify that a key is associated to a user id.
   * @param {string} fingerprint The import key fingerprint
   * @returns {Promise<void>}
   * @throws {GpgKeyError} If the key is already used
   * @private
   */
  async _assertImportKeyOwnedByUser(fingerprint) {
    const domain = this.setupEntity.domain;
    const serverPublicArmoredKey = this.setupEntity.serverPublicArmoredKey;
    if (!serverPublicArmoredKey) {
      throw new Error('The server public key should have been provided before importing a private key');
    }

    try {
      await this.legacyAuthModel.verify(domain, serverPublicArmoredKey, fingerprint);
    } catch (error) {
      // @todo Handle not controlled errors, such as timeout error...
      throw new GpgKeyError('This key does not match any account.');
    }
  }
}

exports.ImportPrivateKeyRecoverController = ImportPrivateKeyRecoverController;
