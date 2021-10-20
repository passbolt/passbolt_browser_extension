/**
 * Pagemod events
 *
 * Used to handle the events related to the current pagemod
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const listen = function(worker) {
  /*
   * Check that the pagemod page is ready.
   *
   * @listens passbolt.pagemod.is-ready
   * @param {uuid} requestId The request identifier
   */
  worker.port.on("passbolt.pagemod.is-ready", async requestId => {
    worker.port.emit(requestId, 'SUCCESS');
  });
};

exports.listen = listen;
