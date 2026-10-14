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
 * @since         5.13.0
 */
import { v4 as uuidv4 } from "uuid";
import FolderEntity from "../../model/entity/folder/folderEntity";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import { defaultFolderDto } from "passbolt-styleguide/src/shared/models/entity/folder/folderEntity.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";

/**
 * Build a FolderEntity whose ACL is the given `permissions` list.
 * Each permission's `aco_foreign_key` is auto-bound to the folder id.
 */
export const buildFolder = (permissions) => {
  const id = uuidv4();
  const bound = permissions.map((p) => ({ ...p, aco_foreign_key: id }));
  return new FolderEntity(defaultFolderDto({ id, permission: bound[0], permissions: bound }));
};

/**
 * Build a ResourceEntity whose ACL is the given `permissions` list.
 * Each permission's `aco_foreign_key` is auto-bound to the resource id.
 */
export const buildResource = (permissions) => {
  const id = uuidv4();
  const bound = permissions.map((p) => ({ ...p, aco_foreign_key: id }));
  return new ResourceEntity(defaultResourceDto({ id, permission: bound[0], permissions: bound }));
};
