/**
 * Passbolt chrome file upload shenanigans
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
$(function () {

  function fileUpload(request, sender, sendResponse) {

    if (request.custom == "passbolt.file.open") {
      var fileChooser = document.createElement('input');
      fileChooser.type = 'file';

      fileChooser.addEventListener('change', function () {
        var file = fileChooser.files[0];

        var reader = new FileReader();
        reader.onload = function () {
          var data = reader.result;
          sendResponse({data: data});
        };
        reader.readAsText(file);
        form.reset();
      });

      var form = document.createElement('form');
      form.appendChild(fileChooser);
      fileChooser.click();
    }
    return true;
  }

  chrome.runtime.onMessage.removeListener(fileUpload);
  chrome.runtime.onMessage.addListener(fileUpload);
});
