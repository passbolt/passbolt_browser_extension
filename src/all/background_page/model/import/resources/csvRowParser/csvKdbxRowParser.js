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
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import AbstractCsvRowParser from "./abstractCsvRowParser";
import ExternalTotpEntity from "../../../entity/totp/externalTotpEntity";
import ResourcesTypeImportParser from "../resourcesTypeImportParser";
import ImportError from "../../../../error/importError";

class CsvKdbxRowParser extends AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * @returns {object}
   */
  static get mapping() {
    return {
      "name": "Title",
      "username": "Username",
      "uri": "URL",
      "secret_clear": "Password",
      "description": "Notes",
      "folder_parent_path": "Group",
      "totp": "TOTP"
    };
  }

  /**
   * Parse a csv row
   * @param {object} data the csv row data
   * @param {ImportResourcesFileEntity} importEntity The import entity
   * @param {ResourceTypesCollection} resourceTypesCollection (Optional) The available resource types
   * @param {MetadataTypesSettingsEntity} metadataTypesSettings The metadata types from the organization
   * @returns {ExternalResourceEntity}
   */
  static parse(data, importEntity, resourceTypesCollection, metadataTypesSettings) {
    const externalResourceDto = {};

    for (const propertyName in this.mapping) {
      if (data[this.mapping[propertyName]]) {
        if (propertyName.toLowerCase() === "totp") {
          externalResourceDto.totp = this.parseTotp(data[this.mapping[propertyName]]);
        } else {
          externalResourceDto[propertyName] = data[this.mapping[propertyName]];
        }
      }
    }
    resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
    const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
    let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);

    if (!resourceType) {
      resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
      if (resourceType) {
        importEntity.importResourcesErrors.push(new ImportError("Resource partially imported", externalResourceDto, new Error("We used the closest resource type supported.")));
      }
      if (!resourceType) {
        //Fallback default content type not supported
        resourceType = ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, metadataTypesSettings);
        importEntity.importResourcesErrors.push(new ImportError("Imported with default content type", externalResourceDto, new Error("No resource type associated to this row.")));
      }
    }

    externalResourceDto.resource_type_id = resourceType.id;

    return new ExternalResourceEntity(externalResourceDto);
  }

  /**
   * Parse the TOTP
   * @param {string} totpUrl
   * @return {{secret_key: *, period: *, digits: *, algorithm: *}}
   */
  static parseTotp(totpUrl) {
    const totpUrlDecoded = new URL(decodeURIComponent(totpUrl));
    const totp = ExternalTotpEntity.createTotpFromUrl(totpUrlDecoded);
    return totp.toDto();
  }
}

export default CsvKdbxRowParser;
