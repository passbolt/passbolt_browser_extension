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

import ResourceSecretRevisionsCollection from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultResourceSecretRevisionsDtos} from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";
import FindSecretRevisionsService from "./findSecretRevisionsService";
import {v4 as uuidv4} from "uuid";

describe("FindSecretRevisionsService", () => {
  describe("::findAllByResourceId", () => {
    it("should call the API and returns a collection of secret revision", async() => {
      expect.assertions(3);

      const contains = {
        creator: true,
        owner_accessors: true,
        secret: true,
        "creator.profile": true,
        "owner_accessors.profile": true,
      };
      const resource_id = uuidv4();
      const collectionDto = defaultResourceSecretRevisionsDtos({resource_id});
      const apiServiceResponse = new PassboltResponseEntity({header: {}, body: collectionDto});

      const service = new FindSecretRevisionsService(defaultApiClientOptions());
      jest.spyOn(service.resourceSecretRevisionApiService, "findAllByResourceId").mockReturnValue(apiServiceResponse);

      const result = await service.findAllByResourceId(resource_id, contains);
      expect(service.resourceSecretRevisionApiService.findAllByResourceId).toHaveBeenCalledTimes(1);
      expect(service.resourceSecretRevisionApiService.findAllByResourceId).toHaveBeenCalledWith(resource_id, contains);
      expect(result).toStrictEqual(new ResourceSecretRevisionsCollection(collectionDto));
    });

    it("should work even if there are no result", async() => {
      expect.assertions(1);

      const contains = {
        creator: true,
        owner_accessors: true,
        secret: true,
        "creator.profile": true,
        "owner_accessors.profile": true,
      };
      const resource_id = uuidv4();
      const apiServiceResponse = new PassboltResponseEntity({header: {}, body: []});

      const service = new FindSecretRevisionsService(defaultApiClientOptions());
      jest.spyOn(service.resourceSecretRevisionApiService, "findAllByResourceId").mockReturnValue(apiServiceResponse);

      const result = await service.findAllByResourceId(resource_id, contains);
      expect(result).toStrictEqual(new ResourceSecretRevisionsCollection([]));
    });

    it("should let error throw from the API", async() => {
      expect.assertions(1);

      const service = new FindSecretRevisionsService(defaultApiClientOptions());

      jest.spyOn(service.resourceSecretRevisionApiService, "findAllByResourceId").mockImplementation(() => { throw new Error("Something went wrong!"); });

      await expect(() => service.findAllByResourceId(uuidv4())).rejects.toThrowError();
    });

    it("should throw an error if the API respond with invalid data", async() => {
      expect.assertions(1);

      const collectionDto = defaultResourceSecretRevisionsDtos(); // all resource_id are different
      const apiServiceResponse = new PassboltResponseEntity({header: {}, body: collectionDto});
      const service = new FindSecretRevisionsService(defaultApiClientOptions());

      jest.spyOn(service.resourceSecretRevisionApiService, "findAllByResourceId").mockReturnValue(apiServiceResponse);

      await expect(() => service.findAllByResourceId(uuidv4())).rejects.toThrowError(TypeError);
    });

    it("should assert its parameters", async() => {
      expect.assertions(5);

      const service = new FindSecretRevisionsService(defaultApiClientOptions());
      await expect(() => service.findAllByResourceId(42)).rejects.toThrowError();
      await expect(() => service.findAllByResourceId(null)).rejects.toThrowError();
      await expect(() => service.findAllByResourceId("wrong string")).rejects.toThrowError();
      await expect(() => service.findAllByResourceId(uuidv4(), 42)).rejects.toThrowError();
      await expect(() => service.findAllByResourceId(uuidv4())).rejects.toThrowError();
    });
  });
});
