/**
 * File controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const defer = require('sdk/core/promise').defer;

/**
 * Save file on disk using download
 *
 * @param filename
 * @param content
 * @return {promise}
 */
function saveFile(filename, content) {
  var deferred = defer();

  var a = document.createElement('a');
  var blob = new Blob([ content ], {type : "text/plain;charset=UTF-8"});
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  delete a;

  return deferred.resolve();
}
exports.saveFile = saveFile;

/**
 * Open file content using upload
 *
 * @return content of a file selected by the user
 */
function openFile() {
  var p = new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {custom: "passbolt.file.open"}, function(response) {
        if(typeof response !== 'undefined' && typeof response.data !== 'undefined') {
          resolve(response.data);
        } else {
          reject();
        }
      });
    });
  });
  return p;
}
exports.openFile = openFile;

/**
 * Get the prefered download directory path
 *
 * @return {string}
 */
function getPreferredDownloadsDirectory() {
  var deferred = defer();
  return deferred.reject(new Error('chrome/lib/fileController::getPreferredDownloadsDirectory missing'));
}
exports.getPreferredDownloadsDirectory = getPreferredDownloadsDirectory;

/**
 * Load file content.
 * @param path {string} Path of the file to load
 * @return {promise}
 */
function loadFile (path) {
  var url = chrome.runtime.getURL("data/" + path);
  return fetch(url).then(function (response) {
    return response.text();
  });
}
exports.loadFile = loadFile;