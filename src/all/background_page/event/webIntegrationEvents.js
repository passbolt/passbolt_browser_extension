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
const {WebIntegrationController} = require("../controller/webIntegration/webIntegrationController");
const User = require('../model/user').User;

/**
 * Listens the web integration events
 * @param worker
 */
const listen = function(worker) {
  /*
   * Whenever the the auto-save is required
   * @listens passbolt.web-integration.autosave
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.web-integration.autosave', async resourceToSave => {
    const webIntegrationController = new WebIntegrationController(worker);
    await webIntegrationController.autosave(resourceToSave);
  });

  /*
   * Check if the browser integration is configured.
   * @listens passbolt.addon.is-configured
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.addon.is-configured', function (requestId) {
    const user = User.getInstance();
    worker.port.emit(requestId, 'SUCCESS', user.isValid());
  });
};

exports.listen = listen;
