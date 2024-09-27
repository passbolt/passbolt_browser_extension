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
import EntityV2 from "passbolt-styleguide/src/shared/models/entity/abstract/entityV2";
import ExternalFoldersCollection from "../folder/external/externalFoldersCollection";
import ExternalResourcesCollection from "../resource/external/externalResourcesCollection";
import {assertType} from "../../../utils/assertions";

const FORMAT_KDBX = "kdbx";
const FORMAT_KDBX_OTHERS = "kdbx-others";
const FORMAT_CSV_KDBX = "csv-kdbx";
const FORMAT_CSV_LASTPASS = "csv-lastpass";
const FORMAT_CSV_1PASSWORD = "csv-1password";
const FORMAT_CSV_CHROMIUM = "csv-chromium";
const FORMAT_CSV_BITWARDEN = "csv-bitwarden";
const FORMAT_CSV_MOZILLA = "csv-mozilla";
const FORMAT_CSV_SAFARI = "csv-safari";
const FORMAT_CSV_DASHLANE = "csv-dashlane";
const FORMAT_CSV_NORDPASS = "csv-nordpass";
const FORMAT_CSV_LOGMEONCE = "csv-logmeonce";

const SUPPORTED_FORMAT = [
  FORMAT_KDBX,
  FORMAT_KDBX_OTHERS,
  FORMAT_CSV_KDBX,
  FORMAT_CSV_LASTPASS,
  FORMAT_CSV_1PASSWORD,
  FORMAT_CSV_CHROMIUM,
  FORMAT_CSV_BITWARDEN,
  FORMAT_CSV_MOZILLA,
  FORMAT_CSV_SAFARI,
  FORMAT_CSV_DASHLANE,
  FORMAT_CSV_NORDPASS,
  FORMAT_CSV_LOGMEONCE
];

class ExportResourcesFileEntity extends EntityV2 {
  /**
   * @inheritDoc
   */
  constructor(dto, options = {}) {
    super(dto, options);
    /*
     * // @todo Refactor when a schema deep testing strategy is implemented.
     * $ if (exportResourcesFileDto.options) {
     *   EntitySchema.validate(
     *     ExportResourcesFileEntity.ENTITY_NAME,
     *     exportResourcesFileDto.options,
     *     ExportResourcesFileEntity.getSchema().properties.options
     *   );
     *   if (exportResourcesFileDto.options.credentials) {
     *     EntitySchema.validate(
     *       ExportResourcesFileEntity.ENTITY_NAME,
     *       exportResourcesFileDto.options.credentials,
     *       ExportResourcesFileEntity.getSchema().properties.options.properties.credentials
     *     );
     *   }
     * }
     */

    // Associations
    if (this._props.export_resources) {
      this._export_resources = new ExternalResourcesCollection(this._props.export_resources, {clone: false});
      delete this._props.export_resources;
    }
    if (this._props.export_folders) {
      this._export_folders = new ExternalFoldersCollection(this._props.export_folders, {clone: false});
      delete this._props.export_folders;
    }
  }

  /**
   * Get entity schema
   * @returns {Object} schema
   */
  static getSchema() {
    return {
      "type": "object",
      "required": [
        "format"
      ],
      "properties": {
        "format": {
          "type": "string",
          "enum": SUPPORTED_FORMAT
        },
        "resources_ids": {
          "type": "array",
          "nullable": true,
          "items": {
            "type": "string",
            "format": "uuid"
          }
        },
        "folders_ids": {
          "type": "array",
          "nullable": true,
          "items": {
            "type": "string",
            "format": "uuid"
          }
        },
        "export_resources": ExternalResourcesCollection.getSchema(),
        "export_folders": ExternalFoldersCollection.getSchema(),
        "options": {
          "type": "object",
          "required": [],
          "properties": {
            "credentials": {
              "type": "object",
              "required": [],
              "properties": {
                "password": {
                  "type": "string",
                  "nullable": true,
                },
                "keyfile": {
                  "type": "string",
                  "format": "x-base64",
                  "nullable": true,
                }
              }
            }
          }
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
   * Get export format
   * @returns {string}
   */
  get format() {
    return this._props.format;
  }

  /**
   * Get export folders ids
   * @returns {array<uuid>|null}
   */
  get foldersIds() {
    return this._props.folders_ids || null;
  }

  /**
   * Get export resources ids
   * @returns {array<uuid>|null}
   */
  get resourcesIds() {
    return this._props.resources_ids || null;
  }

  /**
   * Get export protecting password
   * @returns {string|null}
   */
  get password() {
    return this._props.options?.credentials?.password || null;
  }

  /**
   * Get export protecting keyfile
   * @returns {string|null}
   */
  get keyfile() {
    return this._props.options?.credentials?.keyfile || null;
  }

  /*
   * ==================================================
   * Calculated properties
   * ==================================================
   */

  /**
   * Get export file type
   * @returns {string}
   */
  get fileType() {
    return this.format.split('-')[0];
  }

  /*
   * ==================================================
   * Associated properties getters / setters
   * ==================================================
   */

  /**
   * Get the collection of resources to export
   * @returns {ExternalResourcesCollection}
   */
  get exportResources() {
    return this._export_resources || new ExternalResourcesCollection([]);
  }

  /**
   * Set export resources
   * @param {ExternalResourcesCollection} collection The collection of resources to export
   */
  set exportResources(collection) {
    assertType(collection, ExternalResourcesCollection);
    this._export_resources = collection;
  }

  /**
   * Get the collection of folders to export
   * @returns {ExternalFoldersCollection}
   */
  get exportFolders() {
    return this._export_folders || new ExternalFoldersCollection([]);
  }

  /**
   * Set export folders
   * @param {ExternalFoldersCollection} collection The collection of folders to export
   */
  set exportFolders(collection) {
    assertType(collection, ExternalFoldersCollection);
    this._export_folders = collection;
  }

  /*
   * ==================================================
   * Static properties getters
   * ==================================================
   */

  /**
   * ExportResourcesFileEntity.FORMAT_KDBX
   * @returns {string}
   */
  static get FORMAT_KDBX() {
    return FORMAT_KDBX;
  }

  /**
   * ExportResourcesFileEntity.FORMAT_KDBX_OTHERS
   * @returns {string}
   */
  static get FORMAT_KDBX_OTHERS() {
    return FORMAT_KDBX_OTHERS;
  }
}

export default ExportResourcesFileEntity;
