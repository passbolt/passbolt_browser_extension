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
 * @since         3.0.0
 */
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";

const RESOURCE_TYPE_NAME_MAX_LENGTH = 255;
const RESOURCE_TYPE_SLUG_MAX_LENGTH = 64;
const RESOURCE_TYPE_DESCRIPTION_MAX_LENGTH = 255;

export const RESOURCE_TYPE_PASSWORD_STRING_SLUG = "password-string";
export const RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG = "password-and-description";
export const RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG = "password-description-totp";
export const RESOURCE_TYPE_TOTP_SLUG = "totp";

//Plaintext secret schema for slug: "password-string"
export const RESOURCE_TYPE_PASSWORD_STRING_LEGACY_DEFINITION_SCHEMA = {
  resource: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        maxLength: 255,
      },
      username: {
        type: "string",
        maxLength: 255,
        nullable: true,
      },
      description: {
        maxLength: 10000,
        nullable: true,
        type: "string"
      },
      uri: {
        type: "string",
        maxLength: 1024,
        nullable: true
      }
    }
  },
  secret: {
    type: "string",
    maxLength: 4096
  }
};

//Plaintext secret schema for slug: "password-and-description"
const RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_DEFINITION_SCHEMA = {
  resource: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        maxLength: 255
      },
      username: {
        type: "string",
        maxLength: 255,
        nullable: true
      },
      uri: {
        type: "string",
        maxLength: 1024,
        nullable: true
      },
    },
  },
  secret: {
    type: "object",
    required: ["password"],
    properties: {
      password: {
        type: "string",
        maxLength: 4096
      },
      description: {
        type: "string",
        maxLength: 10000,
        nullable: true,
      },
    },
  }
};

//Plaintext secret schema for slug: "totp"
const RESOURCE_TYPE_TOTP_DEFINITION_SCHEMA = {
  resource: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        maxLength: 255
      },
      uri: {
        type: "string",
        maxLength: 1024,
        nullable: true
      }
    }
  },
  secret: {
    type: "object",
    required: ["totp"],
    properties: {
      totp: {
        type: "object",
        required: ["secret_key", "digits", "algorithm"],
        properties: {
          algorithm: {
            type: "string",
            minLength: 4,
            maxLength: 6,
          },
          secret_key: {
            type: "string",
            maxLength: 1024
          },
          digits: {
            type: "number",
            minimum: 6,
            maximum: 8
          },
          period: {
            type: "number"
          }
        }
      }
    }
  }
};

//Plaintext secret schema for slug: "password-description-totp"
const RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_DEFINITION_SCHEMA = {
  resource: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        maxLength: 255
      },
      username: {
        type: "string",
        maxLength: 255,
        nullable: true
      },
      uri: {
        type: "string",
        maxLength: 1024,
        nullable: true
      },
    },
  },
  secret: {
    type: "object",
    required: ["password", "totp"],
    properties: {
      password: {
        type: "string",
        maxLength: 4096
      },
      description: {
        type: "string",
        maxLength: 10000,
        nullable: true,
      },
      totp: RESOURCE_TYPE_TOTP_DEFINITION_SCHEMA.secret.properties.totp,
    },
  }
};

const SCHEMAS = {
  [RESOURCE_TYPE_PASSWORD_STRING_SLUG]: RESOURCE_TYPE_PASSWORD_STRING_LEGACY_DEFINITION_SCHEMA,
  [RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG]: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_DEFINITION_SCHEMA,
  [RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG]: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_DEFINITION_SCHEMA,
  [RESOURCE_TYPE_TOTP_SLUG]: RESOURCE_TYPE_TOTP_DEFINITION_SCHEMA,
};

class ResourceTypeEntity extends EntityV2 {
  /**
   * @inheritdoc
   */
  marshall() {
    if (typeof this._props.slug !== "string" || !(this._props.slug in SCHEMAS)) {
      //if the slug is not suppported or invalid, we ensure the validation fails on `definition`.
      delete this._props.definition;
      return;
    }

    const resourceTypeDefinitionSchema = SCHEMAS[this._props.slug];
    const definition = Object.assign({}, resourceTypeDefinitionSchema);
    this._props.definition = definition;
  }

  /**
   * Get resource type entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "id",
        "name",
        "slug",
        "definition",
      ],
      "properties": {
        "id": {
          "type": "string",
          "format": "uuid"
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": RESOURCE_TYPE_NAME_MAX_LENGTH
        },
        "slug": {
          "type": "string",
          "minLength": 1,
          "maxLength": RESOURCE_TYPE_SLUG_MAX_LENGTH
        },
        "definition": {
          "type": "object"
        },
        "description": {
          "type": "string",
          "maxLength": RESOURCE_TYPE_DESCRIPTION_MAX_LENGTH,
          "nullable": true,
        },
        "created": {
          "type": "string",
          "format": "date-time"
        },
        "modified": {
          "type": "string",
          "format": "date-time"
        },
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */
  /**
   * Get resource type id
   * @returns {string} uuid
   */
  get id() {
    return this._props.id;
  }

  /**
   * Get resource type slug
   * @returns {string} slug
   */
  get slug() {
    return this._props.slug;
  }

  /**
   * Get resource type definition (JSON compatible schema)
   * @returns {object} definition
   */
  get definition() {
    return this._props.definition;
  }
}

export default ResourceTypeEntity;
