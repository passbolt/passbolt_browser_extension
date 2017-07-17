/**
 * File controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;
const defer = require('../sdk/core/promise').defer;

/**
 * Save file on disk using download
 *
 * @param filename
 * @param content
 * @return {promise}
 */
function saveFile(filename, content, tabid) {
  var deferred = defer();

  var clipboardWorker = Worker.get('FileIframe', tabid);
  clipboardWorker.port.emit('passbolt.file-iframe.copy', txt);
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
