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
import ExternalFoldersCollection from "../../entity/folder/external/externalFoldersCollection";
import ExternalFolderEntity from "../../entity/folder/external/externalFolderEntity";
import CsvKdbxRowParser from "./csvRowParser/csvKdbxRowParser";
import Csv1PasswordRowParser from "./csvRowParser/csv1PasswordRowParser";
import CsvLastPassRowParser from "./csvRowParser/csvLastPassRowParser";
import ExternalResourcesCollection from "../../entity/resource/external/externalResourcesCollection";
import FileFormatError from "../../../error/fileFormatError";
import BinaryConvert from "../../../utils/format/binaryConvert";
import ImportError from "../../../error/importError";
import PapaParse from "papaparse";
import CsvChromiumRowParser from "./csvRowParser/csvChromiumRowParser";
import CsvBitWardenRowParser from "./csvRowParser/csvBitWardenRowParser";
import CsvSafariRowParser from "./csvRowParser/csvSafariRowParser";
import CsvDashlaneRowParser from "./csvRowParser/csvDashlaneRowParser";
import CsvMozillaPlatformRowParser from "./csvRowParser/csvMozillaPlatformRowParser";
import CsvNordpassRowParser from "./csvRowParser/csvNordpassRowParser";
import CsvLogMeOnceRowParser from "./csvRowParser/csvLogMeOnceRowParser";

/**
 * Register of csv row parsers
 * @type {array<Class>}
 */
const register = [
  Csv1PasswordRowParser,
  CsvKdbxRowParser,
  CsvLastPassRowParser,
  CsvChromiumRowParser,
  CsvBitWardenRowParser,
  CsvSafariRowParser,
  CsvDashlaneRowParser,
  CsvMozillaPlatformRowParser,
  CsvNordpassRowParser,
  CsvLogMeOnceRowParser
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
    const {data, fields} = this.readCsv();
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
    const {data, meta: {fields}} = PapaParse.parse(csv, {header: true, skipEmptyLines: true});
    // For now, no papaparse controlled errors are a blocking the import process
    return {data: data, fields: fields};
  }

  /**
   * Get the csv row parser.
   * @param {array} csvFields The csv header fields name
   * @returns {Class|null} Return the row parser call or null if no match
   */
  getRowParser(csvFields) {
    let selectedRowParser = null;
    let selectedRowParserScore = 0;

    for (const RowParser of register) {
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
    data.forEach(row => {
      try {
        const externalResourceEntity = RowParser.parse(row, this.resourceTypesCollection);
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
    for (const externalResourceEntity of externalResourcesCollection) {
      try {
        collection.pushFromPath(externalResourceEntity.folderParentPath);
      } catch (error) {
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

export default ResourcesCsvImportParser;
