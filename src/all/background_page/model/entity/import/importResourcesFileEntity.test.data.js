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

const defaultCsvData = [
  "Title,Username,URL,Password,Notes,Group",
  "Password 1,Username 1,https://url1.com,Password 1,Description 1,",
  "Password 2,Username 2,https://url1.com,Password 2,Description 2, Folder",
].join("\n");

export const defaultImportResourceFileDto = (data = {}) => ({
  ref: "import-ref",
  file_type: "csv",
  file: btoa(defaultCsvData),
  ...data,
});

export const importResourceFileWithAllOptionsDto = (data = {}) => {
  const options = defaultImportResourceFileOptionsDto(data.options);
  delete(data?.options);

  return defaultImportResourceFileDto({
    options,
    ...data,
  });
};

export const defaultImportResourceFileOptionsDto = (data = {}) => ({
  folders: true,
  tags: true,
  credentials: {
    password: "",
    keyfile: "",
  },
  ...data
});
