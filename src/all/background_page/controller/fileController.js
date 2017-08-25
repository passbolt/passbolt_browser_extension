/**
 * File controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');

/**
 * Save file on disk using download
 *
 * @param filename
 * @param content
 * @param tabid
 * @return {Promise}
 */
function saveFile(filename, content, tabid) {
  return new Promise(function(resolve, reject) {
    var fileWorker = Worker.get('FileIframe', tabid);
    fileWorker.port.emit('passbolt.file-iframe.download', filename, content);
    resolve();
  });
}
exports.saveFile = saveFile;

/**
 * Load the content of a file
 * @param path {string} Path of the file to load in the addon context
 * @return {Promise}
 */
function loadFile (path) {
  return new Promise(function(resolve, reject) {
    var url = chrome.runtime.getURL(path);
    fetch(url).then(
      function (response) {resolve(response.text());},
      function (error) {reject(error);}
    );
  });
}
exports.loadFile = loadFile;
