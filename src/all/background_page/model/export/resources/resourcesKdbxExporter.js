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
 */
import ExternalFolderEntity from "../../entity/folder/external/externalFolderEntity";
import * as kdbxweb from 'kdbxweb';
import argon2 from "argon2-browser";

const ARGON2_PARALLELISM = 1;
const ARGON2_MEMORY_KB = 15 * 1024;

class ResourcesKdbxExporter {
  /**
   * Kdbx exporter constructor
   * @param exportEntity
   */
  constructor(exportEntity) {
    this.exportEntity = exportEntity;
  }

  /**
   * Export
   * @returns {Promise<void>}
   */
  async export() {
    kdbxweb.CryptoEngine.setArgon2Impl(this.argon2Hash);
    const kdbxDb = await this.createKdbxDb();
    const rootExportFolders = this.exportEntity.exportFolders.getByDepth(0);
    rootExportFolders.forEach(rootExportFolder => this.createKdbxGroup(kdbxDb, rootExportFolder, kdbxDb.getDefaultGroup()));
    const rootExportResources = this.exportEntity.exportResources.getByDepth(0);
    rootExportResources.forEach(childExportResource => this.createKdbxEntry(kdbxDb, childExportResource, kdbxDb.getDefaultGroup()));
    this.exportEntity.file = await kdbxDb.save();
  }

  /**
   * Argon2 hasing proxy function.
   * Recommandation could be found here https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
   * @param {Uint8Array} password the password to be hashed
   * @param {Uint8Array} salt the salt used for the hashing algorithm
   * @returns {Promise<Uint8Array>} the Argon2id hashed password
   */
  async argon2Hash(password, salt) {
    const args = {
      pass: new Uint8Array(password),
      salt: new Uint8Array(salt),
      mem: ARGON2_MEMORY_KB, // should be 15 * 1024 kB minimum
      time: 2, // iteration count (2 recommanded for Argon2id)
      hashLen: 32, // 32 bytes required by kdbxweb (another value produce an bad derived key error)
      parallelism: ARGON2_PARALLELISM, // degree of parallelism (1 recommanded)
      type: argon2.ArgonType.Argon2id, // Argon2id recommanded
    };
    const result = await argon2.hash(args);
    return result.hash;
  }

  /**
   * Create a KDBX database
   * @returns {Promise<Keeweb.Kdbx>}
   */
  async createKdbxDb() {
    const credentials = this.createKdbxCredentials();
    const kdbxDb = kdbxweb.Kdbx.create(credentials, 'passbolt export');
    kdbxDb.setKdf(kdbxweb.Consts.KdfId.Argon2id);
    //Define the degree of parallelism for the Argon2 algo (1 recommanded)
    kdbxDb.header.kdfParameters.set("P", kdbxweb.VarDictionary.ValueType.UInt32, ARGON2_PARALLELISM);
    //Define the memory used for the Argon2 algo (15MB minimum)
    kdbxDb.header.kdfParameters.set("M", kdbxweb.VarDictionary.ValueType.UInt64, new kdbxweb.Int64(ARGON2_MEMORY_KB * 1024));
    return kdbxDb;
  }

  /**
   * Create the kdbx credentials.
   * @returns {kdbxweb.Credentials}
   */
  createKdbxCredentials() {
    let keepassPassword = null;
    let keepassKeyFile = null;
    if (this.exportEntity.password) {
      keepassPassword = kdbxweb.ProtectedValue.fromString(this.exportEntity.password);
    }
    if (this.exportEntity.keyfile) {
      keepassKeyFile = kdbxweb.ByteUtils.base64ToBytes(this.exportEntity.keyfile);
    }
    return new kdbxweb.Credentials(keepassPassword, keepassKeyFile);
  }

  /**
   * Create a kdbx group based on an external folder entity
   * @param {kdbxweb.KdbxDb} kdbxDb The kdbx database
   * @param {ExternalFolderEntity} externalFolderEntity The folder to export
   * @param {kdbxweb.Group} parentKdbxGroup The parent kdbx group
   */
  createKdbxGroup(kdbxDb, externalFolderEntity, parentKdbxGroup) {
    const kdbxGroup = kdbxDb.createGroup(parentKdbxGroup, ExternalFolderEntity.resolveEscapedName(externalFolderEntity.name));
    const childrenExportFolders = this.exportEntity.exportFolders.getByFolderParentId(externalFolderEntity.id);
    childrenExportFolders.forEach(childExportFolder => this.createKdbxGroup(kdbxDb, childExportFolder, kdbxGroup));
    const childrenExportResources = this.exportEntity.exportResources.getByFolderParentId(externalFolderEntity.id);
    childrenExportResources.forEach(childExportResource => this.createKdbxEntry(kdbxDb, childExportResource, kdbxGroup));
  }

  /**
   * Create a kdbx entity based on an external resource entity
   * @param {kdbxweb.KdbxDb} kdbxDb The kdbx database
   * @param {ExternalResourceEntity} externalResourceEntity The resource to export
   * @param {kdbxweb.Group} parentKdbxGroup The parent kdbx group
   */
  createKdbxEntry(kdbxDb, externalResourceEntity, parentKdbxGroup) {
    const kdbxEntry = kdbxDb.createEntry(parentKdbxGroup);
    kdbxEntry.fields.set('Title', externalResourceEntity.name);
    kdbxEntry.fields.set('UserName', externalResourceEntity.username);
    if (externalResourceEntity.secretClear) {
      kdbxEntry.fields.set('Password', kdbxweb.ProtectedValue.fromString(externalResourceEntity.secretClear));
    }
    kdbxEntry.fields.set('URL', externalResourceEntity.uri);
    kdbxEntry.fields.set('Notes', externalResourceEntity.description);
  }
}

export default ResourcesKdbxExporter;
