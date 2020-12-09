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
 */
const {RecoverController} = require("../controller/recover/recoverController");

const listen = function (worker) {
  /**
   * The recover controller.
   * @type {RecoverController}
   * @private
   */
  const recoverController = new RecoverController(worker, worker.tab.url);

  /*
   * Retrieve the recover info
   *
   * @listens passbolt.recover.info
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.recover.info', async function (requestId) {
    try {
      const setupEntity = await recoverController.retrieveRecoverInfo();
      worker.port.emit(requestId, 'SUCCESS', setupEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Import secret key.
   *
   * @listens passbolt.recover.import-key
   * @param requestId {uuid} The request identifier
   * @param armoredKey {string} The armored key to import
   */
  worker.port.on('passbolt.recover.import-key', async function (requestId, armoredKey) {
    try {
      await recoverController.importKey(armoredKey);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Verify secret key passphrase
   *
   * @listens passbolt.recover.verify-passphrase
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase used to verify the secret key
   * @param rememberMe {boolean} The passphrase should be remembered and used to login the user at the end of the setup process
   */
  worker.port.on('passbolt.recover.verify-passphrase', async function (requestId, passphrase) {
    try {
      await recoverController.verifyPassphrase(passphrase);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Set the user security token
   *
   * @listens passbolt.recover.set-security-token
   * @param requestId {uuid} The request identifier
   * @param securityTokenDto {object} The security token dto. ie: {color: hex-string, text-color: hex-string, code: string}
   */
  worker.port.on('passbolt.recover.set-security-token', async function (requestId, securityTokenDto) {
    try {
      recoverController.setSecurityToken(securityTokenDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Complete the recovery
   *
   * @listens passbolt.recover.complete
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.recover.complete', async function (requestId) {
    try {
      await recoverController.complete();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
exports.listen = listen;
