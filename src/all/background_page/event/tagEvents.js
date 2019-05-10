/**
 * Tag Listeners
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const Tag = require('../model/tag').Tag;

const listen = function (worker) {
  /*
   * Find all the tags
   *
   * @listens passbolt.tags.find-all
   * @param requestId {uuid} The request identifier
   * @param options {object} The options to apply to the find
   */
  worker.port.on('passbolt.tags.find-all', async function (requestId, options) {
    try {
      const tags = await Tag.findAll(options);
      worker.port.emit(requestId, 'SUCCESS', tags);
    } catch (error) {
      if (error instanceof Error) {
        worker.port.emit(requestId, 'ERROR', worker.port.getEmitableError(error));
      } else {
        worker.port.emit(requestId, 'ERROR', error);
      }
    }
  });
};
exports.listen = listen;
