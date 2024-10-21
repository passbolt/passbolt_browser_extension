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

class Csv1PasswordRowParser extends AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * @returns {object}
   */
  static get mapping() {
    return {
      "name": "Title",
      "username": "Username",
      "uri": "Url",
      "secret_clear": "Password",
      "description": "Notes",
      "folder_parent_path": "Type"
    };
  }

  /**
   * Parse a csv row
   * @param {object} data the csv row data
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @param {MetadataTypesSettingsEntity} metadataTypesSettings The metadata types from the organization
   * @returns {ExternalResourceEntity}
   */
  static parse(data, resourceTypesCollection, metadataTypesSettings) {
    const externalResourceDto = {};

    for (const propertyName in this.mapping) {
      if (data[this.mapping[propertyName]]) {
        externalResourceDto[propertyName] = data[this.mapping[propertyName]];
      }
    }
    const resourceType = this.parseResourceType(externalResourceDto, resourceTypesCollection, metadataTypesSettings);
    externalResourceDto.resource_type_id = resourceType.id;

    return new ExternalResourceEntity(externalResourceDto);
  }
}

export default Csv1PasswordRowParser;
