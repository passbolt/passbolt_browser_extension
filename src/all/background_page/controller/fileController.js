/**
 * File controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const defer = require('../sdk/core/promise').defer;
var Worker = require('../model/worker');

/**
 * Save file on disk using download
 *
 * @param filename
 * @param content
 * @param tabid
 * @return {promise}
 */
function saveFile(filename, content, tabid) {
  var deferred = defer();
  var fileWorker = Worker.get('FileIframe', tabid);
  fileWorker.port.emit('passbolt.file-iframe.download', filename, content);
  deferred.resolve();
  return deferred.promise;
}
exports.saveFile = saveFile;

/**
 * Load the content of a file
 * @param path {string} Path of the file to load in the addon context
 * @return {promise}
 */
function loadFile (path) {
  var deferred = defer();
	var url = chrome.runtime.getURL(path);
  fetch(url).then(
    function (response) {deferred.resolve(response.text());},
    function (error) {deferred.reject(error);}
  );
  return deferred.promise;
}
exports.loadFile = loadFile;
