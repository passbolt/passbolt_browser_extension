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
  let selectedFileBase64 = null;

  /**
   * ImportPasswordDialog the import password dialog component.
   */
  let importPasswordsDialog = null;


  let fileExtension = null;

  /**
   * Import options
   * @type {{
   * hasFoldersPlugin: boolean  // Whether folders plugin is present
   * hasTagsPlugin: boolean  // Whether tags plugin is present
   * importFolders: boolean  // Whether folders should be imported.
   * importTags: boolean  // Whether tags should be imported (one unique tag for each import)
   * }}
   */
  let importOptions = {
    hasTagsPlugin : false,
    hasFoldersPlugin: false,
    importTags: false,
    importFolders: false
  };

  /**
   * Initialize the import passwords dialog.
   */
  const init = function () {
    passbolt.request('passbolt.site.settings')
    .then(
      function(siteSettings) {
        if(siteSettings !== null && siteSettings.passbolt !== undefined &&
          siteSettings.passbolt.plugins !== undefined) {
          importOptions.hasFoldersPlugin =  siteSettings.passbolt.plugins.folders !== undefined;
          importOptions.hasTagsPlugin =  siteSettings.passbolt.plugins.tags !== undefined;
          importOptions.importFolders = importOptions.hasFoldersPlugin;
          importOptions.importTags = importOptions.hasTagsPlugin;
        }

        importPasswordsDialog = new ImportPasswordsDialog({
          "onSubmit":onSubmit,
          "hasFoldersPlugin": importOptions.hasFoldersPlugin,
          "hasTagsPlugin": importOptions.hasTagsPlugin
        });
        importPasswordsDialog.show();
      });
  };

  /**
   * onSubmit handler.
   * @param selectedFile
   * @param options
   */
  const onSubmit = function(selectedFile, options) {
    fileExtension = ImportPasswordsDialog.getFileExtension(selectedFile.name);

    importOptions = $.extend(importOptions, options);

    getFileAsBase64String(selectedFile)
    .then(function(fileBase64) {
      selectedFileBase64 = fileBase64;
      const credentials = {
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
  const importFile = function(fileBase64, credentials) {
    return new Promise(function(resolve, reject) {
      const o = $.extend(importOptions, {credentials: credentials});
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
  const getFileAsBase64String = function(file) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const base64Url = e.target.result;
          const fileBase64 = base64Url.split(",")[1];
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
  const requestKdbxCredentials = function() {
    const kdbxCredentials = new KdbxCredentialsDialog({
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

  const getKdbxCredentials = function(password, keyFile) {
    const credentials = {
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
  const displayReport = function(result) {
    const importPasswordsReportDialog = new ImportPasswordsReportDialog(result);
    importPasswordsReportDialog.show();
  };

  init();
});