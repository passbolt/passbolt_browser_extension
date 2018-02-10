/**
 * The passbolt file iframe
 * Module that performs the file operations such as download
 * Operations are done in an iframe to remain "hidden"
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {

  // The file module.
  var file = {};

  /**
   * Trigger a file download for a given content
   * @param filename {string} filename
   * @param content {string|blob} The text to download as a file, a base64 url, or a blob.
   */
  file.download = function (filename, content) {
      // Use download library to perform the download.
      download(content, filename, "text/plain");
  };

  // Ask the passbolt page to release its focus
  passbolt.message.on('passbolt.file-iframe.download', function (filename, content) {
    file.download(filename, content);
  });

});
