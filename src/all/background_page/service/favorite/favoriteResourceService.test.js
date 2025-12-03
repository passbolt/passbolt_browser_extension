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

import FavoriteResourceService from './favoriteResourceService';
import BuildApiClientOptionsService from '../account/buildApiClientOptionsService';
import AccountEntity from '../../model/entity/account/accountEntity';
import {defaultAccountDto} from '../../model/entity/account/accountEntity.test.data';
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data.js";
import {defaultFavoriteDto} from "passbolt-styleguide/src/shared/models/entity/favorite/favoriteEntity.test.data.js";
import ResourceLocalStorage from '../local_storage/resourceLocalStorage';
import FavoriteEntity from '../../model/entity/favorite/favoriteEntity';
import ResourceEntity from '../../model/entity/resource/resourceEntity';

describe('FavoriteResourceService', () => {
  let favoriteResourceService;
  const account = new AccountEntity(defaultAccountDto());
  const apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);

  beforeEach(() => {
    favoriteResourceService = new FavoriteResourceService(apiClientOptions, account);
    jest.clearAllMocks();
  });

  describe('::addResourceToFavorite', () => {
    it('should add a resource to favorites and update locally', async() => {
      expect.assertions(4);
      const resourceDto = defaultResourceDto();
      const favoriteDto = defaultFavoriteDto({foreign_key: resourceDto.id});

      // Mock the API service create method
      jest.spyOn(favoriteResourceService.favoriteApiService, 'create')
        .mockResolvedValue(favoriteDto);

      // Mock the private updateFavoriteLocally method
      jest.spyOn(favoriteResourceService, 'updateFavoriteLocally')
        .mockResolvedValue();

      const result = await favoriteResourceService.addResourceToFavorite(resourceDto.id);

      expect(favoriteResourceService.favoriteApiService.create).toHaveBeenCalledWith('Resource', resourceDto.id);
      expect(favoriteResourceService.updateFavoriteLocally).toHaveBeenCalledWith(
        resourceDto.id,
        expect.any(FavoriteEntity)
      );
      expect(result).toBeInstanceOf(FavoriteEntity);
      expect(result.id).toBe(favoriteDto.id);
    });
  });

  describe('::removeResourceFromFavorite', () => {
    it('should remove a resource from favorites and update locally', async() => {
      expect.assertions(3);
      const resourceDto = defaultResourceDto();
      const favoriteDto = defaultFavoriteDto({foreign_key: resourceDto.id});
      const resourceWithFavorite = {
        ...resourceDto,
        favorite: favoriteDto
      };

      // Mock resourceModel.getById to return a resource with favorite
      jest.spyOn(favoriteResourceService.resourceModel, 'getById')
        .mockResolvedValue(new ResourceEntity(resourceWithFavorite));

      // Mock the API service delete method
      jest.spyOn(favoriteResourceService.favoriteApiService, 'delete')
        .mockResolvedValue();

      // Mock the private updateFavoriteLocally method
      jest.spyOn(favoriteResourceService, 'updateFavoriteLocally')
        .mockResolvedValue();

      await favoriteResourceService.removeResourceFromFavorite(resourceDto.id);

      expect(favoriteResourceService.favoriteApiService.delete).toHaveBeenCalledWith(favoriteDto.id);
      expect(favoriteResourceService.updateFavoriteLocally).toHaveBeenCalledWith(resourceDto.id, null);
      expect(favoriteResourceService.resourceModel.getById).toHaveBeenCalledWith(resourceDto.id);
    });

    it('should not call delete if resource has no favorite', async() => {
      expect.assertions(2);
      const resourceDto = defaultResourceDto();

      // Mock resourceModel.getById to return a resource without favorite
      jest.spyOn(favoriteResourceService.resourceModel, 'getById')
        .mockResolvedValue(new ResourceEntity(resourceDto));

      jest.spyOn(favoriteResourceService.favoriteApiService, 'delete');

      await favoriteResourceService.removeResourceFromFavorite(resourceDto.id);

      expect(favoriteResourceService.favoriteApiService.delete).not.toHaveBeenCalled();
      expect(favoriteResourceService.resourceModel.getById).toHaveBeenCalledWith(resourceDto.id);
    });
  });

  describe('::updateFavoriteLocally', () => {
    it('should update resource favorite in local storage', async() => {
      expect.assertions(2);
      const resourceDto = defaultResourceDto();
      const favoriteDto = defaultFavoriteDto({foreign_key: resourceDto.id});
      const favoriteEntity = new FavoriteEntity(favoriteDto);

      jest.spyOn(ResourceLocalStorage, 'getResourceById')
        .mockResolvedValue(resourceDto);
      jest.spyOn(ResourceLocalStorage, 'updateResource')
        .mockResolvedValue();

      await favoriteResourceService.updateFavoriteLocally(resourceDto.id, favoriteEntity);

      expect(ResourceLocalStorage.getResourceById).toHaveBeenCalledWith(resourceDto.id);
      expect(ResourceLocalStorage.updateResource).toHaveBeenCalled();
    });

    it('should throw error if resourceId is not a valid UUID', async() => {
      expect.assertions(1);

      await expect(favoriteResourceService.updateFavoriteLocally('invalid-id', null))
        .rejects.toThrow();
    });

    it('should throw error if favoriteEntity is not a FavoriteEntity instance', async() => {
      expect.assertions(1);
      const resourceDto = defaultResourceDto();
      const invalidFavorite = {id: 'fav-123', name: 'My Favorite'}; // Plain object instead of FavoriteEntity

      jest.spyOn(ResourceLocalStorage, 'getResourceById')
        .mockResolvedValue(resourceDto);

      await expect(favoriteResourceService.updateFavoriteLocally(resourceDto.id, invalidFavorite))
        .rejects.toThrow();
    });
  });
});
