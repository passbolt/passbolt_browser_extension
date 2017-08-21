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
   * @param txt {string} The text to download as a file
   * @return promise
   */
  file.download = function (filename, content) {

    var a = document.createElement('a');
    var blob = new Blob([ content ], {type : "text/plain;charset=UTF-8"});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    delete a;

  };

  // Ask the passbolt page to release its focus
  passbolt.message.on('passbolt.file-iframe.download', function (filename, content) {
    file.download(filename, content);
  });

});
