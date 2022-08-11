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
import GroupsCollection from "../model/entity/group/groupsCollection";
import ResourcesCollection from "../model/entity/resource/resourcesCollection";
import FoldersCollection from "../model/entity/folder/foldersCollection";
import './error.js';

class DeleteDryRunError extends Error {
  /**
   *
   * @param message
   * @param {object} errors details
   */
  constructor(message, errors) {
    super(message);
    this.name = 'DeleteDryRunError';
    this.errors = {};

    /*
     * validate errors
     * Build & validate associated objects
     */
    if (errors.groups && errors.groups.sole_manager) {
      this.errors.groups = {
        sole_manager: new GroupsCollection(errors.groups.sole_manager)
      };
    }
    if (errors.resources && errors.resources.sole_owner) {
      this.errors.resources = {
        sole_owner: new ResourcesCollection(errors.resources.sole_owner)
      };
    }
    if (errors.folders && errors.folders.sole_owner) {
      this.errors.folders = {
        sole_owner: new FoldersCollection(errors.folders.sole_owner)
      };
    }

    // There should be at least some errors
    if (!this.errors.folders && !this.errors.resources && !this.errors.groups) {
      console.error(this);
      throw new TypeError('Invalid user deletion error. There should be at least some error details.');
    }
  }

  toJSON() {
    const result = super.toJSON();
    result.errors = {};

    if (this.errors.groups && this.errors.groups.sole_manager) {
      result.errors.groups = {
        sole_manager: this.errors.groups.sole_manager.toJSON()
      };
    }
    if (this.errors.resources && this.errors.resources.sole_owner) {
      result.errors.resources = {
        sole_owner: this.errors.resources.sole_owner.toJSON()
      };
    }
    if (this.errors.folders && this.errors.folders.sole_owner) {
      result.errors.folders = {
        sole_owner: this.errors.folders.sole_owner.toJSON()
      };
    }

    return result;
  }
}

export default DeleteDryRunError;
