/**
 * File controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('../sdk/self');
var __ = require('../sdk/l10n').get;
const defer = require('../sdk/core/promise').defer;

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

  deferred.resolve();
  return deferred.promise;
}
exports.saveFile = saveFile;

/**
 * Open file content using upload
 *
 * @return {promise} content of a file selected by the user
 */
function openFile() {
  var deferred = defer();
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {custom: "passbolt.file.open"}, function(response) {
      if(typeof response !== 'undefined' && typeof response.data !== 'undefined') {
        deferred.resolve(response.data);
      } else {
        deferred.reject(new Error(__('Something went wrong when trying to open the file. Please retry.')));
      }
    });
  });
  return deferred.promise;
}
exports.openFile = openFile;

/**
 * Get the prefered download directory path
 *
 * @return {promise}
 */
function getPreferredDownloadsDirectory() {
  var deferred = defer();
  deferred.reject(new Error('chrome/lib/fileController::getPreferredDownloadsDirectory missing'));
  return deferred.promise;
}
exports.getPreferredDownloadsDirectory = getPreferredDownloadsDirectory;

/**
 * Load file content.
 * @param path {string} Path of the file to load
 * @return {promise}
 */
function loadFile (path) {
  var deferred = defer();
	var url = chrome.runtime.getURL(path);
  fetch(url)
    .then(
      function (response) {
         deferred.resolve(response.text());
      },
      function (error) {
        deferred.reject(error);
      }
    );
  return deferred.promise;
}
exports.loadFile = loadFile;
