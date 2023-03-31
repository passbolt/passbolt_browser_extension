/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2021 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         hackaton
 */
import PasswordPolicyGetController from "../controller/passwordPolicies/passwordPolicyGetController";
import PasswordPolicyCreateController from '../controller/passwordPolicies/passwordPolicyCreateController';
import HasUserPostponedUserSettingInvitationPasswordPolicyController from '../controller/passwordPolicies/hasUserPostponedUserSettingInvitationController';
import PostponeUserSettingPasswordInvitationController from '../controller/passwordPolicies/postponeUserSettingInvitationController';
import RequireReviewEntropyController from '../controller/passwordPolicies/requireReviewEntropyController';
import HasReviewEntropyController from '../controller/passwordPolicies/hasReviewEntropyController';
import User from "../model/user";

const listen = function(worker) {
  worker.port.on('passbolt.password-policies.has-user-postponed-user-setting-invitation', async requestId => {
    const controller = new HasUserPostponedUserSettingInvitationPasswordPolicyController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policies.postpone-user-setting-invitation', async requestId => {
    const controller = new PostponeUserSettingPasswordInvitationController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policies.get', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new PasswordPolicyGetController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policies.need-review', async requestId => {
    const controller = new HasReviewEntropyController(worker, requestId);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policies.request-review-entropy', async requestId => {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const controller = new RequireReviewEntropyController(worker, requestId, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policy.create', async(requestId, passwordPolicyDto)  => {
    const controller = new PasswordPolicyCreateController(worker, requestId, passwordPolicyDto);
    await controller._exec();
  });
};


export const PasswordPoliciesEvents = {listen};
