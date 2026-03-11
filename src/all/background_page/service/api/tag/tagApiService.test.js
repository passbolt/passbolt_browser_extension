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
 * @since         6.0.0
 */

import { enableFetchMocks } from "jest-fetch-mock";

import PassboltBadResponseError from "passbolt-styleguide/src/shared/lib/Error/PassboltBadResponseError";
import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultTagDto, sharedTagDto } from "passbolt-styleguide/src/shared/models/entity/tag/tagEntity.test.data";
import { defaultResourceDto } from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import PassboltResponseEntity from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity";

import TagApiService, { TAG_API_SERVICE_RESOURCE_NAME } from "./tagApiService";
import { mockApiResponse } from "../../../../../../test/mocks/mockApiResponse";
import TagsCollection from "../../../model/entity/tag/tagsCollection";
import ResourceEntity from "../../../model/entity/resource/resourceEntity";
import TagEntity from "../../../model/entity/tag/tagEntity";

describe("TagApiService", () => {
  let service;

  const apiClientOptions = defaultApiClientOptions(),
    tag1 = new TagEntity(defaultTagDto()),
    tag2 = new TagEntity(sharedTagDto()),
    tag3 = new TagEntity(defaultTagDto({ slug: "last_tag" })),
    tagsCollection = new TagsCollection([tag1, tag2, tag3]),
    resourceWithTags = new ResourceEntity(
      defaultResourceDto({ tags: tagsCollection, permission: undefined }, { withTags: true }),
    );

  beforeEach(() => {
    enableFetchMocks();
    fetch.resetMocks();
    service = new TagApiService(apiClientOptions);
  });

  it("Should return the expected resource name", () => {
    expect(TagApiService.RESOURCE_NAME).toEqual(TAG_API_SERVICE_RESOURCE_NAME);
  });

  describe("::findAll", () => {
    it("Should get the tags from the API", async () => {
      expect.assertions(3);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}`), async () => mockApiResponse(tagsCollection));

      const result = await service.findAll();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PassboltResponseEntity);
      expect(result.body).toEqual(tagsCollection.toDto());
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}`), async () => "wrong");

      await expect(() => service.findAll()).rejects.toThrow(PassboltBadResponseError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("::updateResourceTags", () => {
    it("Should update a resource tags collection", async () => {
      expect.assertions(3);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}/${resourceWithTags.id}`), async () =>
        mockApiResponse(resourceWithTags),
      );

      const result = await service.updateResourceTags(resourceWithTags.id, tagsCollection.toDto());
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PassboltResponseEntity);
      expect(result.body).toEqual(resourceWithTags.toDto({ tag: true }));
    });

    it("Should throw an error if resourceId parameter is not an uuid", async () => {
      expect.assertions(2);
      await expect(() => service.updateResourceTags("mockResourceWithTags", [])).rejects.toThrow(TypeError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("Should throw an error if tagsDto parameter is not an array", async () => {
      expect.assertions(2);
      await expect(() => service.updateResourceTags(resourceWithTags.id, null)).rejects.toThrow(TypeError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}/${resourceWithTags.id}`), async () => "wrong");

      await expect(() => service.updateResourceTags(resourceWithTags.id, [])).rejects.toThrow(PassboltBadResponseError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("::update", () => {
    it("Should update a tag", async () => {
      expect.assertions(3);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}/${tag1.id}`), async () => mockApiResponse(tag1));

      const result = await service.update(tag1.id, tag1.toDto());
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PassboltResponseEntity);
      expect(result.body).toEqual(tag1.toDto());
    });

    it("Should throw an error if tagId parameter is not an uuid", async () => {
      expect.assertions(2);
      await expect(() => service.update("update", tag1)).rejects.toThrow(TypeError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}/${tag1.id}`), async () => "wrong");

      await expect(() => service.update(tag1.id, tag1.toDto())).rejects.toThrow(PassboltBadResponseError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("::delete", () => {
    it("Should delete a tag", async () => {
      expect.assertions(3);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}/${tag1.id}`), async () => mockApiResponse(null));

      const result = await service.delete(tag1.id);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PassboltResponseEntity);
      expect(result.body).toEqual(null);
    });

    it("Should throw an error if tagId parameter is not an uuid", async () => {
      expect.assertions(2);
      await expect(() => service.delete("delete")).rejects.toThrow(TypeError);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("Should throw an error if the response is not properly formatted", async () => {
      expect.assertions(2);

      fetch.doMockOnceIf(new RegExp(`/${TAG_API_SERVICE_RESOURCE_NAME}/${tag1.id}`), async () => "wrong");

      await expect(() => service.delete(tag1.id)).rejects.toThrow(PassboltBadResponseError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
