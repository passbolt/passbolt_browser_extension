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

import PostponeUserSettingMFAInvitationController from "../controller/mfaPolicy/postponeUserSettingMfaInvitationController";
import MfaGetPolicyController from "../controller/mfaPolicy/mfaGetPolicyController";
import MfaGetMfaSettingsController from "../controller/mfaPolicy/mfaGetMfaSettingsController";
import HasUserPostponedUserSettingInvitationMFAPolicyController from "../controller/mfaPolicy/hasUserPostponedUserSettingInvitationController";
import MfaSetupVerifyTotpCodeController from "../controller/mfaSetup/MfaSetupVerifyTotpCodeController";
import MfaSetupVerifyProviderController from "../controller/mfaSetup/MfaSetupVerifyProviderController";
import MfaSetupRemoveProviderController from "../controller/mfaSetup/MfaSetupRemoveProviderController";
import MfaSetupVerifyYubikeyCodeController from "../controller/mfaSetup/MfaSetupVerifyYubikeyCodeController";
import MfaSetupGetTotpCodeController from "../controller/mfaSetup/MfaSetupGetTotpCodeController";
import GetStartedWithDuoController from "../controller/mfaSetup/GetStartedWithDuoController";
import MfaSetupBeginWebauthnCeremonyController from "../controller/mfaSetup/MfaSetupBeginWebauthnCeremonyController";
import MfaSetupFinishWebauthnCeremonyController from "../controller/mfaSetup/MfaSetupFinishWebauthnCeremonyController";
import MfaSetupAbortWebauthnCeremonyController from "../controller/mfaSetup/MfaSetupAbortWebauthnCeremonyController";
import MfaSetupGetWebauthnCredentialsController from "../controller/mfaSetup/MfaSetupGetWebauthnCredentialsController";
import MfaSetupDeleteWebauthnCredentialController from "../controller/mfaSetup/MfaSetupDeleteWebauthnCredentialController";
import MfaSetupGetWebauthnSettingsController from "../controller/mfaSetup/MfaSetupGetWebauthnSettingsController";

/**
 * Listens to the MFA events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The api client options
 * @param {AccountEntity} account The account
 */
const listen = function (worker, apiClientOptions, account) {
  worker.port.on("passbolt.mfa-policy.has-user-postponed-user-setting-invitation", async (requestId) => {
    const controller = new HasUserPostponedUserSettingInvitationMFAPolicyController(worker, requestId);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-policy.postpone-user-setting-invitation", async (requestId) => {
    const controller = new PostponeUserSettingMFAInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-policy.get-policy", async (requestId) => {
    const controller = new MfaGetPolicyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-policy.get-mfa-settings", async (requestId) => {
    const controller = new MfaGetMfaSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-setup.verify-provider", async (requestId, providerDto) => {
    const controller = new MfaSetupVerifyProviderController(worker, requestId, apiClientOptions);
    await controller._exec(providerDto);
  });

  worker.port.on("passbolt.mfa-setup.verify-totp-code", async (requestId, code) => {
    const controller = new MfaSetupVerifyTotpCodeController(worker, requestId, apiClientOptions);
    await controller._exec(code);
  });

  worker.port.on("passbolt.mfa-setup.verify-yubikey-code", async (requestId, code) => {
    const controller = new MfaSetupVerifyYubikeyCodeController(worker, requestId, apiClientOptions);
    await controller._exec(code);
  });

  worker.port.on("passbolt.mfa-setup.remove-provider", async (requestId, providerDto) => {
    const controller = new MfaSetupRemoveProviderController(worker, requestId, apiClientOptions);
    await controller._exec(providerDto);
  });

  worker.port.on("passbolt.mfa-setup.get-totp-code", async (requestId, providerDto) => {
    const controller = new MfaSetupGetTotpCodeController(worker, requestId, apiClientOptions);
    await controller._exec(providerDto);
  });

  worker.port.on("passbolt.mfa-setup.start-with-duo", async (requestId) => {
    const controller = new GetStartedWithDuoController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-setup.begin-webauthn-ceremony", async (requestId) => {
    const controller = new MfaSetupBeginWebauthnCeremonyController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-setup.finish-webauthn-ceremony", async (requestId, name) => {
    const controller = new MfaSetupFinishWebauthnCeremonyController(worker, requestId, apiClientOptions, account);
    await controller._exec(name);
  });

  worker.port.on("passbolt.mfa-setup.abort-webauthn-ceremony", async (requestId) => {
    const controller = new MfaSetupAbortWebauthnCeremonyController(worker, requestId, apiClientOptions, account);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-setup.get-webauthn-credentials", async (requestId) => {
    const controller = new MfaSetupGetWebauthnCredentialsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on("passbolt.mfa-setup.delete-webauthn-credential", async (requestId, id) => {
    const controller = new MfaSetupDeleteWebauthnCredentialController(worker, requestId, apiClientOptions);
    await controller._exec(id);
  });

  worker.port.on("passbolt.mfa-setup.get-webauthn-settings", async (requestId) => {
    const controller = new MfaSetupGetWebauthnSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });
};

export const MfaEvents = { listen };
