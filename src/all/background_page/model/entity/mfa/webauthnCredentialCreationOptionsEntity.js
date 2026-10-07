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

// COSE algorithm identifiers ES256 and RS256, https://www.iana.org/assignments/cose#algorithms
const ALLOWED_ALGORITHMS = [-7, -257];
// WebAuthn recommends at least 16 bytes, https://www.w3.org/TR/webauthn-3/#sctn-cryptographic-challenges
const CHALLENGE_MIN_BYTES = 16;

/**
 * PublicKeyCredentialCreationOptionsJSON as returned by the API begin endpoint.
 * The build rules check the nested content; ValidateWebauthnCreationOptionsService checks it against the account.
 */
class WebauthnCredentialCreationOptionsEntity extends EntityV2 {
  /**
   * Get the entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["rp", "user", "challenge", "pubKeyCredParams", "attestation"],
      properties: {
        rp: {
          type: "object",
          properties: {
            id: {
              type: "string",
              minLength: 1,
            },
            name: {
              type: "string",
              minLength: 1,
            },
          },
        },
        user: {
          type: "object",
          properties: {
            id: {
              type: "string",
              minLength: 1,
              // format: "x-base64", // "x-" prefixed format are non JSON Schema standards
            },
            name: {
              type: "string",
              minLength: 1,
            },
            displayName: {
              type: "string",
              minLength: 1,
            },
          },
        },
        challenge: {
          type: "string",
          minLength: 1,
          // format: "x-base64",
        },
        pubKeyCredParams: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["public-key"],
              },
              alg: {
                type: "number",
                enum: ALLOWED_ALGORITHMS,
              },
            },
          },
        },
        timeout: {
          type: "integer",
        },
        excludeCredentials: {
          type: "array",
        },
        authenticatorSelection: {
          type: "object",
        },
        attestation: {
          type: "string",
          enum: ["none"],
        },
        hints: {
          type: "array",
        },
        extensions: {
          type: "object",
        },
      },
    };
  }

  /**
   * @inheritDoc
   * @throws {EntityValidationError} If a relying party or user field is missing or empty.
   * @throws {EntityValidationError} If the user id is not base64url.
   * @throws {EntityValidationError} If the challenge is not base64url of at least 16 bytes.
   * @throws {EntityValidationError} If a public key credential parameter is not ES256 or RS256.
   */
  validateBuildRules() {
    const { rp, user, challenge, pubKeyCredParams } = this._props;
    this.assertNonEmptyString("rp.id", rp.id);
    this.assertNonEmptyString("rp.name", rp.name);
    this.assertNonEmptyString("user.id", user.id);
    this.assertNonEmptyString("user.name", user.name);
    this.assertNonEmptyString("user.displayName", user.displayName);
    this.assertBase64Url("user.id", user.id);
    this.assertChallengeLength(challenge);
    this.assertSupportedAlgorithms(pubKeyCredParams);
  }

  /**
   * Assert that the challenge is base64url of at least the WebAuthn minimum length.
   *
   * @param {string} challenge The base64url challenge
   * @throws {EntityValidationError} If the challenge is not decodable or too short.
   */
  assertChallengeLength(challenge) {
    if (this.assertBase64Url("challenge", challenge).length < CHALLENGE_MIN_BYTES) {
      const error = new EntityValidationError();
      error.addError("challenge", "min_bytes", `The challenge should be at least ${CHALLENGE_MIN_BYTES} bytes.`);
      throw error;
    }
  }

  /**
   * Assert that the credential parameters offer only supported public key algorithms.
   *
   * @param {Array<object>} pubKeyCredParams The [{type, alg}] list
   * @throws {EntityValidationError} If the list is empty or contains an unsupported type or algorithm.
   */
  assertSupportedAlgorithms(pubKeyCredParams) {
    const paramsAreValid =
      pubKeyCredParams.length > 0 &&
      pubKeyCredParams.every((p) => p?.type === "public-key" && ALLOWED_ALGORITHMS.includes(p?.alg));
    if (!paramsAreValid) {
      const error = new EntityValidationError();
      error.addError(
        "pubKeyCredParams",
        "unsupported_alg",
        "The pubKeyCredParams should only contain supported public key algorithms.",
      );
      throw error;
    }
  }

  /**
   * Assert that the given nested prop is a non empty string.
   *
   * @param {string} propName The dotted property path, example: rp.id
   * @param {*} propValue The property value
   * @throws {EntityValidationError} If the value is not a non empty string.
   */
  assertNonEmptyString(propName, propValue) {
    if (typeof propValue !== "string" || propValue.length === 0) {
      const error = new EntityValidationError();
      error.addError(propName, "required", `The ${propName} should be a non empty string.`);
      throw error;
    }
  }

  /**
   * Assert that the given prop is base64url and return its decoded value.
   *
   * @param {string} propName The property path, example: user.id
   * @param {string} propValue The property value
   * @returns {string} The decoded binary string
   * @throws {EntityValidationError} If the value is not decodable.
   */
  assertBase64Url(propName, propValue) {
    try {
      return WebauthnCredentialCreationOptionsEntity.decodeBase64Url(propValue);
    } catch {
      const error = new EntityValidationError();
      error.addError(propName, "base64url", `The ${propName} should be base64url.`);
      throw error;
    }
  }

  /**
   * Decode a base64url string to a binary string.
   * @param {string} value
   * @returns {string}
   * @throws {DOMException} If the value is not decodable.
   */
  static decodeBase64Url(value) {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    return atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  }

  /**
   * The relying party {id, name}
   * @returns {object}
   */
  get rp() {
    return this._props.rp;
  }

  /**
   * The user {id, name, displayName}
   * @returns {object}
   */
  get user() {
    return this._props.user;
  }

  /**
   * The accepted credential parameters [{type, alg}]
   * @returns {Array<object>}
   */
  get pubKeyCredParams() {
    return this._props.pubKeyCredParams;
  }
}

export default WebauthnCredentialCreationOptionsEntity;
