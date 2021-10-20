/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SARL (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SARL (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.2.0
 */
const User = require('../model/user').User;
const {OrganizationSettingsModel} = require('../model/organizationSettings/organizationSettingsModel');

const listen = function(worker) {
  /*
   * Get the organization settings.
   *
   * @listens passbolt.organization-settings.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.organization-settings.get', async requestId => {
    try {
      const apiClientOptions = await User.getInstance().getApiClientOptions();
      const organizationSettingsModel = new OrganizationSettingsModel(apiClientOptions);
      const organizationSettings = await organizationSettingsModel.getOrFind(true);
      worker.port.emit(requestId, 'SUCCESS', organizationSettings);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};
exports.listen = listen;
