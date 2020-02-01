// var Validator = require('../vendors/validator');
const {Entity} = require('../entity');
const FOLDER_NAME_MIN_LENGTH = 1;
const FOLDER_NAME_MAX_LENGTH = 64;

class FolderEntity extends Entity {

  /**
   * Folder entity constructor
   *
   * @throws {TypeError} if name is is not a valid UTF8 Extended string
   * @throws {TypeError} if id is not a valid UUID
   * @throws {TypeError} if parent id is not a valid uuid
   * @param {Object} data folder DTO
   */
  constructor(data) {
    super();
    if (typeof data.id !== "undefined") {
      this.setId(data.id);
    }
    if (typeof data.name !== "undefined") {
      this.setName(data.name);
    }
    if (typeof data.folderParentId !== "undefined") {
      this.setFolderParentId(data.folderParentId);
    }
  }

  /**
   * Get the id
   *
   * @throws {Error} if id is not set
   * @returns {string} id uuid
   */
  getId() {
    if (!this.id) {
      throw new Error('Folder id is empty.')
    }
    return this.id;
  }

  /**
   * Set id
   * @param {string} id
   * @throws {TypeError} if id is not a valid UUID
   * @returns {FolderEntity} self
   * @public
   */
  setId(id) {
    if (!id) {
      throw new TypeError('Folder id should not be empty.')
    }
    if (typeof id !== 'string') {
      throw new TypeError('Folder id should be a valid string.');
    }
    if (!Validator.isUUID(id)) {
      throw new TypeError('Folder id should be a valid uuid.');
    }
    this.id = id;

    return this;
  }

  /**
   * Folder Parent Id
   * @param {string|null} folderParentId
   * @throws {TypeError} if parent id is not a valid uuid
   * @returns {FolderEntity} self
   * @public
   */
  setFolderParentId(folderParentId) {
    if (folderParentId !== null) {
      if (!folderParentId) {
        throw new TypeError('Folder parent id should not be empty.')
      }
      if (typeof folderParentId !== 'string') {
        throw new TypeError('Folder parent id should be a valid string.');
      }
      if (!Validator.isUUID(folderParentId)) {
        throw new TypeError('Folder parent id should be a valid uuid.');
      }
    }

    this.folderParentId = folderParentId;

    return this;
  }

  /**
   * Set folder name
   *
   * @param {string} name
   * @throws {TypeError} if name is is not a valid UTF8 Extended string
   * @returns {FolderEntity}
   * @public
   */
  setName(name) {
    if (!name) {
      throw new TypeError('Folder name should not be empty.')
    }
    if (typeof name !== 'string') {
      throw new TypeError('Folder name should be a valid string.');
    }
    if (!Validator.isLength(name, FOLDER_NAME_MIN_LENGTH, FOLDER_NAME_MAX_LENGTH)) {
      throw new TypeError(`Folder name should not be more than ${FOLDER_NAME_MAX_LENGTH} characters in length.`);
    }
    this.name = name;

    return this;
  }

  /**
   * Return entity as data ready to be sent via Passbolt API
   * @returns {Object}
   */
  toApiData() {
    let data = {};
    if (this.name) {
      data.name = this.name;
    }
    if (this.folderParentId) {
      data.folder_parent_id = this.folderParentId;
    }
    if (this.id) {
      data.id = this.id;
    }
    return data;
  }

  /**
   * Return entity as data ready to be retrieve grom Passbolt API
   * @returns {Object}
   */
  static fromApiData(data) {
    const result = {};

    if (typeof data.id !==  "undefined") {
      result.id = data.id;
    }
    if (typeof data.name !==  "undefined") {
      result.name = data.name;
    }
    if (typeof data.folder_parent_id !==  "undefined") {
      result.folderParentId = data.folder_parent_id;
    }

    return result;
  }
}

exports.FolderEntity = FolderEntity;
