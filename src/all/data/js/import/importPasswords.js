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


  var fileExtension = null;

  /**
   * Import options
   * @type {{categoriesAsTags: boolean}}
   */
  var importOptions = {
    tagsIntegration : false,
    categoriesAsTags : false
  };

  /**
   * Initialize the import passwords dialog.
   */
  var init = function () {
    passbolt.request('passbolt.site.settings')
    .then(
      function(siteSettings) {
        if(siteSettings !== null && siteSettings.passbolt !== undefined &&
          siteSettings.passbolt.plugins !== undefined && siteSettings.passbolt.plugins.tags !== undefined) {
          importOptions.tagsIntegration = true;
        }

        importPasswordsDialog = new ImportPasswordsDialog({
          "onSubmit":onSubmit,
          "tagsIntegration": importOptions.tagsIntegration
        });
        importPasswordsDialog.show();
      });
  };

  /**
   * onSubmit handler.
   * @param selectedFile
   * @param options
   */
  var onSubmit = function(selectedFile, options) {
    fileExtension = ImportPasswordsDialog.getFileExtension(selectedFile.name);

    importOptions = $.extend(importOptions, options);

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
      // if file extension is kdbx,
      if (fileExtension == 'kdbx') {
        if (e.code == 'InvalidKey') {
          requestKdbxCredentials();
        } else if (e.code == 'BadSignature') {
          importPasswordsDialog.showError("This is not a valid kdbx file");
        }
      } else {
        // CSV case.
        importPasswordsDialog.showError("This file is invalid and can't be imported.");
      }
    });
  };

  /**
   * Import a file.
   * Request the add-on code to import a file.
   *
   * @param fileBase64 the file converted into a base64 string
   * @param credentials the credentials to decrypt the file, if necessary.
   */
  var importFile = function(fileBase64, credentials) {
    return new Promise(function(resolve, reject) {
      var o = $.extend(importOptions, {credentials: credentials});
      passbolt.request('passbolt.import-passwords.import-file', fileBase64, fileExtension, o)
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
  var requestKdbxCredentials = function() {
    var kdbxCredentials = new KdbxCredentialsDialog({
      title: "Enter the password and/or key file",
      ctaLabel: "Continue import",
      onSubmit: function(password, keyFile) {
        getKdbxCredentials(password, keyFile)
        .then(function(credentials) {
          return importFile(selectedFileBase64, credentials);
        })
        .then(function(result) {
          displayReport(result);
        })
        .catch(function(e) {
          if (e.code == 'InvalidKey' || e.code == 'InvalidArg') {
            importPasswordsDialog.showError("Invalid password / keyfile provided. Please try again.");
          } else if (e.code == 'BadSignature') {
            importPasswordsDialog.showError("This is not a valid kdbx file");
          } else {
            importPasswordsDialog.showError("Could not open the kdbx file");
          }
        });
      }
    });
    kdbxCredentials.show();
  };

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
   * Display the final import report.
   * @param result
   */
  var displayReport = function(result) {
    result.tagsIntegration = importOptions.tagsIntegration;
    var importPasswordsReportDialog = new ImportPasswordsReportDialog(result);
    importPasswordsReportDialog.show();
  };

  init();
});