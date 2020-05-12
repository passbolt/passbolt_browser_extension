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
const {Keyring} = require('../../model/keyring');
const {Share} = require('../../model/share');
const {FolderModel} = require('../../model/folder/folderModel');
const {ResourceModel} = require('../../model/resource/resourceModel');
const {ResourceEntity} = require('../../model/entity/resource/resourceEntity');
const {PermissionChangesCollection} = require('../../model/entity/permission/permissionChangesCollection');
const {PermissionsCollection}  = require("../../model/entity/permission/permissionsCollection");

const passphraseController = require('../passphrase/passphraseController');
const progressController = require('../progress/progressController');

class MoveFolderController {
  /**
   * MoveFolderController constructor
   *
   * @param {Worker} worker
   * @param {string} requestId
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, requestId, clientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.folderModel = new FolderModel(clientOptions);
    this.resourceModel = new ResourceModel(clientOptions);
    this.keyring = new Keyring();
    this.crypto = new Crypto();
  }

  /**
   * Move content.
   * @param {array} folderId: The resources ids to move
   * @param {(string|null)} folderId:  The destination folder
   */
  async main(folderId, destinationFolderId) {
    this.folderId = folderId;
    this.destinationFolderId = destinationFolderId;
    throw new Error('Not implemented');
  }
}

exports.MoveFolderController = MoveFolderController;
