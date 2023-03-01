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
import CsvChromiumRowParser from "../../../import/resources/csvRowParser/csvChromiumRowParser";
import AbstractRowComposer from "./abstractRowComposer";

const FORMAT = "csv-chromium";

class CsvChromiumRowComposer extends AbstractRowComposer {
  /**
   * Get the composer supported format name
   * @returns {string}
   */
  static get format() {
    return FORMAT;
  }

  /**
   * Get the row composer properties mapping.
   * Key values object where key represents the passbolt entity property name and the value represents the CSV property name.
   * @returns {object}
   */
  static get mapping() {
    return CsvChromiumRowParser.mapping;
  }

  /**
   * Compose a csv row
   * @param {ExternalResourceEntity} externalResourceEntity The resource to use to compose the row
   * @returns {object} Note that if a property defined in the mapping is not set in the given entity, then the function will
   * @returns {object}
   */
  static compose(externalResourceEntity) {
    const row = {};
    const externalResourceDto = externalResourceEntity.toDto();
    for (const propertyName in this.mapping) {
      row[this.mapping[propertyName]] = externalResourceDto[propertyName] || "";
    }
    return row;
  }
}

export default CsvChromiumRowComposer;
