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

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import FavoriteResourceController from "./favoriteResourceController";
import FavoriteResourceService from "../../service/favorite/favoriteResourceService";
import {defaultFavoriteDto} from "passbolt-styleguide/src/shared/models/entity/favorite/favoriteEntity.test.data";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import FavoriteEntity from "../../model/entity/favorite/favoriteEntity";

describe("FavoriteResourceController", () => {
  let controller;

  beforeEach(() => {
    const account = new AccountEntity(defaultAccountDto());
    const apiClientOptions = defaultApiClientOptions();
    controller = new FavoriteResourceController(null, null, apiClientOptions, account);
  });
  describe("FavoriteResourceController::exec", () => {
    it("Should call the addResourceToFavorite and emit a success message", async() => {
      expect.assertions(3);
      const resourceDto = defaultResourceDto();
      const favoriteDto = defaultFavoriteDto();
      const favorite = new FavoriteEntity(favoriteDto);
      jest.spyOn(FavoriteResourceService.prototype, "addResourceToFavorite").mockImplementationOnce(() => favorite);

      const result =  await controller.exec(resourceDto.id);

      expect(FavoriteResourceService.prototype.addResourceToFavorite).toHaveBeenCalledWith(resourceDto.id);
      expect(result).toBeInstanceOf(FavoriteEntity);
      expect(result.id).toBe(favoriteDto.id);
    });
  });
});
