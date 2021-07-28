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
const {InformMenuController} = require("../controller/InformMenuController/InformMenuController");

/**
 * Listens the inform menu events
 * @param worker
 */
const listen = function (worker) {



  /** Whenever the in-form menu need initialization */
  worker.port.on('passbolt.in-form-menu.init', async function(requestId) {
    const informMenuController = new InformMenuController(worker);
    await informMenuController.getInitialConfiguration(requestId);
  });

  /** Whenever the user clicks on create new credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.create-new-credentials', async function(requestId) {
    const informMenuController = new InformMenuController(worker);
    await informMenuController.createNewCredentials(requestId);
  });

  /** Whenever the user clicks on create new credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.save-credentials', async function(requestId) {
    const informMenuController = new InformMenuController(worker);
    await informMenuController.saveCredentials(requestId);
  });

  /** Whenever the user clicks on browse credentials of the in-form-menu */
  worker.port.on('passbolt.in-form-menu.browse-credentials', async function(requestId) {
    const informMenuController = new InformMenuController(worker);
    informMenuController.browseCredentials(requestId);
  });
};

exports.listen = listen;
