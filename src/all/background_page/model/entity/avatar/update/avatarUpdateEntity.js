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
 * @since         2.13.0
 */
import Entity from "passbolt-styleguide/src/shared/models/entity/abstract/entity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import b64ToBlob from "../../../../utils/format/base64";


const ENTITY_NAME = 'AvatarUpdate';

class AvatarUpdateEntity extends Entity {
  /**
   * Avatar entity constructor
   *
   * @param {Object} avatarUpdateDto avatar DTO
   * @throws EntityValidationError if the dto cannot be converted into an entity
   */
  constructor(avatarUpdateDto) {
    super(EntitySchema.validate(
      AvatarUpdateEntity.ENTITY_NAME,
      avatarUpdateDto,
      AvatarUpdateEntity.getSchema()
    ));
    // The default behavior of the constructor is to serialize/unserialize the props to ensure a deep copy, it doesn't work with Blob.
    this.file = avatarUpdateDto.file;
  }

  /**
   * Instantiate an AvatarUpdateEntity based on a base 64 file.
   * @param {object} avatarBase64UpdateDto The dto
   * {fileBase64: <string>, mimeType: <string>, filename: <string>}
   * @return {AvatarUpdateEntity}
   */
  static createFromFileBase64(avatarBase64UpdateDto) {
    if (!avatarBase64UpdateDto || typeof avatarBase64UpdateDto !== 'object') {
      throw new TypeError(`AvatarUpdateEntity createFromFileBase64 parameter should be an object.`);
    }
    const filename = avatarBase64UpdateDto.filename;
    const fileBase64 = avatarBase64UpdateDto.fileBase64;
    const mimeType = avatarBase64UpdateDto.mimeType;
    const file = b64ToBlob(fileBase64, mimeType);
    const avatarUpdateDto = {file: file, filename: filename, mimeType: mimeType};
    return new AvatarUpdateEntity(avatarUpdateDto);
  }

  /**
   * Get avatar entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "file",
        "filename",
        "mime"
      ],
      "properties": {
        "file": {
          "type": "blob"
        },
        "filename": {
          "type": "string"
        },
        "mimeType": {
          "type": "string"
        }
      }
    };
  }

  /*
   * ==================================================
   * Dynamic properties getters
   * ==================================================
   */

  /**
   * Get the file
   * @returns {Blob}
   */
  get file() {
    return this._props.file;
  }

  /**
   * Get the file
   * @param {Blob} file
   */
  set file(file) {
    this._props.file = file;
  }

  /**
   * Get the filename
   * @returns {string}
   */
  get filename() {
    return this._props.filename;
  }

  /**
   * Get the mime type
   * @returns {string}
   */
  get mimeType() {
    return this._props.mimeType;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * AvatarEntity.ENTITY_NAME
   * @returns {string}
   */
  static get ENTITY_NAME() {
    return ENTITY_NAME;
  }
}

export default AvatarUpdateEntity;
