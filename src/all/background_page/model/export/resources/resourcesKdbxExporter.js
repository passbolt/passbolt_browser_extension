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
    const kdbxDb = await this.createKdbxDb();
    const rootExportFolders = this.exportEntity.exportFolders.getByDepth(0);
    rootExportFolders.forEach(rootExportFolder => this.createKdbxGroup(kdbxDb, rootExportFolder, kdbxDb.getDefaultGroup()));
    const rootExportResources = this.exportEntity.exportResources.getByDepth(0);
    rootExportResources.forEach(childExportResource => this.createKdbxEntry(kdbxDb, childExportResource, kdbxDb.getDefaultGroup()));
    this.exportEntity.file = await kdbxDb.save();
  }

  /**
   * Create a KDBX database
   * @returns {Promise<Keeweb.Kdbx>}
   */
  async createKdbxDb() {
    const credentials = this.createKdbxCredentials();
    const kdbxDb = kdbxweb.Kdbx.create(credentials, 'passbolt export');
    kdbxDb.setVersion(3);
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
