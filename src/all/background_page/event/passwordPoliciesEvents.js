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
 * @since         4.2.0
 */
import FindPasswordPoliciesController from "../controller/passwordPolicies/findPasswordPoliciesController";
import GetOrFindPasswordPoliciesController from "../controller/passwordPolicies/getOrFindPasswordPoliciesController";
import SavePasswordPoliciesController from "../controller/passwordPolicies/savePasswordPoliciesController";

/**
 * Listens to the password policies events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions the api client options
 * @param {AccountEntity} account the user account
 */
const listen = function(worker, apiClientOptions, account) {
  worker.port.on('passbolt.password-policies.get', async requestId => {
    const controller = new GetOrFindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });

  worker.port.on('passbolt.password-policies.save', async(requestId, passwordSettingsDto) => {
    const controller = new SavePasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec(passwordSettingsDto);
  });

  worker.port.on('passbolt.password-policies.get-admin-settings', async requestId => {
    const controller = new FindPasswordPoliciesController(worker, requestId, account, apiClientOptions);
    await controller._exec();
  });
};

export const PasswordPoliciesEvents = {listen};
