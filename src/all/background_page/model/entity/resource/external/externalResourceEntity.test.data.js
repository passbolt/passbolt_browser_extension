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

import {v4 as uuidv4} from "uuid";
import {defaultResourcesSecretsDtos} from "../../secret/resource/resourceSecretsCollection.test.data";
import {defaultTotpDto} from "../../totp/totpDto.test.data";

export const minimalExternalResourceDto = (data = {}) => ({
  name: "Minimal External Resource",
  secret_clear: "this is a secret",
  ...data,
});

export const defaultExternalResourceDto = (data = {}) => {
  const secretCollection = defaultResourcesSecretsDtos();
  const resourceid = secretCollection[0].resource_id;
  return {
    id: resourceid,
    name: "external resource dto",
    username: "ada@passbolt.com",
    uri: "https://passbolt.local",
    description: "This is the description of the resource",
    secrets: secretCollection,
    folder_parent_id: uuidv4(),
    resource_type_id: uuidv4(),
    secret_clear: "This is a secret",
    totp: defaultTotpDto(),
    folder_parent_path: "private/data",
    expired: null,
    ...data,
  };
};

export const defaultExternalResourceImportDto = (data = {}) => {
  const secretCollection = defaultResourcesSecretsDtos(1);
  delete secretCollection[0].resource_id;

  return {
    name: "external resource dto",
    username: "ada@passbolt.com",
    uri: "https://passbolt.local",
    description: "This is the description of the resource",
    secrets: secretCollection,
    folder_parent_id: uuidv4(),
    resource_type_id: uuidv4(),
    totp: defaultTotpDto(),
    folder_parent_path: "private/data",
    expired: null,
    secret_clear: "",
    ...data,
  };
};


export const defaultExternalResourceImportMinimalDto = (data = {}) => {
  const defaultData = minimalExternalResourceDto({
    id: uuidv4(),
    name: "",
    secret_clear: "",
    username: "",
    uri: "",
    description: "",
    resource_type_id: uuidv4(),
    folder_parent_path: "private/data",
    ...data
  });

  /**
   * Timestamp during test are unstable we check the path after timestamp
   */
  if (data.folder_parent_path_expected) {
    defaultData.folder_parent_path = `${data.folder_parent_path.split('/')[0]}${data.folder_parent_path_expected}`;
  }

  return defaultData;
};
