// var Validator = require('../vendors/validator');
const {Entity} = require('../entity');
const FOLDER_NAME_MIN_LENGTH = 1;
const FOLDER_NAME_MAX_LENGTH = 255;

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

    if (!data) {
      throw new TypeError('Folder constructor error, no data provided.');
    }
    if (data.name) {
      this.setName(data.name);
    } else {
      this.setName('Untitled Folder');
    }
    if (data.id) {
      this.setId(data.id);
    }
    if (data.parentId) {
      this.setParentId(data.parentId);
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
   * Parent Id
   * @param {string} parentId
   * @throws {TypeError} if parent id is not a valid uuid
   * @returns {FolderEntity} self
   * @public
   */
  setParentId(parentId) {
    if (!parentId) {
      throw new TypeError('Folder parent id should not be empty.')
    }
    if (typeof parentId !== 'string') {
      throw new TypeError('Folder parent id should be a valid string.');
    }
    if (!Validator.isUUID(parentId)) {
      throw new TypeError('Folder parent id should be a valid uuid.');
    }
    this.parentId = parentId;

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
    if (this.parentId) {
      data.parent_id = this.name;
    }
    if (this.id) {
      data.id = this.id;
    }
    return data;
  }
}

exports.FolderEntity = FolderEntity;
