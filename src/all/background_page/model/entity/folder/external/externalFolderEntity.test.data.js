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
 * @since         4.10.0
 */
import {v4 as uuid} from "uuid";

export const defaultExternalFolderDto = (data = {}) => ({
  id: uuid(),
  name: "external folder",
  folder_parent_id: uuid(),
  folder_parent_path: "Root",
  ...data,
});

export const minimalExternalFolderDto = (data = {}) => ({
  name: "Minimal External Folder",
  ...data,
});
