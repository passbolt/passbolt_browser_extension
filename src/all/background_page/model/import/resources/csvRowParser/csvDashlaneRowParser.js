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

class CsvDashlaneRowParser extends AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * @returns {object}
   */
  static get mapping() {
    return {
      "username": "username",
      "username2": "username2",
      "username3": "username3",
      "name": "title",
      "secret_clear": "password",
      "description": "note",
      "uris": "url",
      "category": "category",
      "otpSecret": "otpSecret"
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
      if (propertyName === "uris") {
        externalResourceDto[propertyName] = [data[this.mapping[propertyName]]];
      } else if (data[this.mapping[propertyName]]) {
        externalResourceDto[propertyName] = data[this.mapping[propertyName]];
      }
    }

    resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
    const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
    let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);

    if (!resourceType) {
      resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
      if (resourceType) {
        importEntity.importResourcesWarnings.push(new ImportError("Resource partially imported", externalResourceDto, new Error("We used the closest resource type supported.")));
      }
      if (!resourceType) {
        //Fallback default content type not supported
        resourceType = ResourcesTypeImportParser.fallbackDefaulResourceType(resourceTypesCollection, metadataTypesSettings);
        importEntity.importResourcesWarnings.push(new ImportError("Imported with default content type", externalResourceDto, new Error("No resource type associated to this row.")));
      }
    }

    externalResourceDto.resource_type_id = resourceType.id;

    return new ExternalResourceEntity(externalResourceDto);
  }
}

export default CsvDashlaneRowParser;
