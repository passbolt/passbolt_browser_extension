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
 * @since         5.17.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

/**
 * RegistrationResponseJSON as produced by PublicKeyCredential.toJSON() after a create() ceremony.
 */
class WebauthnRegistrationResponseEntity extends EntityV2 {
  /**
   * Get the entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["id", "rawId", "type", "response"],
      properties: {
        id: {
          type: "string",
          minLength: 1,
        },
        rawId: {
          type: "string",
          minLength: 1,
        },
        type: {
          type: "string",
          enum: ["public-key"],
        },
        response: {
          type: "object",
        },
        authenticatorAttachment: {
          type: "string",
          nullable: true,
        },
        clientExtensionResults: {
          type: "object",
        },
      },
    };
  }

  /**
   * @inheritDoc
   * @throws {EntityValidationError} If response.clientDataJSON or response.attestationObject is missing or empty.
   */
  validateBuildRules() {
    const response = this._props.response;
    for (const field of ["clientDataJSON", "attestationObject"]) {
      if (typeof response[field] !== "string" || response[field].length === 0) {
        const error = new EntityValidationError();
        error.addError(`response.${field}`, "required", `The response.${field} should be a non empty string.`);
        throw error;
      }
    }
  }
}

export default WebauthnRegistrationResponseEntity;
