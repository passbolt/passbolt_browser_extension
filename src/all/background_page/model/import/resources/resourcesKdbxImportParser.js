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
import ExternalResourceEntity from "../../entity/resource/external/externalResourceEntity";
import ImportError from "../../../error/importError";
import * as kdbxweb from 'kdbxweb';
import {
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity";
import TotpEntity from "../../entity/totp/totpEntity";

class ResourcesKdbxImportParser {
  /**
   * Kdbx parser constructor
   * @param {ImportResourcesFileEntity} importEntity The import entity
   * @param {ResourceTypesCollection?} resourceTypesCollection (Optional) The available resource types
   */
  constructor(importEntity, resourceTypesCollection) {
    this.importEntity = importEntity;
    this.resourceTypesCollection = resourceTypesCollection;
  }

  /**
   * Parse the import
   * @returns {Promise<void>}
   */
  async parseImport() {
    const kdbxDb = await this.readKdbxDb();
    this.parseFolder(kdbxDb.getDefaultGroup());
    this.createAndChangeRootFolder();
  }

  /**
   * Read the kdbx file.
   * @returns {Promise<kdbxweb.Kdbx>}
   */
  async readKdbxDb() {
    const arrayBytes = kdbxweb.ByteUtils.base64ToBytes(this.importEntity.file);
    const kdbxCredentials = this.readKdbxCredentials();
    return kdbxweb.Kdbx.load(arrayBytes.buffer, kdbxCredentials);
  }

  /**
   * Read the kdbx credentials.
   * @returns {kdbxweb.Credentials}
   */
  readKdbxCredentials() {
    let keepassPassword = null;
    let keepassKeyFile = null;
    if (this.importEntity.password) {
      keepassPassword = kdbxweb.ProtectedValue.fromString(this.importEntity.password);
    }
    if (this.importEntity.keyfile) {
      keepassKeyFile = kdbxweb.ByteUtils.base64ToBytes(this.importEntity.keyfile);
    }
    return new kdbxweb.Credentials(keepassPassword, keepassKeyFile);
  }

  /**
   * Parse a kdbx group
   * @param {KdbxGroup} kdbxGroup The kdbx group
   */
  parseFolder(kdbxGroup) {
    const externalFolderDto = {
      name: ExternalFolderEntity.escapeName(kdbxGroup.name),
      folder_parent_path: this.getKdbxEntryPath(kdbxGroup)
    };

    try {
      this.importEntity.importFolders.push(externalFolderDto);
      this.getGroupChildrenGroups(kdbxGroup).forEach(this.parseFolder.bind(this));
      this.getGroupChildrenEntries(kdbxGroup).forEach(this.parseResource.bind(this));
    } catch (error) {
      this.importEntity.importFoldersErrors.push(new ImportError("Cannot parse folder", externalFolderDto, error));
    }
  }

  /**
   * Get the kdbx groups children of a group
   * @param {KdbxGroup} kdbxGroup the group
   * @returns {array<KdbxGroup>}
   */
  getGroupChildrenGroups(kdbxGroup) {
    return kdbxGroup.groups.filter(kdbxGroup => kdbxGroup.parentGroup.id === kdbxGroup.id);
  }

  /**
   * Get the kdbx entries children of a group
   * @param {KdbxGroup} kdbxGroup the group
   * @returns {array<KdbxEntry>}
   */
  getGroupChildrenEntries(kdbxGroup) {
    return kdbxGroup.entries.filter(kdbxEntry => kdbxEntry.parentGroup.id === kdbxGroup.id);
  }

  /**
   * Get the path of a kdbx entity
   * @param {KdbxGroup|KdbxEntry} kdbxEntry The entity to get the path for
   * @returns {string}
   */
  getKdbxEntryPath(kdbxEntry) {
    let ancestors = [];
    if (kdbxEntry.parentGroup) {
      const getAncestors = group => group.parentGroup ? [...getAncestors(group.parentGroup), ExternalFolderEntity.escapeName(group.name)] : [ExternalFolderEntity.escapeName(group.name)];
      ancestors = getAncestors(kdbxEntry.parentGroup);
    }
    return ancestors.join('/');
  }

  /**
   * Parse a KdbxEntry and extract the resource
   * @param {kdbxweb.KdbxEntry} kdbxEntry The entry
   * @returns {Object}
   */
  parseResource(kdbxEntry) {
    let resourceTypeSlug = RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG;
    const externalResourceDto = {
      name: kdbxEntry.fields.get('Title') ? kdbxEntry.fields.get('Title').trim() : "",
      uri: kdbxEntry.fields.get('URL') ? kdbxEntry.fields.get('URL').trim() : "",
      username: kdbxEntry.fields.get('UserName') ? kdbxEntry.fields.get('UserName').trim() : "",
      description: kdbxEntry.fields.get('Notes') ? kdbxEntry.fields.get('Notes').trim() : "",
      folder_parent_path: this.getKdbxEntryPath(kdbxEntry),
      secret_clear: '', // By default a secret can be null
      expired: kdbxEntry.times.expires ? kdbxEntry.times.expiryTime?.toISOString() : null,
    };
    if (typeof kdbxEntry.fields.get('Password') === 'object') {
      externalResourceDto.secret_clear = kdbxEntry.fields.get('Password').getText();
    }
    try {
      const totp = this.getTotp(kdbxEntry);
      if (totp) {
        externalResourceDto.totp = totp;
        resourceTypeSlug = RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG;
      }

      // @todo pebble
      const resourceType = this.parseResourceType(resourceTypeSlug);
      if (resourceType) {
        externalResourceDto.resource_type_id = resourceType.id;
      }

      // Sanitize.
      if (!externalResourceDto.name.length) {
        externalResourceDto.name = ExternalResourceEntity.DEFAULT_RESOURCE_NAME;
      }

      this.importEntity.importResources.push(externalResourceDto);
    } catch (error) {
      this.importEntity.importResourcesErrors.push(new ImportError("Cannot parse resource", externalResourceDto, error));
    }
  }

  /**
   * Get the totp
   * @param {kdbxweb.KdbxEntry} kdbxEntry
   * @return {*}
   */
  getTotp(kdbxEntry) {
    if (kdbxEntry.fields.get('otp')) {
      const totpUrl = typeof kdbxEntry.fields.get('otp') === 'object' ? kdbxEntry.fields.get('otp').getText() : kdbxEntry.fields.get('otp');
      const totpUrlDecoded = new URL(decodeURIComponent(totpUrl));
      const totp = TotpEntity.createTotpFromUrl(totpUrlDecoded);
      return totp.toDto();
    } else if (typeof kdbxEntry.fields.get('TimeOtp-Secret-Base32') === 'object') {
      const totp = TotpEntity.createTotpFromKdbxWindows(kdbxEntry.fields);
      return totp.toDto();
    }
  }

  /**
   * Parse the resource type according to the resource type slug
   * @param {string} resourceTypeSlug
   * @returns {ResourceTypeEntity}
   */
  parseResourceType(resourceTypeSlug) {
    if (this.resourceTypesCollection) {
      return this.resourceTypesCollection.getFirst('slug', resourceTypeSlug);
    }
    return null;
  }

  /**
   * Create a root folder based on the import reference and move all the content into it.
   * @param {ExternalFoldersCollection} externalFoldersCollection The collection of resources
   * @param {ExternalResourcesCollection} externalResourcesCollection The collection of folders
   */
  createAndChangeRootFolder() {
    const rootFolderEntity = new ExternalFolderEntity({name: this.importEntity.ref});
    this.importEntity.importFolders.changeRootPath(rootFolderEntity);
    this.importEntity.importResources.changeRootPath(rootFolderEntity);
    this.importEntity.importFolders.push(rootFolderEntity);
  }
}

export default ResourcesKdbxImportParser;
