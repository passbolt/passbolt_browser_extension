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
const ByteUtils = require("kdbxweb/lib/utils/byte-utils");
const {ImportError} = require("../../../error/importError");
const {ExternalFoldersCollection} = require("../../entity/folder/external/externalFoldersCollection");
const {ExternalResourcesCollection} = require("../../entity/resource/external/externalResourcesCollection");
const {ExternalFolderEntity} = require("../../entity/folder/external/externalFolderEntity");
const {ExternalResourceEntity} = require("../../entity/resource/external/externalResourceEntity");

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
    const arrayBytes = ByteUtils.base64ToBytes(this.importEntity.file)
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
      keepassPassword = kdbxweb.ProtectedValue.fromString(this.importEntity.password)
    }
    if (this.importEntity.keyfile) {
      keepassKeyFile = kdbxweb.ByteUtils.base64ToBytes(this.importEntity.keyfile)
    }
    return new kdbxweb.Credentials(keepassPassword, keepassKeyFile);
  }

  /**
   * Parse a kdbx group
   * @param {KdbxGroup} kdbxGroup The kdbx group
   */
  parseFolder(kdbxGroup) {
    const externalFolderDto = {
      name: kdbxGroup.name.trim(),
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
      const getAncestors = group => group.parentGroup ? [...getAncestors(group.parentGroup), group.name] : [group.name];
      ancestors = getAncestors(kdbxEntry.parentGroup);
    }
    return ancestors.join('/');
  }

  /**
   * Parse a KdbxEntry and extract the resource
   * @param {KdbxEntry} kdbxEntry The entry
   * @returns {Object}
   */
  parseResource(kdbxEntry) {
    const externalResourceDto = {
      name: kdbxEntry.fields.Title.trim(),
      uri: kdbxEntry.fields.URL.trim(),
      username: kdbxEntry.fields.UserName.trim(),
      description: kdbxEntry.fields.Notes.trim(),
      folder_parent_path: this.getKdbxEntryPath(kdbxEntry),
      secret_clear: '' // By default a secret can be null
    };
    if (typeof kdbxEntry.fields.Password == 'object') {
      externalResourceDto.secret_clear = kdbxEntry.fields.Password.getText();
    }

    // @todo pebble
    const resourceType = this.parseResourceType();
    if (resourceType) {
      externalResourceDto.resource_type_id = resourceType.id;
    }

    // Sanitize.
    if (!externalResourceDto.name.length) {
      externalResourceDto.name = ExternalResourceEntity.DEFAULT_RESOURCE_NAME;
    }

    try {
      this.importEntity.importResources.push(externalResourceDto);
    } catch (error) {
      this.importEntity.importResourcesErrors.push(new ImportError("Cannot parse resource", externalResourceDto, error));
    }
  }

  /**
   * Parse the resource type id
   * @returns {ResourceTypeEntity}
   */
  parseResourceType() {
    if (this.resourceTypesCollection) {
      return this.resourceTypesCollection.getFirst('slug', 'password-and-description');
    }
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

exports.ResourcesKdbxImportParser = ResourcesKdbxImportParser;
