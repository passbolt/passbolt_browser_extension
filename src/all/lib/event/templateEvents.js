/**
 * Generic template events
 *
 * Used when a template is requested by the content code and returned by the addon
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var fileController = require('../controller/fileController');

var listen = function (worker) {

  /*
   * Retrieve a template with its path.
   *
   * @listens passbolt.template.get
   * @param requestId {uuid} The request identifier
   * @param path {string} The template path to retrieve
   */
  worker.port.on('passbolt.template.get', function (requestId, path) {
    fileController.loadFile(path)
      .then(function(tpl) {
        worker.port.emit(requestId, 'SUCCESS', tpl);
      },function(error) {
        worker.port.emit(requestId, 'ERROR', error.message);
      });
  });

};
exports.listen = listen;
