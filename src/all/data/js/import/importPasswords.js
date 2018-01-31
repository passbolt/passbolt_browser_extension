/**
 * Handle import passwords interface.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  /**
   * string The selected file as a base 64.
   */
  var selectedFileBase64 = null;

  /**
   * ImportPasswordDialog the import password dialog component.
   */
  var importPasswordsDialog = null;

  /**
   * Initialize the import passwords dialog.
   */
  var init = function () {
    importPasswordsDialog = new ImportPasswordsDialog({
      "onSubmit":onSubmit
    });
    importPasswordsDialog.show();
  };

  /**
   * onSubmit handler.
   * @param selectedFile
   */
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
      importPasswordsDialog.close();
      displayReport(result);
    })
    .catch(function(e) {
      if (e.code == 'InvalidKey') {
        getKdbxCredentials();
      } else if (e.code == 'BadSignature') {
        importPasswordsDialog.showError("This is not a valid kdbx file");
      }
    });
  };

  /**
   * Import a file.
   * Request the add-on code to import a file.
   *
   * @param string fileBase64 the file converted into a base64 string
   * @param object credentials the credentials to decrypt the file, if necessary.
   */
  var importFile = function(fileBase64, credentials) {
    // Get file extension.
    var fileType = ImportPasswordsDialog.getFileExtension(importPasswordsDialog.selectedFile.name);

    return new Promise(function(resolve, reject) {
      var options = {
        "credentials":credentials
      };
      passbolt.request('passbolt.import-passwords.import-file', fileBase64, fileType, options)
      .then(
        function(result) {
          resolve(result);
        },
        function(e) {
          console.error("import file failure", e);
          reject(e);
        });
    });
  };

  /**
   * Converts a file object into a base 64 string and return it.
   * @param File file
   * @return Promise promise
   */
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

  /**
   * Get Kdbx credentials.
   * Display a window that will request the credentials to open a kdbx database.
   */
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

  /**
   * Display the final import report.
   * @param result
   */
  var displayReport = function(result) {
    var importPasswordsReportDialog = new ImportPasswordsReportDialog(result);
    importPasswordsReportDialog.show();
  };

  init();
});