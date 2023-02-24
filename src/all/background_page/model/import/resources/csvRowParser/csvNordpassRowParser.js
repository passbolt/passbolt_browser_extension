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

class CsvNordpassRowParser extends AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * @returns {object}
   */
  static get mapping() {
    return {
      "name": "name",
      "uri": "url",
      "username": "username",
      "secret_clear": "password",
      "description": "note",
      "cardholdername": "cardholername",
      "cardnumber": "cardnumber",
      "cvc": "cvc",
      "expirydate": "expirydate",
      "zipcode": "zipcode",
      "folder_parent_path": "folder",
      "full_name": "full_name",
      "phone_number": "phone_number",
      "email": "email",
      "address1": "address1",
      "address2": "address2",
      "city": "city",
      "country": "country",
      "state": "state",
      "type": "type",
    };
  }

  /**
   * Parse a csv row
   * @param {object} data the csv row data
   * @param {ResourceTypesCollection?} resourceTypesCollection (Optional) The available resource types
   * @returns {ExternalResourceEntity}
   */
  static parse(data, resourceTypesCollection) {
    const externalResourceDto = {};
    const resourceType = this.parseResourceType(data, resourceTypesCollection);
    if (resourceType) {
      externalResourceDto.resource_type_id = resourceType.id;
    }
    for (const propertyName in this.mapping) {
      if (data[this.mapping[propertyName]]) {
        externalResourceDto[propertyName] = data[this.mapping[propertyName]];
      }
    }
    return new ExternalResourceEntity(externalResourceDto);
  }

  /**
   * Parse the resource type id
   * @param {object} data the csv row data
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @returns {ResourceTypeEntity}
   */
  static parseResourceType(data, resourceTypesCollection) {
    if (resourceTypesCollection) {
      return resourceTypesCollection.getFirst('slug', 'password-and-description');
    }
  }
}

export default CsvNordpassRowParser;
