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
import {
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity";
import TotpEntity from "../../../entity/totp/totpEntity";

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
   * @param {ResourceTypesCollection?} resourceTypesCollection (Optional) The available resource types
   * @returns {ExternalResourceEntity}
   */
  static parse(data, resourceTypesCollection) {
    const externalResourceDto = {};
    let resourceTypeSlug = RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG;
    for (const propertyName in this.mapping) {
      if (data[this.mapping[propertyName]]) {
        if (propertyName === "totp") {
          externalResourceDto.totp = this.parseTotp(data[this.mapping[propertyName]]);
          resourceTypeSlug = RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG;
        } else {
          externalResourceDto[propertyName] = data[this.mapping[propertyName]];
        }
      }
    }
    const resourceType = this.parseResourceType(resourceTypeSlug, resourceTypesCollection);
    if (resourceType) {
      externalResourceDto.resource_type_id = resourceType.id;
    }
    return new ExternalResourceEntity(externalResourceDto);
  }

  /**
   * Parse the resource type according to the resource type slug
   * @param {string} resourceTypeSlug
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @returns {ResourceTypeEntity}
   */
  static parseResourceType(resourceTypeSlug, resourceTypesCollection) {
    if (resourceTypesCollection) {
      return resourceTypesCollection.getFirst('slug', resourceTypeSlug);
    }
    return null;
  }

  /**
   * Parse the TOTP
   * @param {string} totpUrl
   * @return {{secret_key: *, period: *, digits: *, algorithm: *}}
   */
  static parseTotp(totpUrl) {
    const totpUrlDecoded = new URL(decodeURIComponent(totpUrl));
    const totp = TotpEntity.createTotpFromUrl(totpUrlDecoded);
    return totp.toDto();
  }
}

export default CsvKdbxRowParser;
