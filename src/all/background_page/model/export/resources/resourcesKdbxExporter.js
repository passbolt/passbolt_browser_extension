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
import ExportResourcesFileEntity from "../../entity/export/exportResourcesFileEntity";

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
   * @param {kdbxweb.Kdbx} kdbxDb The kdbx database
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
   * @param {kdbxweb.Kdbx} kdbxDb The kdbx database
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
    if (externalResourceEntity.totp) {
      this.setTotpField(kdbxEntry, externalResourceEntity);
    }
    kdbxEntry.fields.set('URL', externalResourceEntity.uri);
    kdbxEntry.fields.set('Notes', externalResourceEntity.description);

    if (externalResourceEntity.expired) {
      kdbxEntry.times.expiryTime = new Date(externalResourceEntity.expired);
      kdbxEntry.times.expires = true;
    } else {
      //explicitly set the expiryTime to undefined as it seems that it takes the current time otherwise
      kdbxEntry.times.expiryTime = undefined;
      kdbxEntry.times.expires = false;
    }
  }

  /**
   * Set the TOTP fields according to the kdbx format
   * @param {kdbxweb.KdbxEntry} kdbxEntry
   * @param {ExternalResourceEntity} externalResourceEntity
   */
  setTotpField(kdbxEntry, externalResourceEntity) {
    const totp = externalResourceEntity.totp;
    switch (this.exportEntity.format) {
      case ExportResourcesFileEntity.FORMAT_KDBX: {
        kdbxEntry.fields.set('TimeOtp-Secret-Base32', kdbxweb.ProtectedValue.fromString(totp.secretKey));
        // Adapt algorithm to match keepass windows
        const algorithm = `HMAC-${totp.algorithm.substring(0, 3)}-${totp.algorithm.substring(3)}`;
        kdbxEntry.fields.set('TimeOtp-Algorithm', algorithm);
        kdbxEntry.fields.set('TimeOtp-Length', totp.digits.toString());
        kdbxEntry.fields.set('TimeOtp-Period', totp.period.toString());
        break;
      }
      case ExportResourcesFileEntity.FORMAT_KDBX_OTHERS: {
        const totpUrl = totp.createUrlFromExternalResource(externalResourceEntity);
        kdbxEntry.fields.set('otp', kdbxweb.ProtectedValue.fromString(totpUrl.toString()));
        break;
      }
      default:
        break;
    }
  }
}

export default ResourcesKdbxExporter;
