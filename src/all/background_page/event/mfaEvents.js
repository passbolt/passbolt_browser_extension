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

import PostponeUserSettingMFAInvitationController from '../controller/mfaPolicy/postponeUserSettingInvitationController';
import MfaGetPolicyController from '../controller/mfaPolicy/mfaGetPolicyController';
import User from "../model/user";
import MfaGetMfaSettingsController from '../controller/mfaPolicy/mfaGetMfaSettingsController';
import HasUserPostponedUserSettingInvitationMFAPolicyController from '../controller/mfaPolicy/hasUserPostponedUserSettingInvitationController';

/**
 * Listens to the account recovery continue application events
 * @param {Worker} worker The worker
 * @param {ApiClientOptions} apiClientOptions The api client options
 */
const listen = function(worker) {
  worker.port.on('passbolt.mfa-policy.has-user-postponed-user-setting-invitation', async requestId => {
    const controller = new HasUserPostponedUserSettingInvitationMFAPolicyController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-policy.postpone-user-setting-invitation', async requestId => {
    const controller = new PostponeUserSettingMFAInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-policy.get-policy', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new MfaGetPolicyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.mfa-policy.get-mfa-settings', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new MfaGetMfaSettingsController(worker, requestId, apiClientOptions);
    await controller._exec();
  });
};

export const MfaEvents = {listen};
