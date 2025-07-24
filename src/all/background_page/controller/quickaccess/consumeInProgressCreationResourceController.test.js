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
 * @since         5.4.0
 */
import ConsumeInProgressCreationResourceController from "./consumeInProgressCreationResourceController";
import ResourceInProgressCacheService from "../../service/cache/resourceInProgressCache.service";
import ExternalResourceEntity from "../../model/entity/resource/external/externalResourceEntity";
import {defaultExternalResourceDto} from "../../model/entity/resource/external/externalResourceEntity.test.data";

describe("ConsumeInProgressCreationResourceController", () => {
  describe("::exec", () => {
    it("should return the resource in cache and clear the cache", async() => {
      expect.assertions(3);

      const fakeResource = new ExternalResourceEntity(defaultExternalResourceDto());
      jest.spyOn(ResourceInProgressCacheService, "consume");

      const controller = new ConsumeInProgressCreationResourceController();

      let result = await controller.exec();

      expect(result).toEqual({});

      await ResourceInProgressCacheService.set(fakeResource, Number.MAX_SAFE_INTEGER);
      result = await controller.exec();
      expect(result).toEqual(fakeResource.toDto());

      expect(ResourceInProgressCacheService.consume).toHaveBeenCalled();
    });
  });
});
