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
 * @since         5.7.0
 */

import FavoriteEntity from "../../model/entity/favorite/favoriteEntity";
import ResourceEntity from "../../model/entity/resource/resourceEntity";
import ResourceModel from "../../model/resource/resourceModel";
import FavoriteApiService from "../../service/api/favorite/favoriteApiService";
import {assertType, assertUuid} from "../../utils/assertions";
import ResourceLocalStorage from "../local_storage/resourceLocalStorage";

export default class FavoriteResourceService {
  /**
   * Constructor
   *
   * @param {ApiClientOptions} apiClientOptions
   * @param {AccountEntity} account the user account
   * @public
   */
  constructor(apiClientOptions, account) {
    this.favoriteApiService = new FavoriteApiService(apiClientOptions);
    this.resourceModel = new ResourceModel(apiClientOptions, account);
  }

  /**
   * Create a favorite using Passbolt API
   *
   * @param {string} resourceId uuid
   * @returns {Promise<FavoriteEntity>}
   */
  async addResourceToFavorite(resourceId) {
    assertUuid(resourceId);
    const foreignKey = 'Resource';
    const favoriteDto = await this.favoriteApiService.create(foreignKey, resourceId);
    const favoriteEntity = new FavoriteEntity(favoriteDto);
    await this.updateFavoriteLocally(resourceId, favoriteEntity);
    return favoriteEntity;
  }

  /**
   * Delete a favorite using Passbolt API
   *
   * @param {string} resourceId uuid
   * @returns {Promise<void>}
   */
  async removeResourceFromFavorite(resourceId) {
    assertUuid(resourceId);
    const resourceEntity = await this.resourceModel.getById(resourceId);
    if (!resourceEntity.favorite) {
      return; // already deleted or not finished added...
    }
    await this.favoriteApiService.delete(resourceEntity.favorite.id);
    await this.updateFavoriteLocally(resourceId, null);
  }

  /**
   * Update a favorite association of a resource in local storage
   * Doesn't udpate the favorite remotely
   *
   * @param {string} resourceId
   * @param {FavoriteEntity|null} favoriteEntity or null
   * @return {Promise<void>}
   * @private
   */
  async updateFavoriteLocally(resourceId, favoriteEntity) {
    assertUuid(resourceId);
    assertType(favoriteEntity, FavoriteEntity);
    const resourceDto = await ResourceLocalStorage.getResourceById(resourceId);
    const resourceEntity = new ResourceEntity(resourceDto);
    resourceEntity.favorite = favoriteEntity;
    await ResourceLocalStorage.updateResource(resourceEntity);
  }
}
