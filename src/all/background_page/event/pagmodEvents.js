/**
 * User events
 *
 * Used to handle the events related to the current user
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const app = require('../app');

const listen = function (worker) {
  /*
   * Check that the pagemod page is ready.
   *
   * @listens passbolt.pagemod.is-ready
   * @param {uuid} requestId The request identifier
   */
  worker.port.on("passbolt.pagemod.is-ready", async function (requestId) {
    worker.port.emit(requestId, 'SUCCESS');
  });
};

exports.listen = listen;
