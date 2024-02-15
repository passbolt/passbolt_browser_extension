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
 * @since         3.10.0
 */

import PostponeUserSettingMFAInvitationController from '../controller/mfaPolicy/postponeUserSettingMfaInvitationController';
import MfaGetPolicyController from '../controller/mfaPolicy/mfaGetPolicyController';
import MfaGetMfaSettingsController from '../controller/mfaPolicy/mfaGetMfaSettingsController';
import HasUserPostponedUserSettingInvitationMFAPolicyController from '../controller/mfaPolicy/hasUserPostponedUserSettingInvitationController';
import MfaSetupVerifyTotpCodeController from '../controller/mfaSetup/MfaSetupVerifyTotpCodeController';
import MfaSetupVerifyProviderController from '../controller/mfaSetup/MfaSetupVerifyProviderController';
import MfaSetupRemoveProviderController from '../controller/mfaSetup/MfaSetupRemoveProviderController';
import MfaSetupVerifyYubikeyCodeController from '../controller/mfaSetup/MfaSetupVerifyYubikeyCodeController';
import MfaSetupGetTotpCodeController from '../controller/mfaSetup/MfaSetupGetTotpCodeController';

/**
 * Listens to the MFA events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The api client options
 */
const listen = function(worker, apiClientOptions) {
  worker.port.on('passbolt.mfa-policy.has-user-postponed-user-setting-invitation', async requestId => {
    const controller = new HasUserPostponedUserSettingInvitationMFAPolicyController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-policy.postpone-user-setting-invitation', async requestId => {
    const controller = new PostponeUserSettingMFAInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-policy.get-policy', async requestId => {
    const controller = new MfaGetPolicyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-policy.get-mfa-settings', async requestId => {
    const controller = new MfaGetMfaSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-setup.verify-provider', async(requestId, providerDto) => {
    const controller = new MfaSetupVerifyProviderController(worker, requestId, apiClientOptions);
    await controller._exec(providerDto);
  });

  worker.port.on('passbolt.mfa-setup.verify-totp-code', async(requestId, code) => {
    const controller = new MfaSetupVerifyTotpCodeController(worker, requestId, apiClientOptions);
    await controller._exec(code);
  });

  worker.port.on('passbolt.mfa-setup.verify-yubikey-code', async(requestId, code) => {
    const controller = new MfaSetupVerifyYubikeyCodeController(worker, requestId, apiClientOptions);
    await controller._exec(code);
  });

  worker.port.on('passbolt.mfa-setup.remove-provider', async(requestId, providerDto) => {
    const controller = new MfaSetupRemoveProviderController(worker, requestId, apiClientOptions);
    await controller._exec(providerDto);
  });

  worker.port.on('passbolt.mfa-setup.get-totp-code', async(requestId, providerDto) => {
    const controller = new MfaSetupGetTotpCodeController(worker, requestId, apiClientOptions);
    await controller._exec(providerDto);
  });
};

export const MfaEvents = {listen};
