/**
 * FileHelper model.
 *
 * Helper for files.
 *
 * @copyright (c) 2017-present Passbolt SARL.
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */


/**
 * FileHelper constructor
 */
var FileHelper = function () {
  // void
};

/**
 * Transforms a base 64 encoded file content into a file object.
 * @param string b64Data
 * @param string contentType
 * @param integer sliceSize
 * @returns {*}
 */
FileHelper.b64toBlob = function(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, {type: contentType});
  return blob;
};


exports.FileHelper = FileHelper;