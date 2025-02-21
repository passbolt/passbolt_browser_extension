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

import {enableFetchMocks} from "jest-fetch-mock";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import {resourceTypesCollectionDto, resourceTypesV4CollectionDto, resourceTypesV5CollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourceTypeService from "./resourceTypeService";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {defaultApiClientOptions} from 'passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data';
import {v4 as uuidv4} from "uuid";

describe("ResourceType service", () => {
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
  });

  describe('::findAll', () => {
    it("Should find the resources type on the API", async() => {
      expect.assertions(1);
      const expectedDto = resourceTypesCollectionDto();

      fetch.doMockOnceIf(/resource-types/, () => mockApiResponse(expectedDto));

      const service = new ResourceTypeService(defaultApiClientOptions());
      const resultDto = await service.findAll();

      expect(resultDto).toStrictEqual(expectedDto);
    });
  });

  describe('::findByDeletedAndNonDeleted', () => {
    it("Should find the resources type on the API", async() => {
      expect.assertions(5);

      const expectedAvailableResourceTypesDto = resourceTypesV4CollectionDto();
      const expectedDeletedResourceTypesDto = resourceTypesV5CollectionDto();

      fetch.doMockIf(/resource-types/, async req => {
        const url = new URL(req.url);
        const data = url.searchParams.get('filter[is-deleted]')
          ? expectedDeletedResourceTypesDto
          : expectedAvailableResourceTypesDto;
        return mockApiResponse(data);
      });

      const service = new ResourceTypeService(defaultApiClientOptions());

      jest.spyOn(service, "findAll");

      const resourceTypesCollection = await service.findAllByDeletedAndNonDeleted();

      expect(resourceTypesCollection.length).toStrictEqual(expectedDeletedResourceTypesDto.length + expectedAvailableResourceTypesDto.length);
      expect(resourceTypesCollection).toStrictEqual(new ResourceTypesCollection([...expectedAvailableResourceTypesDto, ...expectedDeletedResourceTypesDto]));
      expect(service.findAll).toHaveBeenCalledTimes(2);
      expect(service.findAll).toHaveBeenCalledWith({resources_count: true}, {['is-deleted']: true});
      expect(service.findAll).toHaveBeenCalledWith({resources_count: true});
    });
  });

  describe('::undelete', () => {
    it("Should update the resource given its id", async() => {
      expect.assertions(2);

      const expectedId = uuidv4();

      let url, body;
      fetch.doMockIf(/resource-types/, async req => {
        url = new URL(req.url);
        body = JSON.parse(await req.text());
        return mockApiResponse("");
      });

      const service = new ResourceTypeService(defaultApiClientOptions());
      await service.undelete(expectedId);

      expect(url.toString()).toContain(expectedId);
      expect(body).toStrictEqual({deleted: null});
    });
  });
});
