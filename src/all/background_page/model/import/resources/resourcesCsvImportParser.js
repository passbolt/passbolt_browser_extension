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
const {BinaryConvert} = require("../../../utils/format/binaryConvert");
const {ImportError} = require("../../../error/importError");
const {FileFormatError} = require("../../../error/fileFormatError");
const {ExternalFoldersCollection} = require("../../entity/folder/external/externalFoldersCollection");
const {ExternalResourcesCollection} = require("../../entity/resource/external/externalResourcesCollection");
const {ExternalFolderEntity} = require("../../entity/folder/external/externalFolderEntity");

const {Csv1PasswordRowParser} = require("./csvRowParser/csv1PasswordRowParser");
const {CsvKdbxRowParser} = require("./csvRowParser/csvKdbxRowParser");
const {CsvLastPassRowParser} = require("./csvRowParser/csvLastPassRowParser");

/**
 * Register of csv row parsers
 * @type {array<Class>}
 */
const register = [
  Csv1PasswordRowParser,
  CsvKdbxRowParser,
  CsvLastPassRowParser
];

class ResourcesCsvImportParser {
  /**
   * Kdbx parser constructor
   * @param {ImportResourcesFileEntity} importEntity The import entity
   * @param {ResourceTypesCollection?} resourceTypesCollection (Optional) The available resource types
   */
  constructor(importEntity, resourceTypesCollection) {
    this.importEntity = importEntity;
    this.resourceTypesCollection = resourceTypesCollection;
  }

  /**
   * Get the register of row parsers.
   * @returns {Array<Class>}
   */
  static get register() {
    return register;
  }

  /**
   * Parse the import
   * @returns {Promise<void>}
   */
  async parseImport() {
    const {data, fields} = this.readCsv()
    const RowParser = this.getRowParser(fields);
    if (!RowParser) {
      throw new FileFormatError('This csv format is not supported.');
    }
    const externalResourcesCollection = this.parseResources(RowParser, data);
    const externalFoldersCollection = this.parseFolders(externalResourcesCollection);
    this.createAndChangeRootFolder(externalFoldersCollection, externalResourcesCollection);
    this.importEntity.importFolders = externalFoldersCollection;
    this.importEntity.importResources = externalResourcesCollection;
  }

  /**
   * Read the csv file
   * @returns {{data: <array<object>>, fields: <array<string>>}}
   */
  readCsv() {
    const decoded = atob(this.importEntity.file);
    const csv = BinaryConvert.fromBinary(decoded);
    const {data, errors, meta: {fields}} = PapaParse.parse(csv, {header: true, skipEmptyLines: true});
    // For now, no papaparse controlled errors are a blocking the import process
    return {data, fields};
  }

  /**
   * Get the csv row parser.
   * @param {array} csvFields The csv header fields name
   * @returns {Class|null} Return the row parser call or null if no match
   */
  getRowParser(csvFields) {
    let selectedRowParser = null;
    let selectedRowParserScore = 0;

    for (let RowParser of register) {
      const score = RowParser.canParse(csvFields);
      if (score > selectedRowParserScore) {
        selectedRowParser = RowParser;
        selectedRowParserScore = score;
      }
    }

    return selectedRowParser;
  }

  /**
   * Parse csv data and extract the resources
   * @param {Class} RowParser the row parser to use to parse the row
   * @param {array<object>} data The csv data
   * @return {ExternalResourcesCollection}
   */
  parseResources(RowParser, data) {
    const collection = new ExternalResourcesCollection([]);
    data.forEach((row, rowIndex) => {
      try {
        const externalResourceEntity = RowParser.parse(row, this.resourceTypesCollection)
        collection.push(externalResourceEntity);
      } catch (error) {
        this.importEntity.importResourcesErrors.push(new ImportError("Cannot parse resource", row, error));
      }
    });
    return collection;
  }

  /**
   * Extract the folders from the resources path
   * @param {ExternalResourcesCollection} externalResourcesCollection the collection of resources to external
   * @return {ExternalFoldersCollection}
   */
  parseFolders(externalResourcesCollection) {
    const collection = new ExternalFoldersCollection([]);
    for (let externalResourceEntity of externalResourcesCollection) {
      try {
        collection.pushFromPath(externalResourceEntity.folderParentPath);
      } catch(error) {
        this.handleParseFolderValidationError(error, externalResourceEntity);
      }
    }
    return collection;
  }

  /**
   * Handle resource folder parent path validation error.
   * Reference the error and move the resource at the root.
   * @param {Error} error The error
   * @param {ExternalResourceEntity} externalResourceEntity
   */
  handleParseFolderValidationError(error, externalResourceEntity) {
    const externalFolderDto = {path: externalResourceEntity.folderParentPath};
    this.importEntity.importFoldersErrors.push(new ImportError("Cannot parse folder", externalFolderDto, error));
    // Move the resource at the root.
    externalResourceEntity.folderParentPath = "";
  }

  /**
   * Create the external root folder based on the external reference and move all the content into it.
   * @param {ExternalFoldersCollection} externalFoldersCollection The collection of resources
   * @param {ExternalResourcesCollection} externalResourcesCollection The collection of folders
   */
  createAndChangeRootFolder(externalFoldersCollection, externalResourcesCollection) {
    const rootFolderEntity = new ExternalFolderEntity({name: this.importEntity.ref});
    externalFoldersCollection.changeRootPath(rootFolderEntity);
    externalResourcesCollection.changeRootPath(rootFolderEntity);
    externalFoldersCollection.push(rootFolderEntity);
  }
}

exports.ResourcesCsvImportParser = ResourcesCsvImportParser;
