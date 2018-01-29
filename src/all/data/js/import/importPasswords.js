/**
 * Handle import passwords interface.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  var selectedFileBase64 = null;
  var importPasswordsDialog = null;

  /**
   * Initialize the master password dialog.
   */
  var init = function () {
    importPasswordsDialog = new ImportPasswordsDialog({
      "onSubmit":onSubmit
    });
    importPasswordsDialog.show();
  };

  
  var onSubmit = function(selectedFile) {
    getFileAsBase64String(selectedFile)
    .then(function(fileBase64) {
      selectedFileBase64 = fileBase64;
      var credentials = {
        password: null,
        keyFile: null
      };
      return importFile(fileBase64, credentials);
    })
    .then(function(result) {
      displayReport(result);
    })
    .catch(function(e) {
      console.log('error', e);
      if (e.code == 'InvalidKey') {
        getKdbxCredentials();
      } else if (e.code == 'BadSignature') {
        importPasswordsDialog.showError("This is not a valid kdbx file");
      }
    });
  };

  var importFile = function(fileBase64, credentials) {
    return new Promise(function(resolve, reject) {
      passbolt.request('passbolt.import-passwords.import-kdbx', fileBase64, credentials)
      .then(
        function() {
          resolve();
        },
        function(e) {
          console.log("failure", e);
          reject(e);
        });
    });
  };

  var getFileAsBase64String = function(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var base64Url = e.target.result;
          var fileBase64 = base64Url.split(",")[1];
          resolve(fileBase64);
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  var getKdbxCredentials = function() {
    var kdbxCredentials = new KdbxCredentialsDialog({
      onSubmit: function(password, keyFile) {
        // TODO: manage key file.
        var credentials = {
          password: password,
          keyFile: null
        };

        importFile(selectedFileBase64, credentials)
        .then(function(result) {
          displayReport(result);
        })
        .catch(function(e) {
          if (e.code == 'InvalidKey') {
            importPasswordsDialog.showError("Invalid password / keyfile provided. Please try again.");
          } else if (e.code == 'BadSignature') {
            importPasswordsDialog.showError("This is not a valid kdbx file");
          }
        });
      }
    });
    kdbxCredentials.show();
  };

  var displayReport = function(result) {
    console.log("import is done. Display report");
  };

  init();
});