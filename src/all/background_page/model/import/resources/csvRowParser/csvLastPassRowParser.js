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
import ResourcesTypeImportParser from "../resourcesTypeImportParser";
import AbstractCsvRowParser from "./abstractCsvRowParser";
import ImportError from "../../../../error/importError";
import ExternalTotpEntity from "../../../entity/totp/externalTotpEntity";

class CsvLastPassRowParser extends AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * @returns {object}
   */
  static get mapping() {
    return {
      "uris": "url",
      "username": "username",
      "secret_clear": "password",
      "totp": "totp",
      "description": "extra",
      "name": "name",
      "folder_parent_path": "grouping",
      "fav": "fav"
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
        if (propertyName === "uris") {
          externalResourceDto[propertyName] = [data[this.mapping[propertyName]]];
        } else if (propertyName.toLowerCase() === "totp") {
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
   * @param {string} totpValue The TOTP value from LastPass should be a base 32 secret key.
   * @return {{secret_key: *, period: *, digits: *, algorithm: *}}
   */
  static parseTotp(totpValue) {
    const totp = ExternalTotpEntity.createTotpFromLastpassCSV(totpValue);
    return totp.toDto();
  }
}

export default CsvLastPassRowParser;
