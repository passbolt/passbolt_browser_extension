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
 * @since         5.18.0
 */
import ExternalResourceEntity from "../../../entity/resource/external/externalResourceEntity";
import ResourcesTypeImportParser from "../resourcesTypeImportParser";
import AbstractCsvRowParser from "./abstractCsvRowParser";
import ImportError from "../../../../error/importError";

class CsvNetwrixRowParser extends AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * Netwrix names the entry title "Description".
   * The order of the properties matters, it defines the order of the columns when exporting.
   * @returns {object}
   */
  static get mapping() {
    return {
      tags: "DataTags",
      name: "Description",
      username: "User name",
      secret_clear: "Password",
      uris: "Internet address",
      email: "Email address",
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

    for (const propertyName of ["name", "username", "secret_clear"]) {
      if (data[this.mapping[propertyName]]) {
        externalResourceDto[propertyName] = data[this.mapping[propertyName]];
      }
    }
    if (data[this.mapping.uris]) {
      externalResourceDto.uris = [data[this.mapping.uris]];
    }
    // Tags are not supported by the import, the email is used as username only if the latter is not defined.
    if (!externalResourceDto.username && data[this.mapping.email]) {
      externalResourceDto.username = data[this.mapping.email];
    }

    resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
    ResourcesTypeImportParser.parsePinCode(externalResourceDto, resourceTypesCollection);
    const scores = ResourcesTypeImportParser.getScores(externalResourceDto, resourceTypesCollection);
    let resourceType = ResourcesTypeImportParser.findMatchingResourceType(resourceTypesCollection, scores);

    if (!resourceType) {
      resourceType = ResourcesTypeImportParser.findPartialResourceType(resourceTypesCollection, scores);
      if (resourceType) {
        importEntity.importResourcesWarnings.push(
          new ImportError(
            "Resource partially imported",
            externalResourceDto,
            new Error("We used the closest resource type supported."),
          ),
        );
      }
      if (!resourceType) {
        resourceType = ResourcesTypeImportParser.fallbackDefaulResourceType(
          resourceTypesCollection,
          metadataTypesSettings,
        );
        importEntity.importResourcesWarnings.push(
          new ImportError(
            "Imported with default content type",
            externalResourceDto,
            new Error("No resource type associated to this row."),
          ),
        );
      }
    }

    externalResourceDto.resource_type_id = resourceType.id;

    return new ExternalResourceEntity(externalResourceDto);
  }
}

export default CsvNetwrixRowParser;
