/**
 * Export passwords controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var fileController = require('../controller/fileController');
const passphraseController = require('../controller/passphrase/passphraseController');
var KeepassDb = require('../model/keepassDb').KeepassDb;
var CsvDb = require('../model/csvDb').CsvDb;
var Crypto = require('../model/crypto').Crypto;
var progressController = require('./progress/progressController');

/**
 * Controller for Export passwords.
 * @param tabid
 * @constructor
 */
var ExportPasswordsController = function(worker) {
  this.worker = worker;
  this.progressObjective = 0;
  this.progressStatus = 0;
  this.resources = [];
  this.format = "";
  this.csvFormat = "";
  this.credentials = null;
};

/**
 * Initialize export controller.
 * @param Array resources list of resources
 * @param object options options
 *   format: the format of the export (csv-xxx or kdbx)
 *   credentials: credentials if required (mainly for kdbx)
 *     - password (string)
 *     - keyFile (string) base64 encoded file
 * @return void
 */
ExportPasswordsController.prototype.init = function(resources, options) {
  var format = options.format || "";
  this.credentials = options.credentials || null;
  this.resources = resources;
  // CSV formats are given in the format "csv-subformat". We need to extract the subformat.
  var isCsv = format.match(/csv-(.*)/);

  if(isCsv) {
    this.format = "csv";
    this.csvFormat = isCsv[1];
  } else if (format === 'kdbx') {
    this.format = "kdbx"
  } else {
    throw error('Export format is not supported');
  }
};

/**
 * Decrypt the armored secrets in resources.
 * Request the passphrase if necessary.
 * @return {Promise} a promise containing the list of resources with their decrypted secret.
 */
ExportPasswordsController.prototype.decryptSecrets = async function() {
  const decryptedSecrets = await this._decryptSecrets(this.resources);
  await progressController.close(this.worker);
  this.resources = this._addDecryptedSecretsToResources(self.resources, decryptedSecrets);
  return this.resources
};

/**
 * Convert a list of resources into a csv file content.
 * @param options
 *  format: format of the csv file. See CsvDB.formats.
 * @return {Promise} a promise containing the csv file content (string).
 */
ExportPasswordsController.prototype.convertResourcesToCsv = function(options) {
  var csvDb = new CsvDb();
  return csvDb.fromResources(this.resources, options.format);
};

/**
 * Convert a list of resources into a kdbx file.
 * @param options
 *   credentials: the credentials to encrypt the file.
 *     - password: string. empty password will create a db without a password.
 *     - keyFile: string, base64 encoded. provide null if no keyFile.
 * @return {Promise.<ArrayBuffer>|*}
 */
ExportPasswordsController.prototype.convertResourcesToKdbx = function(options) {
  var password = options.credentials.password || "",
    keyFile = options.credentials.keyFile || null;

  if (keyFile !== null) {
    keyFile = fileController.b64ToBlob(keyFile);
  }
  var keepassDb = new KeepassDb();

  return keepassDb.fromResources(this.resources, password, keyFile);
};

/**
 * Add decrypted secrets to the corresponding resources.
 * @param resources
 * @param secrets
 * @return {Array} list of resources with their decrypted secrets.
 * @private
 */
ExportPasswordsController.prototype._addDecryptedSecretsToResources = function(resources, secrets) {
  for (var i in resources) {
    resources[i].secretClear = secrets[i];
  }
  return resources;
};

/**
 * High level function to convert a resources to a file.
 * Will work with the options provided during initialization.
 * @return {Promise}
 */
ExportPasswordsController.prototype.convertResourcesToFile = function() {
  if(this.format === 'csv') {
    return this.convertResourcesToCsv({format: this.csvFormat});
  } else if (this.format === 'kdbx') {
    return this.convertResourcesToKdbx({credentials: this.credentials});
  }
};

/**
 * Download the file content.
 * The name of the file will be "passbolt-export-date.format".
 * @param fileContent
 * @return {Promise}
 */
ExportPasswordsController.prototype.downloadFile = function(fileContent) {
  var date = new Date().toISOString().slice(0, 10),
    filename = 'passbolt-export-' + date + '.' + this.format,
    blobFile = new Blob([fileContent], {type: "text/plain"}),
    self = this;

  return new Promise(function(resolve, reject) {
    try {
      fileController.saveFile(filename, blobFile, self.worker.tab.id);
      resolve();
    } catch(e) {
      reject(e);
    }
  });
};

/**
 * Sub function to decrypt a list of secrets.
 * @param {Array } secrets
 * @return {Promise}
 * @private
 */
ExportPasswordsController.prototype._decryptSecrets = function(secrets) {
  var self = this,
    crypto = new Crypto();

  // Master password required to decrypt a secret before sharing it.
  return passphraseController.get(this.worker)
  .then(function (masterPassword) {
    progressController.open(self.worker, 'Decrypting...', self.resources.length);
    var armored = self._prepareArmoredList();
    return crypto.decryptAll(armored, masterPassword,
      // On complete.
      function () {
        progressController.update(self.worker, self.progressStatus++);
      },
      // On start.
      function (position) {
        position++;
        progressController.update(self.worker, self.progressStatus, `Decrypting ${position}/${self.resources.length}`);
      });
  });
};

/**
 * Prepare a list of armored secrets from the list of resources in order to be used by _decryptSecrets.
 * @return {Array}
 * @private
 */
ExportPasswordsController.prototype._prepareArmoredList = function() {
  var armored = [];
  for(var i in this.resources) {
    armored.push(this.resources[i].secrets[0].data);
  }
  return armored;
};

exports.ExportPasswordsController = ExportPasswordsController;
