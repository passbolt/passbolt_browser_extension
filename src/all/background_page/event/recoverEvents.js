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
const {SiteSettings} = require("../model/siteSettings");
const {RecoverController} = require("../controller/recover/recoverController");
const Worker = require('../model/worker');

const listen = function (worker) {
  /**
   * The recover controller.
   * @type {RecoverController}
   * @private
   */
  const recoverController = new RecoverController(worker, worker.tab.url);

  /*
   * Initialize the recovery process.
   *
   * @listens passbolt.recover.site-settings
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.recover.site-settings', async function (requestId) {
    try {
      const siteSettings = new SiteSettings(recoverController.setupEntity.domain);
      const siteSettingsDto = await siteSettings.get();
      worker.port.emit(requestId, 'SUCCESS', siteSettingsDto);
    } catch(error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

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
      // In case of unexpected error at this step, let the API treat the case.
      Worker.get('RecoverBootstrap', worker.tab.id).port.emit('passbolt.recover-bootstrap.remove-iframe');
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
   * @param rememberUntilLogout {boolean} The passphrase should be remembered until the user is logged out
   */
  worker.port.on('passbolt.recover.verify-passphrase', async function (requestId, passphrase, rememberUntilLogout) {
    try {
      await recoverController.verifyPassphrase(passphrase, rememberUntilLogout);
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
