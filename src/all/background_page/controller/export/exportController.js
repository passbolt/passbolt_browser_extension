/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.13.0
 */
const fileController = require('../fileController');
const passphraseController = require('../passphrase/passphraseController');
const KeepassDb = require('../../model/keepassDb/keepassDb').KeepassDb;
const CsvDb = require('../../model/csvDb').CsvDb;
const Crypto = require('../../model/crypto').Crypto;
const progressController = require('../progress/progressController');


class ExportController {

  /**
   * Constructor
   * @param worker
   * @param object items object containing the items to export
   *    {
   *      resources: Array,
   *      folders: Array
   *    }
   * @param object options options
   *   format: the format of the export (csv-xxx or kdbx)
   *   credentials: credentials if required (mainly for kdbx)
   *     - password (string)
   *     - keyFile (string) base64 encoded file
   * @return void
   */
  constructor(worker, items, options) {
    this.worker = worker;
    this.progressObjective = 0;
    this.progressStatus = 0;
    this.format = "";
    this.csvFormat = "";

    const format = options.format || "";
    this.credentials = options.credentials || null;
    this.resources = items.resources;
    this.folders = items.folders;

    // CSV formats are given in the format "csv-subformat". We need to extract the subformat.
    const isCsv = format.match(/csv-(.*)/);

    if(isCsv) {
      this.format = "csv";
      this.csvFormat = isCsv[1];
    } else if (format === 'kdbx') {
      this.format = "kdbx"
    } else {
      throw error('Export format is not supported');
    }
  }

  /**
   * Main execution function.
   * @return {Promise}
   */
  async exec() {
    await this.decryptSecrets();
    const fileContent = await this.convertResourcesToFile();
    return this.downloadFile(fileContent);
  }

  /**
   * Decrypt the armored secrets in resources.
   * Request the passphrase if necessary.
   * @return {Promise} a promise containing the list of resources with their decrypted secret.
   */
  async decryptSecrets() {
    const decryptedSecrets = await this._decryptSecrets(this.resources);
    await progressController.close(this.worker);
    this.resources = ExportController._addDecryptedSecretsToResources(this.resources, decryptedSecrets);
    return this.resources
  };

  /**
   * Convert a list of resources into a csv file content.
   * @param options
   *  format: format of the csv file. See CsvDB.formats.
   * @return {Promise} a promise containing the csv file content (string).
   */
  convertResourcesToCsv(options) {
    const csvDb = new CsvDb();
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
  convertResourcesToKdbx(options) {
    const password = options.credentials.password || "";
    let keyFile = options.credentials.keyFile || null;

    if (keyFile !== null) {
      keyFile = fileController.b64ToBlob(keyFile);
    }

    const keepassDb = new KeepassDb();
    const items = {
      'resources':this.resources,
      'folders': this.folders
    };

    return keepassDb.fromItems(items, password, keyFile);
  };

  /**
   * High level function to convert a resources to a file.
   * Will work with the options provided during initialization.
   * @return {Promise}
   */
  convertResourcesToFile() {
    if(this.format === 'csv') {
      return this.convertResourcesToCsv({format: this.csvFormat});
    } else if (this.format === 'kdbx') {
      return this.convertResourcesToKdbx({credentials: this.credentials});
    }

    throw Error('Format is not supported');
  };

  /**
   * Get mime type from file extension.
   * @param extension
   * @return {string}
   */
  static getMimeType(extension) {
    let mimeType = "text/plain";
    switch (extension) {
      case 'kdbx':
        mimeType = "application/x-keepass";
        break;
      case 'csv':
        mimeType = "text/csv";
        break;
    }

    return mimeType;
  }

  /**
   * Download the file content.
   * The name of the file will be "passbolt-export-date.format".
   * @param fileContent
   * @return {Promise}
   */
  downloadFile(fileContent) {
    const date = new Date().toISOString().slice(0, 10),
      filename = 'passbolt-export-' + date + '.' + this.format,
      mimeType = ExportController.getMimeType(this.format),
      blobFile = new Blob([fileContent], {type: mimeType});

    return new Promise((resolve, reject)  => {
      try {
        fileController.saveFile(filename, blobFile, mimeType, this.worker.tab.id);
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
  async _decryptSecrets(secrets) {
    const crypto = new Crypto();

    // Master password required to decrypt a secret before sharing it.
    const masterPassword = await passphraseController.get(this.worker);
    progressController.open(this.worker, 'Decrypting...', this.resources.length);
    const armored = this._prepareArmoredList();
    return crypto.decryptAll(armored, masterPassword,
      // On complete.
       () => {
        progressController.update(this.worker, this.progressStatus++);
      },
      // On start.
      (position) => {
        position++;
        progressController.update(this.worker, this.progressStatus, `Decrypting ${position}/${this.resources.length}`);
      });
  };

  /**
   * Prepare a list of armored secrets from the list of resources in order to be used by _decryptSecrets.
   * @return {Array}
   * @private
   */
  _prepareArmoredList() {
    const armored = [];
    for(let i in this.resources) {
      armored.push(this.resources[i].secrets[0].data);
    }
    return armored;
  };

  /**
   * Add decrypted secrets to the corresponding resources.
   * @param resources
   * @param secrets
   * @return {Array} list of resources with their decrypted secrets.
   * @private
   */
  static _addDecryptedSecretsToResources(resources, secrets) {
    for (let i in resources) {
      resources[i].secretClear = secrets[i];
    }
    return resources;
  };
}


exports.ExportController = ExportController;
