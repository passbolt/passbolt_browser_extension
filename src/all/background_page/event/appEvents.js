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
const Worker = require('../model/worker');

const listen = function(worker) {
  /*
   * Whenever the (React) app changes his route
   * @listens passbolt.app.route-changed
   * @param path The relative navigated-to path
   */
  worker.port.on('passbolt.app.route-changed', path => {
    if (/^\/[A-Za-z0-9\-\/]*$/.test(path)) {
      const appBoostrapWorker = Worker.get('AppBootstrap', worker.tab.id);
      appBoostrapWorker.port.emit('passbolt.app-bootstrap.change-route', path);
    }
  });
};
exports.listen = listen;
