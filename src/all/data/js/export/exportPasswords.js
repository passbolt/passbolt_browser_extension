/**
 * Handle export passwords interface.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {

  /**
   * ExportPasswordDialog the export password dialog component.
   */
  var exportPasswordsDialog = null;

  /**
   * Initialize the export passwords dialog.
   */
  var init = function () {
    exportPasswordsDialog = new ExportPasswordsDialog({
      "onSubmit":onSubmit
    });
    exportPasswordsDialog.show();
  };

  /**
   * onSubmit handler.
   * @param selectedFormat
   */
  var onSubmit = function(selectedFormat) {
    if (selectedFormat == 'kdbx') {
      requestKdbxCredentials();
    }
    else {
      exportFile(selectedFormat);
    }
  };

  /**
   * Export a file.
   * Request the add-on code to export a file.
   *
   * @param string fileBase64 the file converted into a base64 string
   * @param object credentials the credentials to decrypt the file, if necessary.
   */
  var exportFile = function(selectedFormat, credentials) {
    var options = {
      "format": selectedFormat,
      "credentials": credentials
    };
    passbolt.request('passbolt.export-passwords.export-to-file', options)
    .then(function() {
      // Once export is completed, close dialog.
      exportPasswordsDialog.destroy();
    });
  };

  /**
   * Get Kdbx credentials.
   * Display a window that will request the credentials to open a kdbx database.
   */
  var requestKdbxCredentials = function() {
    var kdbxCredentials = new KdbxCredentialsDialog({
      title: "Choose password and/or key file",
      ctaLabel: "Continue export",
      onSubmit: function(password, keyFile) {
        getKdbxCredentials(password, keyFile)
        .then(function(credentials) {
          exportFile('kdbx', credentials);
        });
      }
    });
    kdbxCredentials.show();
  };

  /**
   * Transforms kdbxcredentials into a messageable format.
   * The keyfile will be transformed into a base64 content if any.
   * @param password
   * @param keyFile
   */
  var getKdbxCredentials = function(password, keyFile) {
    var credentials = {
      password: password,
      keyFile: null
    };

    return new Promise(function(resolve, reject) {
      if (keyFile != null) {
        getFileAsBase64String(keyFile)
        .then(function(keyFileBase64) {
          credentials.keyFile = keyFileBase64;
          resolve(credentials);
        });
      }
      else {
        resolve(credentials);
      }
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

  init();
});