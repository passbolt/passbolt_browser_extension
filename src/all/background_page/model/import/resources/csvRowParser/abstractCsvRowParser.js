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

class AbstractCsvRowParser {
  /**
   * Get the row parser properties mapping.
   * @returns {object}
   */
  static get mapping() {
    throw new Error("mapping should be overridden by the inherited csv row parser.");
  }

  /**
   * Parse a csv row
   * @param {object} data the csv row data
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @returns {ExternalResourceEntity}
   */
  /* eslint-disable no-unused-vars */
  static parse(data, resourceTypesCollection) {
    throw new Error("parse should be overridden by the inherited csv row parser.");
  }
  /* eslint-enable no-unused-vars */

  /**
   * Check that the parser can parse the format represented by the given fields.
   * @param {array} csvFields The csv fields name
   * @return {int} The matching score. the number of fields the parser match. the greater the better.
   */
  static canParse(csvFields) {
    const score = 0;
    const requiredFields = ["name", "secret_clear"];
    const csvHasField = fieldName => csvFields.some(csvFieldName => this.mapping[fieldName] === csvFieldName);

    // Check that the row parser match the required properties
    const hasRequiredFieldsReducer = (contain, fieldName) => contain && csvHasField(fieldName);
    const hasRequiredFields = requiredFields.reduce(hasRequiredFieldsReducer, true);
    if (!hasRequiredFields) {
      return score;
    }

    // Check how many optional properties the row parser match
    const optionalFields = ["username", "uri", "description", "folder_parent_path"];
    const countOptionalFieldsReducer = (count, fieldName) => (csvHasField(fieldName) ? ++count : count);
    const countOptionalFields = optionalFields.reduce(countOptionalFieldsReducer, 0);

    return 2 + countOptionalFields; // # of required properties + # of optional properties.
  }
}

export default AbstractCsvRowParser;
