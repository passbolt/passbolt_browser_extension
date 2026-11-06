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
import CsvNetwrixRowParser from "../../../import/resources/csvRowParser/csvNetwrixRowParser";
import AbstractRowComposer from "./abstractRowComposer";

const FORMAT = "csv-netwrix";

class CsvNetwrixRowComposer extends AbstractRowComposer {
  /**
   * Get the composer supported format name
   * @returns {string}
   */
  static get format() {
    return FORMAT;
  }

  /**
   * Get the csv delimiter. Netwrix uses semicolons.
   * @returns {string}
   */
  static get delimiter() {
    return ";";
  }

  /**
   * Get the row composer properties mapping.
   * Key values object where key represents the passbolt entity property name and the value represents the CSV property name.
   * @returns {object}
   */
  static get mapping() {
    return CsvNetwrixRowParser.mapping;
  }

  /**
   * Compose a csv row
   * Tags and email are not exported and are left empty.
   * @param {ExternalResourceEntity} externalResourceEntity The resource to use to compose the row
   * @returns {object}
   */
  static compose(externalResourceEntity) {
    const row = {};
    const externalResourceDto = externalResourceEntity.toDto();
    for (const propertyName in this.mapping) {
      if (propertyName === "uris") {
        row[this.mapping[propertyName]] = externalResourceDto.uris?.length > 0 ? externalResourceDto.uris[0] : "";
      } else if (propertyName === "tags" || propertyName === "email") {
        row[this.mapping[propertyName]] = "";
      } else {
        row[this.mapping[propertyName]] = externalResourceDto[propertyName] || "";
      }
    }
    return row;
  }
}

export default CsvNetwrixRowComposer;
