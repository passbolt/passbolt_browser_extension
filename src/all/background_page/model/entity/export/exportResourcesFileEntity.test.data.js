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
 * @since         4.8.0
 */

import {defaultExternalResourceDto} from "../resource/external/externalResourceEntity.test.data";
import {defaultExternalFolderDto} from "../folder/external/externalFolderEntity.test.data";

export const defaultKdbxExportResourceFileDto = (data = {}) => ({
  format: "kdbx",
  resources_ids: [],
  folders_ids: [],
  export_resources: [defaultExternalResourceDto()],
  export_folders: [defaultExternalFolderDto()],
  options: defaultPasswordCredentialOptions(),
  ...data,
});

export const kdbxWithKeyExportResourceFileDto = (data = {}) => ({
  format: "kdbx",
  resources_ids: [],
  folders_ids: [],
  export_resources: [defaultExternalResourceDto()],
  export_folders: [defaultExternalFolderDto()],
  options: defaultKeyFileCredentialOptions(),
  ...data,
});

export const csvExportResourceFileDto = (data = {}) => ({
  format: "kdbx-csv",
  resources_ids: [],
  folders_ids: [],
  export_resources: [defaultExternalResourceDto()],
  export_folders: [defaultExternalFolderDto()],
  ...data,
});

export const defaultEmptyOptions = (data = {}) => ({
  ...data,
});

export const defaultPasswordCredentialOptions = (data = {}) => defaultEmptyOptions({
  credentials: {
    password: "1234",
    keyfile: null,
  },
  ...data
});

export const defaultKeyFileCredentialOptions = (data = {}) => defaultEmptyOptions({
  credentials: {
    password: null,
    keyfile: "test==",
  },
  ...data
});
