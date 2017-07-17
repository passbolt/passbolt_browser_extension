/**
 * Passbolt file manipulation helpers
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
(function (passbolt) {

  /* ==================================================================================
   *  Create / Delete iframe
   * ================================================================================== */
  var file = {
    iframeId: 'passbolt-iframe-file'
  };

  /**
   * Init
   * @private
   */
  file._init = function () {
    file._createIframe();
  };

  /**
   * Create secure clipboard iframe
   * @private
   */
  file._createIframe = function () {
    var iframeId = file.iframeId;
    var iframeUrl = chrome.runtime.getURL('data/' + iframeId + '.html') + '?passbolt=' + iframeId;
    var $iframe = $('<iframe/>', {
      id: iframeId,
      src: iframeUrl,
      frameBorder: 0,
      style: 'position:absolute;bottom:0;right:0;width:1px;height:1px;'
    });
    $('body').append($iframe);
  };

  /**
   * Delete secure clipboard iframe
   */
  clipboard._deleteIframe = function () {
    $('#' + clipboard.iframeId).remove();
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
    var defer = $.Deferred();
    var fileChooser = document.createElement('input');
    fileChooser.type = 'file';

    fileChooser.addEventListener('change', function () {
      var file = fileChooser.files[0];

      var reader = new FileReader();
      reader.onload = function () {
        var data = reader.result;
        defer.resolve(data);
      };
      reader.readAsText(file);
      form.reset();
    });

    var form = document.createElement('form');
    form.appendChild(fileChooser);
    fileChooser.click();
    return defer;
  };

  file.init();
  passbolt.file = file;

})(passbolt);
