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

import { defaultApiClientOptions } from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import { defaultPassboltResponseEntity } from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponseEntity.test.data";

import FindTagsService from "./findTagsService";
import TagEntity from "../../model/entity/tag/tagEntity";
import TagsCollection from "../../model/entity/tag/tagsCollection";
import { defaultTagDto, sharedTagDto } from "../../model/entity/tag/tagEntity.test.data";

describe("FindTagsService", () => {
  let service;

  const tag1 = new TagEntity(defaultTagDto()),
    tag2 = new TagEntity(sharedTagDto()),
    tagsCollection = new TagsCollection([tag1, tag2]),
    responseTagsCollection = defaultPassboltResponseEntity(tagsCollection.toDto()),
    responseNoTagsCollection = defaultPassboltResponseEntity(null);

  beforeEach(() => {
    enableFetchMocks();

    const apiClientOptions = defaultApiClientOptions();
    service = new FindTagsService(apiClientOptions);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("::findAll", () => {
    it("should return the tags", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "findAll").mockResolvedValue(responseTagsCollection);

      const tags = await service.findAll();

      expect(tags).toBeInstanceOf(TagsCollection);
      expect(tags).toEqual(tagsCollection);
    });

    it("should return an empty collection if returned value is not an array", async () => {
      expect.assertions(2);

      jest.spyOn(service.tagService, "findAll").mockResolvedValue(responseNoTagsCollection);

      const tags = await service.findAll();

      expect(tags).toBeInstanceOf(TagsCollection);
      expect(tags).toEqual(new TagsCollection());
    });

    it("should throw any error thrown by the underlying service", async () => {
      expect.assertions(1);

      const error = new Error("unexpected error");
      jest.spyOn(service.tagService, "findAll").mockRejectedValue(error);

      await expect(() => service.findAll()).rejects.toThrow(error);
    });
  });
});
