/**
 * Passbolt file manipulation helpers
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {

  /* ==================================================================================
   *  Create / Delete iframe
   * ================================================================================== */
  passbolt.file = {
    iframeId: 'passbolt-iframe-file'
  };

  /**
   * Init
   * @private
   */
  passbolt.file.init = function () {
    passbolt.file._createIframe();
  };

  /**
   * Create iframe
   * @private
   */
  passbolt.file._createIframe = function () {
    const iframeId = passbolt.file.iframeId;
    const appendTo = 'body';
    const style = 'position:absolute;bottom:0;right:0;width:1px;height:1px;'; // tu me vois, tu me vois plus
    passbolt.html.insertIframe(iframeId, appendTo, undefined, undefined, 'append', style);
  };

  /**
   * Delete iframe
   */
  passbolt.file._deleteIframe = function () {
    $(`#${passbolt.file.iframeId}`).remove();
  };

  /* ==================================================================================
   *  Utilities that do not need iframe
   *  Warning do not use these to handle sensitive data on a page
   *  as the content of the file will be available to that page
   *  Example:
   *  - OK: setup or debug pages
   *  - !OK: demo.passbolt.com login or main app pages
   * ================================================================================== */
  /**
   * Return the content of a file selected by the user
   *
   *
   * @returns string
   */
  passbolt.file.get = function() {
    return new Promise(function(resolve, reject) {
      var fileChooser = document.createElement('input');
      fileChooser.type = 'file';
      fileChooser.addEventListener('change', function () {
        var file = fileChooser.files[0];

        var reader = new FileReader();
        reader.onload = function () {
          var data = reader.result;
          resolve(data);
        };
        reader.readAsText(file);
        form.reset();
      });

      var form = document.createElement('form');
      form.appendChild(fileChooser);
      fileChooser.click();
    });
  };

  passbolt.file.init();

});
// result must be structured-clonable data
undefined;