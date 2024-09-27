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
import {defaultExternalResourceImportDto, defaultExternalResourceDto} from "./externalResourceEntity.test.data";

export const defaultExternalResourceCollectionDto = (data = {}) => ([
  defaultExternalResourceImportDto(data),
  defaultExternalResourceImportDto(data),
  defaultExternalResourceImportDto(data),
  defaultExternalResourceImportDto(data),
]);

export const externalResourceCollectionWithIdsDto = (data = {}) => ([
  defaultExternalResourceDto(data),
  defaultExternalResourceDto(data),
  defaultExternalResourceDto(data),
  defaultExternalResourceDto(data),
]);

export const externalResourceCollectionWithoutIdsDto = (data = {}) => {
  const externalResourceCollectionDto = defaultExternalResourceCollectionDto(data);
  for (let i = 0; i < externalResourceCollectionDto.length; i++) {
    delete externalResourceCollectionDto[i].id;
  }
  return externalResourceCollectionDto;
};

/**
 * Build external resources collection dtos.
 * @param {number} [resourcesCount=10] The number of resources.
 * @param {Object} [data] override data properties
 * @returns {object}
 */
export const buildDefineNumberOfExternalResourcesCollectionDto = (resourcesCount = 10, data = {}) => {
  const dtos = [];
  for (let i = 0; i < resourcesCount; i++) {
    const dto = defaultExternalResourceDto(data);
    dtos.push(dto);
  }
  return dtos;
};
