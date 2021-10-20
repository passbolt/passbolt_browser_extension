/**
 * File controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const Config = require('../model/config');
const Worker = require('../model/worker');

/**
 * Save file on disk using download
 *
 * @param {String} filename
 * @param {Blob|String} content
 * @param {String} mimeType mime type
 * @param {int} tabid
 * @return {Promise}
 */
function saveFile(filename, content, mimeType, tabid) {
  if (!mimeType) {
    mimeType = "text/plain";
  }
  content = new Blob([content], {type: mimeType});

  return new Promise(resolve => {
    if (chrome.downloads) {
      const url = window.URL.createObjectURL(content);
      /*
       * Don't propose the "save as dialog" if running the test, the tests need the file to be automatically saved
       * in the default downloads directory.
       */
      const saveAs = !Config.isDebug();
      chrome.downloads.download(
        {url: url, filename: filename, saveAs: saveAs},
        () => {
          window.URL.revokeObjectURL(url);
          resolve();
        });
    } else {
      blobToDataURL(content)
        .then(dataUrl => {
          const fileWorker = Worker.get('FileIframe', tabid);
          fileWorker.port.emit('passbolt.file-iframe.download', filename, dataUrl);
          resolve();
        });
    }
  });
}
exports.saveFile = saveFile;

/**
 * Load the content of a file
 * @param path {string} Path of the file to load in the addon context
 * @return {Promise}
 */
function loadFile(path) {
  return new Promise((resolve, reject) => {
    const url = chrome.runtime.getURL(path);
    fetch(url).then(
      response => { resolve(response.text()); },
      error => { reject(error); }
    );
  });
}
exports.loadFile = loadFile;

/**
 * Convert a blob file into an ArrayBuffer.
 * @param blob
 * @return {Promise}
 */
function blobToArrayBuffer(blob) {
  return new Promise((resolve, reject) => {
    let arrayBuffer;
    try {
      const fileReader = new FileReader();
      fileReader.onload = function() {
        arrayBuffer = this.result;
        resolve(arrayBuffer);
      };
      fileReader.readAsArrayBuffer(blob);
    } catch (e) {
      reject(e);
    }
  });
}
exports.blobToArrayBuffer = blobToArrayBuffer;

/**
 * Transforms a base 64 encoded file content into a file object.
 * Useful when we need to transmit a file from the content code to the add-on code.
 * @param string b64Data
 * @param string contentType
 * @param integer sliceSize
 * @returns {*}
 */
function b64ToBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
exports.b64ToBlob = b64ToBlob;

/**
 * Blob to Data Url.
 * @param blob
 * @return {Promise}
 */
function blobToDataURL(blob) {
  return new Promise(resolve => {
    const a = new FileReader();
    a.onload = function(e) {
      resolve(e.target.result);
    };
    a.readAsDataURL(blob);
  });
}
exports.blobToDataURL = blobToDataURL;
