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
const {User} = require('../model/user');
const {AccountRecoverySaveOrganisationSettingsController} = require("../controller/accountRecovery/AccountRecoverySaveOrganisationSettingsController");

/**
 * Listens the account recovery events
 * @param worker
 */
const listen = function(worker) {
  /** Whenever the account recovery organisation need to be saved */
  worker.port.on('passbolt.account-recovery.organization.save-settings', async(requestId, accountRecoveryOrganisationPolicyDto) => {
    const apiClientOptions =  await User.getInstance().getApiClientOptions();
    const accountRecoverySaveOrganisationSettingsController = new AccountRecoverySaveOrganisationSettingsController(worker, requestId, apiClientOptions);
    await accountRecoverySaveOrganisationSettingsController.exec(accountRecoveryOrganisationPolicyDto);
  });
};

exports.listen = listen;
