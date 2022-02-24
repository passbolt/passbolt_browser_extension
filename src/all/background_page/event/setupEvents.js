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
const {SetupController} = require("../controller/setup/setupController");
const Worker = require('../model/worker');
const {SetSetupLocaleController} = require("../controller/locale/setSetupLocaleController");
const {GetSetupLocaleController} = require("../controller/locale/getSetupLocaleController");
const {ApiClientOptions} = require("../service/api/apiClient/apiClientOptions");
const {VerifyPassphraseSetupController} = require("../controller/setup/verifyPassphraseSetupController");
const {GenerateKeyPairSetupController} = require("../controller/setup/generateKeyPairSetupController");
const {SetupSetAccountRecoveryUserSettingController} = require("../controller/setup/setupSetAccountRecoveryUserSettingController");
const {ImportPrivateKeySetupController} = require("../controller/setup/importPrivateKeySetupController");

const listen = function(worker) {
  /**
   * The setup controller.
   * @type {SetupController}
   * @private
   */
  const setupController = new SetupController(worker, worker.tab.url);

  /*
   * Is the browser extension just installed.
   *
   * @listens passbolt.setup.is-first-install
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.is-first-install', async requestId => {
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
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl(setupController.setupEntity.domain);
      const organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
      const organizationSettings = await organizationSettingsModel.getOrFind(true);
      worker.port.emit(requestId, 'SUCCESS', organizationSettings);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Get runtime locale.
   *
   * The setup PageMod cannot use the common locale event listeners as these one need a browser extension already
   * configured with user settings in the local storage in order to perform API request.
   * @deprecated with multi-accounts support
   *
   * @listens passbolt.locale.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.get', async function(requestId) {
    const apiClientOptions = (new ApiClientOptions()).setBaseUrl(setupController.setupEntity.domain);
    const getSetupLocaleController = new GetSetupLocaleController(this.worker, apiClientOptions, setupController.setupEntity);

    try {
      const localeEntity = await getSetupLocaleController.getLocale();
      worker.port.emit(requestId, 'SUCCESS', localeEntity);
    } catch (error) {
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
      const apiClientOptions = (new ApiClientOptions()).setBaseUrl(setupController.setupEntity.domain);
      const setSetupLocaleController = new SetSetupLocaleController(this.worker, apiClientOptions, setupController.setupEntity);
      await setSetupLocaleController.setLocale(localeDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Retrieve the setup info
   *
   * @listens passbolt.setup.info
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.info', async requestId => {
    try {
      const setupEntity = await setupController.retrieveSetupInfo();
      worker.port.emit(requestId, 'SUCCESS', setupEntity);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
      // In case of unexpected error at this step, let the API treat the case.
      Worker.get('SetupBootstrap', worker.tab.id).port.emit('passbolt.setup-bootstrap.remove-iframe');
    }
  });

  /*
   * Generate the user secret key.
   *
   * @listens passbolt.setup.generate-key
   * @param requestId {uuid} The request identifier
   * @param generateGpgKeyDto {object} The key generation parameter
   */
  worker.port.on('passbolt.setup.generate-key', async(requestId, generateGpgKeyDto) => {
    const controler = new GenerateKeyPairSetupController(worker, requestId, setupController.setupEntity);
    await controler._exec(generateGpgKeyDto);
  });

  /*
   * Download the recovery kit.
   *
   * @listens passbolt.setup.download-recovery-kit
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.download-recovery-kit', async requestId => {
    try {
      await setupController.downloadRecoveryKit();
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Retrieve the account recovery organization policy if any.
   *
   * @listens passbolt.setup.get-account-recovery-organization-policy
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.setup.get-account-recovery-organization-policy', async requestId => {
    try {
      const accountRecoveryOrganizationPolicy = await setupController.getAccountRecoveryOrganizationPolicy();
      worker.port.emit(requestId, 'SUCCESS', accountRecoveryOrganizationPolicy);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Set the account recovery user setting.
   *
   * @listens passbolt.setup.set-account-recovery-user-setting
   * @param requestId {uuid} The request identifier
   * @param accountRecoveryUserSettingDto {object} The account recovery user settings
   */
  worker.port.on('passbolt.setup.set-account-recovery-user-setting', async(requestId, accountRecoveryUserSettingDto) => {
    const controller = new SetupSetAccountRecoveryUserSettingController(worker, requestId, setupController.setupEntity);
    await controller._exec(accountRecoveryUserSettingDto);
  });

  /*
   * Import secret key.
   *
   * @listens passbolt.setup.import-key
   * @param requestId {uuid} The request identifier
   * @param armoredKey {string} The armored key to import
   */
  worker.port.on('passbolt.setup.import-key', async(requestId, armoredKey) => {
    const controller = new ImportPrivateKeySetupController(worker, requestId, setupController.setupEntity);
    await controller._exec(armoredKey);
  });

  /*
   * Verify secret key passphrase
   *
   * @listens passbolt.setup.verify-passphrase
   * @param requestId {uuid} The request identifier
   * @param passphrase {string} The passphrase used to verify the secret key
   * @param rememberUntilLogout {boolean} The passphrase should be remembered until the user is logged out
   */
  worker.port.on('passbolt.setup.verify-passphrase', async(requestId, passphrase, rememberUntilLogout) => {
    const controller = new VerifyPassphraseSetupController(worker, requestId, setupController.setupEntity);
    await controller._exec(passphrase, rememberUntilLogout);
  });

  /*
   * Set the user security token
   *
   * @listens passbolt.setup.set-security-token
   * @param requestId {uuid} The request identifier
   * @param securityTokenDto {object} The security token dto. ie: {color: hex-string, text-color: hex-string, code: string}
   */
  worker.port.on('passbolt.setup.set-security-token', async(requestId, securityTokenDto) => {
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
  worker.port.on('passbolt.setup.complete', async requestId => {
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
