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
 * @since         5.14.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

const ENTITY_NAME = "PasskeyKitClientPartEntity";

/**
 * Entity holding the CLIENT half of a passkey passphrase kit: the non-extractable
 * AES-GCM key (nek), the two initialisation vectors and the double-round ciphertext (secret) of the
 * passphrase, keyed by the credential id it belongs to.
 *
 * It mirrors the SSO client kit (same double-round crypto) but is keyed by credential id instead of a
 * provider, because a user may enrol several security keys. The client half never leaves the device;
 * combined with the server half (fetched only after a valid assertion) it decrypts the passphrase.
 */
class PasskeyKitClientPartEntity extends Entity {
  /**
   * @inheritDoc
   * Customizes cloning to duplicate subtle crypto keys (not supported by the inherited JSON cloning).
   * @throws {EntityValidationError} Verify the validity of the nek, iv1 and iv2.
   */
  constructor(passkeyClientDataDto, options = {}) {
    // Crypto keys cannot survive JSON serialization; structuredClone preserves the CryptoKey.
    const clonedDto = structuredClone(passkeyClientDataDto);

    super(
      EntitySchema.validate(PasskeyKitClientPartEntity.ENTITY_NAME, clonedDto, PasskeyKitClientPartEntity.getSchema()),
      options,
    );

    PasskeyKitClientPartEntity.validateNek(clonedDto.nek);
    PasskeyKitClientPartEntity.validateIv(clonedDto.iv1);
    PasskeyKitClientPartEntity.validateIv(clonedDto.iv2);

    this._props.nek = clonedDto.nek;
    this._props.iv1 = clonedDto.iv1;
    this._props.iv2 = clonedDto.iv2;
  }

  /**
   * Validates the client part key: a non-extractable AES-GCM 256-bit CryptoKey with exactly the
   * encrypt and decrypt capabilities.
   *
   * @param {CryptoKey} nek
   */
  static validateNek(nek) {
    const entityValidationError = new EntityValidationError();
    if (!(nek instanceof CryptoKey)) {
      entityValidationError.addError("nek", "type", "PasskeyKitClientPartEntity expects an nek to be a CryptoKey.");
    }
    if (nek.extractable) {
      entityValidationError.addError("nek", "type", "PasskeyKitClientPartEntity expects an nek not to be extractable.");
    }
    if (nek?.algorithm?.name !== "AES-GCM") {
      entityValidationError.addError("nek", "type", "PasskeyKitClientPartEntity expects an nek using AES-GCM.");
    }
    if (nek?.algorithm?.length !== 256) {
      entityValidationError.addError("nek", "type", "PasskeyKitClientPartEntity expects an nek using 256 bits.");
    }
    if (!nek?.usages?.includes("encrypt")) {
      entityValidationError.addError("nek", "type", "PasskeyKitClientPartEntity expects an nek able to encrypt.");
    }
    if (!nek?.usages?.includes("decrypt")) {
      entityValidationError.addError("nek", "type", "PasskeyKitClientPartEntity expects an nek able to decrypt.");
    }
    if (nek?.usages?.length !== 2) {
      entityValidationError.addError(
        "nek",
        "type",
        "PasskeyKitClientPartEntity expects an nek to only encrypt/decrypt.",
      );
    }
    if (entityValidationError.hasErrors()) {
      throw entityValidationError;
    }
  }

  /**
   * Validates an IV: a 12-byte Uint8Array.
   *
   * @param {Uint8Array} iv
   */
  static validateIv(iv) {
    const entityValidationError = new EntityValidationError();
    if (!(iv instanceof Uint8Array)) {
      entityValidationError.addError("iv", "type", "PasskeyKitClientPartEntity expects IVs to be a Uint8Array.");
    }
    if (iv.length !== 12) {
      entityValidationError.addError("iv", "type", "PasskeyKitClientPartEntity expects IVs to be 12 bytes.");
    }
    if (entityValidationError.hasErrors()) {
      throw entityValidationError;
    }
  }

  /*
   * ==================================================
   * Serialization
   * ==================================================
   */
  /**
   * Not supported: the client half must never be serialized to plain text.
   * @throws {Error}
   */
  toDto() {
    throw new Error("Serialization is not supported on this object");
  }

  /**
   * Get an object formatted for IndexedDB (preserves the CryptoKey).
   * @returns {object}
   */
  toDbSerializableObject() {
    return structuredClone(this._props);
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      type: "object",
      required: ["credential_id", "nek", "iv1", "iv2", "secret"],
      properties: {
        credential_id: {
          type: "string",
        },
        nek: {
          type: "object",
        },
        iv1: {
          type: "object",
        },
        iv2: {
          type: "object",
        },
        secret: {
          type: "string",
        },
      },
    };
  }

  /**
   * Get the base64url credential id this kit belongs to.
   * @returns {string}
   */
  get credentialId() {
    return this._props.credential_id;
  }

  /**
   * Get the kit secret (double-round ciphertext of the passphrase).
   * @returns {string}
   */
  get secret() {
    return this._props.secret;
  }

  /**
   * Get the non-extractable key.
   * @returns {CryptoKey}
   */
  get nek() {
    return this._props.nek;
  }

  /**
   * Get the first initialisation vector.
   * @returns {Uint8Array}
   */
  get iv1() {
    return this._props.iv1;
  }

  /**
   * Get the second initialisation vector.
   * @returns {Uint8Array}
   */
  get iv2() {
    return this._props.iv2;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * PasskeyKitClientPartEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default PasskeyKitClientPartEntity;
