/**
 * File controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Save file on disk using download
 *
 * @param filename
 * @param content
 */
function saveFile(filename, content) {
  var a = document.createElement('a');
  var blob = new Blob([ content ], {type : "text/plain;charset=UTF-8"});
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  delete a;
}
exports.saveFile = saveFile;

/**
 * Open file content using upload
 *
 * @return content of a file selected by the user
 */
function uploadFile() {
  var p = new Promise(function(resolve, reject) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {custom: "passbolt.file.upload"}, function(response) {
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
exports.uploadFile = uploadFile;