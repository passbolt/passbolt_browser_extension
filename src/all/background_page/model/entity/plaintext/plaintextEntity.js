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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'Plaintext';

class PlaintextEntity extends Entity {
  /**
   * Plaintext entity constructor
   * Use to store unencrypted secrets
   *
   * @param {Object} secretDto secret DTO
   * @param {Object} schema from ResourceType
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(secretDto, schema) {
    super(EntitySchema.validate(
      PlaintextEntity.ENTITY_NAME,
      secretDto,
      schema
    ));
  }

  /**
   * Get plaintext entity schema
   * @throws TypeError unsupported
   */
  static getSchema() {
    throw new TypeError('Plaintext only support dynamic schemas, defined from resource type.');
  }

  /**
   * Return props
   *
   * @returns {any}
   */
  get props() {
    return this._props;
  }

  /**
   * Return password prop if any
   *
   * @returns {(string|null)} password
   */
  get password() {
    return this._props.password || null;
  }

  /**
   * Return description prop if any
   *
   * @returns {(string|null)} description
   */
  get description() {
    return this._props.description || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */
  /**
   * Plaintext.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default PlaintextEntity;
