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
import ExternalTotpEntity from "../../entity/totp/externalTotpEntity";
import ResourcesTypeImportParser from "./resourcesTypeImportParser";
import {ICON_TYPE_KEEPASS_ICON_SET} from "passbolt-styleguide/src/shared/models/entity/resource/metadata/IconEntity";
import {CUSTOM_FIELD_TYPE} from "passbolt-styleguide/src/shared/models/entity/customField/customFieldEntity";
import {v4 as uuidv4} from "uuid";
import {RESOURCE_TYPE_VERSION_5} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTypesSettingsEntity";

const KDBX_SUPPORTED_FIELDS = ['Title', 'URL', 'UserName', 'Notes', 'otp', 'TimeOtp-Secret-Base32', 'TimeOtp-Algorithm', 'TimeOtp-Length', 'TimeOtp-Period', 'Password'];


class ResourcesKdbxImportParser {
  /**
   * Kdbx parser constructor
   * @param {ImportResourcesFileEntity} importEntity The import entity
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @param {MetadataTypesSettingsEntity} metadataTypesSettings The metadata types from the organization
   */
  constructor(importEntity, resourceTypesCollection, metadataTypesSettings) {
    this.importEntity = importEntity;
    this.resourceTypesCollection = resourceTypesCollection;
    this.metadataTypesSettings = metadataTypesSettings;
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
    const externalResourceDto = {
      name: kdbxEntry.fields.get('Title') ? kdbxEntry.fields.get('Title').trim() : "",
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
      this.parseUris(kdbxEntry, externalResourceDto);
      this.parseTotp(kdbxEntry, externalResourceDto);

      /*
       * Parse v5 additional properties only if v5 is the default version for creation.
       * This aligns with the default creation behavior in the UI, whether from the create menu
       * or quick access, which both use the default version.
       *
       * Note: Parsing these fields could be performed regardless of the resource content,
       * and the responsibility for parsing and handling the data could be separated.
       */
      if (this.metadataTypesSettings.defaultResourceTypes === RESOURCE_TYPE_VERSION_5) {
        this.parseCustomFields(kdbxEntry, externalResourceDto);
        this.parseIcon(kdbxEntry, externalResourceDto);
      }

      const resourceType = this.getResourceType(externalResourceDto);

      //resourceType should never be empty to not block end user
      externalResourceDto.resource_type_id = resourceType.id;

      if (!externalResourceDto.name.length) {
        externalResourceDto.name = ExternalResourceEntity.DEFAULT_RESOURCE_NAME;
      }

      this.importEntity.importResources.push(externalResourceDto);
    } catch (error) {
      this.importEntity.importResourcesErrors.push(new ImportError("Cannot parse resource", externalResourceDto, error));
    }
  }

  /**
   * Parse URIs from a kdbx entry
   * @param {KdbxEntry} kdbxEntry The kdbx entry
   * @param {ExternalResourceDto} externalResourceDto The external resource dto
   * @private
   * @return {void}
   */
  parseUris(kdbxEntry, externalResourceDto) {
    const uri = kdbxEntry.fields.get('URL') ? kdbxEntry.fields.get('URL').trim() : "";
    const additionalUris = [uri];

    let additionalEntriesUris = [...kdbxEntry.fields.entries()]
      .filter(([key]) => key.startsWith('KP2A_URL'))
      .map(([, value]) => (value));

    if (additionalEntriesUris.length > 31) {
      this.importEntity.importResourcesErrors.push(new ImportError(
        "Resource has more than 32 URIs, only the first 32 will be imported",
        externalResourceDto
      ));
    }
    additionalEntriesUris = additionalEntriesUris.slice(0, 31);

    for (const additionalUri of additionalEntriesUris) {
      additionalUris.push(additionalUri.trim());
    }

    externalResourceDto.uris = additionalUris;
  }

  /**
   * Parse the icon of the kdbx entry
   * @param {kdbxweb.KdbxEntry} kdbxEntry
   * @param {ExternalResourceDto} externalResourceDto
   * @private
   * @returns {void}
   */
  parseIcon(kdbxEntry, externalResourceDto) {
    if ((kdbxEntry.bgColor || kdbxEntry.icon)) {
      externalResourceDto.icon = {};

      if (kdbxEntry.icon) {
        externalResourceDto.icon.type = ICON_TYPE_KEEPASS_ICON_SET;
        externalResourceDto.icon.value = kdbxEntry.icon;
      }

      if (kdbxEntry.bgColor) {
        externalResourceDto.icon.background_color = kdbxEntry.bgColor;
      }
    }
  }

  /**
   * Parse the custom fields of the kdbx entry
   * @param {kdbxEntry} kdbxEntry
   * @param {ExternalResourceDto} externalResourceDto
   * @private
   * @returns {void}
   */
  parseCustomFields(kdbxEntry, externalResourceDto) {
    const customFields = [];
    kdbxEntry.fields.forEach((value, key) => {
      if (!KDBX_SUPPORTED_FIELDS.includes(key) && !key.startsWith('KP2A_URL')) {
        const customFieldValue = typeof value === 'string' ? value : value.getText();
        customFields.push({
          id: uuidv4(),
          type: CUSTOM_FIELD_TYPE.TEXT,
          metadata_key: key,
          secret_value: customFieldValue
        });
      }
    });

    if (customFields.length > 0) {
      externalResourceDto.custom_fields = customFields;
    }
  }

  /**
   * parse the totp of the kdbx entry
   * @param {kdbxweb.KdbxEntry} kdbxEntry
   * @param {ExternalResourceDto} externalResourceDto
   * @private
   * @returns {void}
   */
  parseTotp(kdbxEntry, externalResourceDto) {
    if (kdbxEntry.fields.get('otp')) {
      const totpUrl = typeof kdbxEntry.fields.get('otp') === 'object' ? kdbxEntry.fields.get('otp').getText() : kdbxEntry.fields.get('otp');
      const totpUrlDecoded = new URL(decodeURIComponent(totpUrl));
      const totp = ExternalTotpEntity.createTotpFromUrl(totpUrlDecoded);
      externalResourceDto.totp = totp.toDto();
    } else if (typeof kdbxEntry.fields.get('TimeOtp-Secret-Base32') === 'object') {
      const totp = ExternalTotpEntity.createTotpFromKdbxWindows(kdbxEntry.fields);
      externalResourceDto.totp = totp.toDto();
    }
  }

  /**
   * Get the resource type
   * @param {ExternalResourceDto} externalResourceDto
   * @return {ResourceTypeDto}
   */
  getResourceType(externalResourceDto) {
    this.resourceTypesCollection.filterByResourceTypeVersion(this.metadataTypesSettings.defaultResourceTypes);

    const scores = ResourcesTypeImportParser.getScores(externalResourceDto, this.resourceTypesCollection);
    let resourceType = ResourcesTypeImportParser.findMatchingResourceType(this.resourceTypesCollection, scores);

    if (resourceType) {
      return resourceType;
    }

    resourceType = ResourcesTypeImportParser.findPartialResourceType(this.resourceTypesCollection, scores);
    if (resourceType) {
      this.importEntity.importResourcesErrors.push(new ImportError("Resource partially imported", externalResourceDto));
    } else {
      //Fallback default content type not supported
      resourceType = ResourcesTypeImportParser.fallbackDefaulResourceType(this.resourceTypesCollection, this.metadataTypesSettings);
      this.importEntity.importResourcesErrors.push(new ImportError("Content type not supported but imported with default resource type", externalResourceDto));
    }
    return resourceType;
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
