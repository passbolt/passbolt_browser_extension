/**
 * Generic template events
 *
 * Used when a template is requested by the content code and returned by the addon
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var data = require('sdk/self').data;

var listen = function (worker) {

  /*
   * Retrieve a template with its path.
   *
   * @listens passbolt.template.get
   * @param requestId {int} The request identifier
   * @param path {string} The template path to retrieve
   */
  worker.port.on('passbolt.template.get', function (requestId, path) {
    var tpl = data.load(path);
    worker.port.emit('passbolt.template.get.complete', requestId, 'SUCCESS', tpl);
  });

};
exports.listen = listen;
