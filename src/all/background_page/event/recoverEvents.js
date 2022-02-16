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
const {OrganizationSettingsModel} = require("../model/organizationSettings/organizationSettingsModel");
const {RecoverController} = require("../controller/recover/recoverController");
const Worker = require('../model/worker');
const {SetRecoverLocaleController} = require("../controller/locale/setRecoverLocaleController");
const {GetRecoverLocaleController} = require("../controller/locale/getRecoverLocaleController");
const {ApiClientOptions} = require("../service/api/apiClient/apiClientOptions");
const {RecoverInitiateAccountRecoveryRequestController} = require("../controller/recover/recoverInitiateAccountRecoveryRequestController");
const {RecoverGenerateAccountRecoveryRequestKeyController} = require("../controller/recover/recoverGenerateAccountRecoveryRequestKeyController");
const {VerifyPassphraseSetupController} = require("../controller/setup/verifyPassphraseSetupController");

const listen = function(worker) {
  /**
   * The recover controller.
   * @type {RecoverController}
   * @private
   */
  const recoverController = new RecoverController(worker, worker.tab.url);


  /*
   * Is the first install.
   *
   * @listens passbolt.recover.first-install
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.recover.first-install', async requestId => {
    try {
      const isFirstInstall = worker.tab.url.indexOf('first-install') !== -1;
      worker.port.emit(requestId, 'SUCCESS', isFirstInstall);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Retrieve the organization settings.
   *
   * @listens passbolt.organization-settings.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.organization-settings.get', async requestId => {
    try {
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl(recoverController.setupEntity.domain);
      const organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
      const organizationSettings = await organizationSettingsModel.getOrFind(true);
      worker.port.emit(requestId, 'SUCCESS', organizationSettings);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Get the runtime locale.
   *
   * The recover PageMod cannot use the common locale event listeners as these one need a browser extension already
   * configured with user settings in the local storage in order to perform API request.
   * @deprecated with multi-accounts support
   *
   * @listens passbolt.locale.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.get', async function(requestId) {
    const apiClientOptions = (new ApiClientOptions()).setBaseUrl(recoverController.setupEntity.domain);
    const getRecoverLocaleController = new GetRecoverLocaleController(this.worker, apiClientOptions, recoverController.setupEntity);

    try {
      const localeEntity = await getRecoverLocaleController.getLocale();
      worker.port.emit(requestId, 'SUCCESS', localeEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Set the user locale.
   *
   * @listens passbolt.locale.update-user-locale
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.update-user-locale', async function(requestId, localeDto) {
    try {
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl(recoverController.setupEntity.domain);
      const setRecoverLocaleController = new SetRecoverLocaleController(this.worker, apiClientOptions, recoverController.setupEntity);
      await setRecoverLocaleController.setLocale(localeDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Retrieve the recover info
   *
   * @listens passbolt.recover.info
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.recover.info', async requestId => {
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
  worker.port.on('passbolt.recover.import-key', async(requestId, armoredKey) => {
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
  worker.port.on('passbolt.recover.verify-passphrase', async(requestId, passphrase, rememberUntilLogout) => {
    const controller = new VerifyPassphraseSetupController(worker, requestId, recoverController.setupEntity);
    await controller._exec(passphrase, rememberUntilLogout);
  });

  /*
   * Set the user security token
   *
   * @listens passbolt.recover.set-security-token
   * @param requestId {uuid} The request identifier
   * @param securityTokenDto {object} The security token dto. ie: {color: hex-string, text-color: hex-string, code: string}
   */
  worker.port.on('passbolt.recover.set-security-token', async(requestId, securityTokenDto) => {
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
  worker.port.on('passbolt.recover.complete', async requestId => {
    try {
      await recoverController.complete();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });


  /*
   * Generate the account recover request key.
   *
   * @listens passbolt.recover.generate-account-recovery-request-key
   * @param requestId {uuid} The request identifier
   * @param generateGpgKeyPairDto {object} The key generation parameter
   */
  worker.port.on('passbolt.recover.generate-account-recovery-request-key', async(requestId, generateGpgKeyPairDto) => {
    const controller = new RecoverGenerateAccountRecoveryRequestKeyController(worker, requestId, recoverController.setupEntity);
    await controller._exec(generateGpgKeyPairDto);
  });

  /*
   * Create account recovery request.
   *
   * @listens passbolt.recover.initiate-account-recovery-request
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.recover.initiate-account-recovery-request', async requestId => {
    const controller = new RecoverInitiateAccountRecoveryRequestController(worker, requestId, recoverController.setupEntity);
    await controller._exec();
  });
};
exports.listen = listen;
