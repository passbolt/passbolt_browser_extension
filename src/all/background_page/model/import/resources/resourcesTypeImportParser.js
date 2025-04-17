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
 * @since         4.10.0
 */

import {RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG, RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG, RESOURCE_TYPE_PASSWORD_STRING_SLUG, RESOURCE_TYPE_V5_DEFAULT_SLUG, RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG, RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";

class ResourcesTypeImportParser {
  /**
   * Based on the score, we find the perfect resource type matching with import
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @param {object} scores the scores calculated for each resourceType
   * @returns {ResourceTypeEntity}
   */
  static findMatchingResourceType(resourceTypesCollection, scores) {
    //Get highest
    const matchedResourceType = scores
      .filter(score => score.value > 0)                        // Supports at least one parsed property
      .filter(score => score.missingRequiredFields === 0)      // Meets all required properties
      .sort((a, b) => b.value - a.value)[0];                   // Supports the highest number of properties

    if (!matchedResourceType) {
      return;
    }
    return resourceTypesCollection.getFirst('slug', matchedResourceType.slug);
  }

  /**
   * Based on the score, we find the resource type which partially work based on the score
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @param {object} scores the scores calculated for each resourceType
   * @returns {ResourceTypeEntity}
   */
  static findPartialResourceType(resourceTypesCollection, scores) {
    //Get highest partial match which has at least score to 1
    const matchedResourceType = scores
      .filter(score => score.value > 0)                                       // Supports at least one parsed property
      .sort((a, b) => a.missingRequiredFields - b.missingRequiredFields)[0];  // Supports with the lowest required missing field

    if (!matchedResourceType) {
      return;
    }

    return resourceTypesCollection.getFirst('slug', matchedResourceType.slug);
  }

  /**
   * Fallback to default resource type if import does not match with any supported resource type
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @param {MetadataTypesSettingsEntity} metadataTypesSettings The metadata types from the organization
   * @returns
   */
  static fallbackDefaulResourceType(resourceTypesCollection, metadataTypesSettings) {
    let resourceType;

    if (metadataTypesSettings.isDefaultResourceTypeV5) {
      resourceType =  resourceTypesCollection.getFirst('slug', RESOURCE_TYPE_V5_DEFAULT_SLUG);
    } else {
      resourceType =  resourceTypesCollection.getFirst('slug', RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG);
    }

    if (!resourceType) {
      throw new Error("No resource type associated to this row.");
    }

    return resourceType;
  }

  /**
   * Get scores for each resources based on the resourceTypes
   * @param {object} externalResourceDto the csv row data
   * @param {ResourceTypesCollection} resourceTypesCollection The available resource types
   * @returns {Object}
   */
  static getScores(externalResourceDto, resourceTypesCollection) {
    const scores = [];

    for (let i = 0; i < resourceTypesCollection.length; i++) {
      const resourceType = resourceTypesCollection.items[i];

      //Skip legacy resourceType if it exists
      if (resourceType.slug === RESOURCE_TYPE_PASSWORD_STRING_SLUG || resourceType.slug === RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG) {
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

      // Exception to be removed with v5: we need to include password in the resource
      if ((resourceType.slug === RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG || resourceType.slug === RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG) && resourceProperties.includes("totp") &&  resourceProperties.includes("description")) {
        resourceProperties.push("password");
      }
      const secretsFields = Object.keys(resourceType.definition.secret.properties);
      const secretsRequiredFields = resourceType.definition.secret.required;
      const score = resourceProperties.filter(value => secretsFields.includes(value));
      const missingRequiredFields = secretsRequiredFields.filter(secretsField => !score.includes(secretsField)).length;

      scores.push({
        slug: resourceType.slug,
        value: score.length,
        missingRequiredFields: missingRequiredFields,
        match: score.length === secretsFields.length,
      });
    }

    return scores;
  }
}

export default ResourcesTypeImportParser;
