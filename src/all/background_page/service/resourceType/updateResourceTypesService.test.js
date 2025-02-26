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
 * @since         4.12.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import UpdateResourceTypesService from "./updateResourceTypesService";
import {v4 as uuidV4} from "uuid";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UpdateResourceTypesService", () => {
  let apiClientOptions;

  beforeEach(async() => {
    apiClientOptions = defaultApiClientOptions();
  });

  describe("::delete", () => {
    it("should assert its parameters", async() => {
      expect.assertions(1);

      const service = new UpdateResourceTypesService(apiClientOptions);
      expect(() => service.delete("test")).rejects.toThrow("The given parameter is not a valid UUID");
    });

    it("should call for the right service with the right arguments.", async() => {
      expect.assertions(2);

      const expectedId = uuidV4();
      const service = new UpdateResourceTypesService(apiClientOptions);
      jest.spyOn(service.resourceTypeService, "delete").mockImplementation(() => {});

      await service.delete(expectedId);

      expect(service.resourceTypeService.delete).toHaveBeenCalledTimes(1);
      expect(service.resourceTypeService.delete).toHaveBeenCalledWith(expectedId);
    });
  });

  describe("::undelete", () => {
    it("should assert its parameters", async() => {
      expect.assertions(1);

      const service = new UpdateResourceTypesService(apiClientOptions);
      expect(() => service.undelete("test")).rejects.toThrow("The given parameter is not a valid UUID");
    });

    it("should call for the right service with the right arguments.", async() => {
      expect.assertions(2);

      const expectedId = uuidV4();
      const service = new UpdateResourceTypesService(apiClientOptions);
      jest.spyOn(service.resourceTypeService, "undelete").mockImplementation(() => {});

      await service.undelete(expectedId);

      expect(service.resourceTypeService.undelete).toHaveBeenCalledTimes(1);
      expect(service.resourceTypeService.undelete).toHaveBeenCalledWith(expectedId);
    });
  });


  describe("::deleteAll", () => {
    it("should assert its parameters", async() => {
      expect.assertions(1);

      const service = new UpdateResourceTypesService(apiClientOptions);
      expect(() => service.deleteAll("test")).rejects.toThrow("The resourceTypesCollection parameter should be a valid ResourceTypesCollection");
    });

    it("should call for the right service with the right arguments.", async() => {
      const resourceTypesDto = resourceTypesCollectionDto();

      expect.assertions(1 + resourceTypesDto.length);

      const resourcesTypesCollection = new ResourceTypesCollection(resourceTypesDto);
      const service = new UpdateResourceTypesService(apiClientOptions);

      jest.spyOn(service.resourceTypeService, "delete").mockImplementation(() => {});

      await service.deleteAll(resourcesTypesCollection);

      expect(service.resourceTypeService.delete).toHaveBeenCalledTimes(resourceTypesDto.length);
      for (let i = 0; i < resourceTypesDto.length; i++) {
        expect(service.resourceTypeService.delete).toHaveBeenCalledWith(resourceTypesDto[i].id);
      }
    });
  });

  describe("::undeleteAll", () => {
    it("should assert its parameters", async() => {
      expect.assertions(1);

      const service = new UpdateResourceTypesService(apiClientOptions);
      expect(() => service.undeleteAll("test")).rejects.toThrow("The resourceTypesCollection parameter should be a valid ResourceTypesCollection");
    });

    it("should call for the right service with the right arguments.", async() => {
      const resourceTypesDto = resourceTypesCollectionDto();

      expect.assertions(1 + resourceTypesDto.length);

      const resourcesTypesCollection = new ResourceTypesCollection(resourceTypesDto);
      const service = new UpdateResourceTypesService(apiClientOptions);

      jest.spyOn(service.resourceTypeService, "undelete").mockImplementation(() => {});

      await service.undeleteAll(resourcesTypesCollection);

      expect(service.resourceTypeService.undelete).toHaveBeenCalledTimes(resourceTypesDto.length);
      for (let i = 0; i < resourceTypesDto.length; i++) {
        expect(service.resourceTypeService.undelete).toHaveBeenCalledWith(resourceTypesDto[i].id);
      }
    });
  });

  describe("::updateAllDeletedStatus", () => {
    it("should assert its parameters", async() => {
      expect.assertions(1);

      const service = new UpdateResourceTypesService(apiClientOptions);
      expect(() => service.updateAllDeletedStatus("test")).rejects.toThrow("The resourceTypesCollection parameter should be a valid ResourceTypesCollection");
    });

    it("should call for the right service with the right arguments.", async() => {
      expect.assertions(10);
      const resourceTypesDto = resourceTypesCollectionDto();
      for (let i = 0; i < resourceTypesDto.length; i += 2) {
        resourceTypesDto[i].deleted = "2025-02-24T09:00:00+00:00";
      }

      const resourcesTypesCollection = new ResourceTypesCollection(resourceTypesDto);

      const service = new UpdateResourceTypesService(apiClientOptions);
      jest.spyOn(service.resourceTypeService, "delete").mockImplementation(() => {});
      jest.spyOn(service.resourceTypeService, "undelete").mockImplementation(() => {});

      await service.updateAllDeletedStatus(resourcesTypesCollection);

      expect(service.resourceTypeService.delete).toHaveBeenCalledTimes(4);
      expect(service.resourceTypeService.undelete).toHaveBeenCalledTimes(4);

      expect(service.resourceTypeService.delete).toHaveBeenCalledWith(resourceTypesDto[0].id);
      expect(service.resourceTypeService.undelete).toHaveBeenCalledWith(resourceTypesDto[1].id);
      expect(service.resourceTypeService.delete).toHaveBeenCalledWith(resourceTypesDto[2].id);
      expect(service.resourceTypeService.undelete).toHaveBeenCalledWith(resourceTypesDto[3].id);
      expect(service.resourceTypeService.delete).toHaveBeenCalledWith(resourceTypesDto[4].id);
      expect(service.resourceTypeService.undelete).toHaveBeenCalledWith(resourceTypesDto[5].id);
      expect(service.resourceTypeService.delete).toHaveBeenCalledWith(resourceTypesDto[6].id);
      expect(service.resourceTypeService.undelete).toHaveBeenCalledWith(resourceTypesDto[7].id);
    });
  });
});
