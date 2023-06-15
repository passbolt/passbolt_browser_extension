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
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import ProfileEntity from "../../profile/profileEntity";
import UserEntity from "../userEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";


const ENTITY_NAME = 'LoggedUser';

class LoggedUserEntity extends Entity {
  /**
   * Logged user entity constructor
   *
   * @param {Object} LoggedUserDto Logged user DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(LoggedUserDto) {
    super(EntitySchema.validate(
      LoggedUserEntity.ENTITY_NAME,
      LoggedUserDto,
      LoggedUserEntity.getSchema()
    ));

    // Associations
    if (this._props.profile) {
      this._profile = new ProfileEntity(this._props.profile);
      delete this._props.profile;
    }
  }

  /**
   * Get logged user entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    const schema = UserEntity.getSchema();
    schema.required = ["id", "username", "profile"];

    return schema;
  }

  /**
   * Return a DTO ready to be sent to API
   * @param {object} [contain] optional for example {profile: {avatar:true}}
   * @returns {*}
   */
  toDto(contain) {
    const result = Object.assign({}, this._props);
    if (!contain) {
      return result;
    }

    if (this.profile && contain.profile) {
      if (contain.profile === true) {
        result.profile = this.profile.toDto();
      } else {
        result.profile = this.profile.toDto(contain.profile);
      }
    }

    return result;
  }

  /**
   * Customizes JSON stringification behavior
   * @returns {*}
   */
  toJSON() {
    return this.toDto(LoggedUserEntity.ALL_CONTAIN_OPTIONS);
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get user id
   * @returns {(string|null)} uuid
   */
  get id() {
    return this._props.id || null;
  }

  /**
   * Get user username
   * @returns {string} email
   */
  get username() {
    return this._props.username;
  }

  /*
   * ==================================================
   * Other associated properties methods
   * ==================================================
   */

  /**
   * Get the profile.
   * @returns {(ProfileEntity|null)}
   */
  get profile() {
    return this._profile || null;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * LoggedUserEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }

  /**
   * LoggedUserEntity.ALL_CONTAIN_OPTIONS
   * @returns {object} all contain options that can be used in toDto()
   */
  static get ALL_CONTAIN_OPTIONS() {
    return UserEntity.ALL_CONTAIN_OPTIONS;
  }
}

export default LoggedUserEntity;
