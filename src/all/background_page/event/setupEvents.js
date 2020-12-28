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
const {SetupController} = require("../controller/setup/setupController");

const listen = function (worker) {
  /**
   * The setup controller.
   * @type {SetupController}
   * @private
   */
  const setupController = new SetupController(worker, worker.tab.url);

  /*
   * Retrieve the setup info
   *
   * @listens passbolt.setup.info
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.info', async function (requestId) {
    try {
      const setupEntity = await setupController.retrieveSetupInfo();
      worker.port.emit(requestId, 'SUCCESS', setupEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Generate the user secret key.
   *
   * @listens passbolt.setup.generate-key
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase used to generate the key
   */
  worker.port.on('passbolt.setup.generate-key', async function (requestId, passphrase) {
    try {
      await setupController.generateKey(passphrase);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Download the recovery kit.
   *
   * @listens passbolt.setup.download-recovery-kit
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.download-recovery-kit', async function (requestId) {
    try {
      await setupController.downloadRecoveryKit();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Import secret key.
   *
   * @listens passbolt.setup.import-key
   * @param requestId {uuid} The request identifier
   * @param armoredKey {string} The armored key to import
   */
  worker.port.on('passbolt.setup.import-key', async function (requestId, armoredKey) {
    try {
      await setupController.importKey(armoredKey);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Verify secret key passphrase
   *
   * @listens passbolt.setup.verify-passphrase
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase used to verify the secret key
   * @param rememberUntilLogout {boolean} The passphrase should be remembered until the user is logged out
   */
  worker.port.on('passbolt.setup.verify-passphrase', async function (requestId, passphrase, rememberUntilLogout) {
    try {
      await setupController.verifyPassphrase(passphrase, rememberUntilLogout);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Set the user security token
   *
   * @listens passbolt.setup.set-security-token
   * @param requestId {uuid} The request identifier
   * @param securityTokenDto {object} The security token dto. ie: {color: hex-string, text-color: hex-string, code: string}
   */
  worker.port.on('passbolt.setup.set-security-token', async function (requestId, securityTokenDto) {
    try {
      setupController.setSecurityToken(securityTokenDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Complete the setup
   *
   * @listens passbolt.setup.complete
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.complete', async function (requestId) {
    try {
      await setupController.complete();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
exports.listen = listen;
