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

  /**
   * Parse the resource type id
   * @param {object} externalResourceDto the csv row data
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @param {MetadataTypesSettingsEntity} metadataTypesSettings The metadata types from the organization
   * @returns {ResourceTypeEntity}
   */
  static parseResourceType(externalResourceDto, resourceTypesCollection, metadataTypesSettings) {
    //Filter resource collection based on defaultResourceTypes settings
    resourceTypesCollection.filterByResourceTypeVersion(metadataTypesSettings.defaultResourceTypes);
    const scores = this.getScores(externalResourceDto, resourceTypesCollection);

    const matchedResourceType = scores
      .filter(score => score.value > 0)              // Supports at least one parsed property
      .filter(score => score.hasRequiredFields)      // Meets all required properties
      .sort((a, b) => b.value - a.value)[0];         // Supports the highest number of properties

    if (!matchedResourceType) {
      throw new Error("No resource type associated to this row.");
    }
    return resourceTypesCollection.getFirst('slug', matchedResourceType.slug);
  }

  /**
   * Get scores for each resources based on the resourceTypes
   * @param {object} externalResourceDto the csv row data
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @returns {ResourceTypeEntity}
   */
  static getScores(externalResourceDto, resourceTypesCollection) {
    const scores = [];

    for (let i = 0; i < resourceTypesCollection.length; i++) {
      const resourceType = resourceTypesCollection.items[i];

      //Skip legacy resourceType if it exists
      if (resourceType.slug === "password-string") {
        continue;
      }

      const resourceProperties = Object.entries(externalResourceDto)
        .filter(([, value]) => {
          if (typeof value === 'string') {
            return value.length > 0; // Exclude empty strings
          }
          return true;
        })
        .map(([key]) => key === 'secret_clear' ? 'password' : key);

      // Exception to be removed with v5: we need to include password inti the resource
      if (resourceType.slug === "password-description-totp" && resourceProperties.includes("totp") &&  resourceProperties.includes("description")) {
        resourceProperties.push("password");
      }

      const secretsFields = Object.keys(resourceType.definition.secret.properties);
      const secretsRequiredFields = resourceType.definition.secret.required;
      const score = resourceProperties.filter(value => secretsFields.includes(value));
      const matchAllRequiredField = secretsRequiredFields.every(secretsField => score.includes(secretsField));

      scores.push({
        slug: resourceType.slug,
        value: score.length,
        hasRequiredFields: matchAllRequiredField,
        match: score.length === secretsFields.length,
      });
    }

    return scores;
  }
}

export default AbstractCsvRowParser;
