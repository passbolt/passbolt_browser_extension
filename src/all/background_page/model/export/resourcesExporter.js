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
import ResourcesCsvExporter from "./resources/resourcesCsvExporter";
import ResourcesKdbxExporter from "./resources/resourcesKdbxExporter";
import FileTypeError from "../../error/fileTypeError";

class ResourcesExporter {
  /**
   * Parse external
   * @param {ExportResourcesFileEntity} exportEntity The export entity
   * @returns {Promise<void>}
   */
  export(exportEntity) {
    const importer = this.getExporter(exportEntity);
    return importer.export();
  }

  /**
   * Get the exporter.
   * @param {ExportResourcesFileEntity} exportEntity The export entity
   * @returns {ResourcesCsvExporter|ResourcesKdbxExporter}
   * @throws {FileTypeError} If the export type is not supported
   */
  getExporter(exportEntity) {
    switch (exportEntity.fileType) {
      case "csv":
        return new ResourcesCsvExporter(exportEntity);
      case "kdbx":
        return new ResourcesKdbxExporter(exportEntity);
      default:
        throw new FileTypeError(`The format ${exportEntity.format} is not supported.`);
    }
  }
}

export default ResourcesExporter;
