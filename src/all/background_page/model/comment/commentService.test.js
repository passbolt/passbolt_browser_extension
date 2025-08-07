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
import BuildApiClientOptionsService from "../../service/account/buildApiClientOptionsService";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {enableFetchMocks} from "jest-fetch-mock";
import CommentApiService from "../../service/api/comment/commentApiService";
import CommentService from "./commentService";
import {defaultCommentCollectionDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntityCollection.test.data";
import CommentsCollection from "../entity/comment/commentsCollection";
import {defaultCommentDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntity.test.data";
import CommentEntity from "../entity/comment/commentEntity";

describe("CommentService", () => {
  let apiClientOptions, account,
    service;

  beforeEach(async() => {
    enableFetchMocks();
    jest.clearAllMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
    service = new CommentService(apiClientOptions, account);
  });

  describe('::findAllByResourceId', () => {
    it("Should call the comments service API to get the comments collection", async() => {
      expect.assertions(2);
      const resourceId = uuidv4();
      const commentsDto = defaultCommentCollectionDto();

      jest.spyOn(CommentApiService.prototype, "findAll").mockImplementation(() => commentsDto);

      const resultsDto = await service.findAllByResourceId(resourceId);
      expect(resultsDto).toHaveLength(commentsDto.length);
      expect(resultsDto).toBeInstanceOf(CommentsCollection);
    });

    it("should throw an error if id is not defined", async() => {
      expect.assertions(1);
      const promise = service.findAllByResourceId();
      await expect(promise).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });

  describe('::create', () => {
    it("Should call the comments service API to create a new comment", async() => {
      expect.assertions(2);
      const commentDto = new CommentEntity(defaultCommentDto());

      jest.spyOn(CommentApiService.prototype, "create").mockImplementation(() => commentDto);

      const resultsDto = await service.create(commentDto);
      expect(resultsDto).toBeInstanceOf(CommentEntity);
      expect(resultsDto).toStrictEqual(commentDto);
    });

    it("should throw an error if comment is not defined", async() => {
      expect.assertions(1);
      const commentDto = new CommentEntity(defaultCommentDto());
      jest.spyOn(CommentApiService.prototype, "create").mockImplementation(() => null);
      const promise = service.create(commentDto);
      await expect(promise).rejects.toThrowError("Could not validate entity CommentEntity. No data provided.");
    });
  });

  describe('::delete', () => {
    it("Should call the comments service API to delete a new comment", async() => {
      expect.assertions(1);
      const resourceId = uuidv4();

      jest.spyOn(CommentApiService.prototype, "delete").mockImplementation(() => {});

      await service.delete(resourceId);
      await expect(service.delete(resourceId)).resolves.not.toThrow();
    });

    it("should throw an error if comment id is not defined", async() => {
      expect.assertions(1);

      const expectedError = new Error("The given parameter is not a valid UUID");
      expect(() => service.delete("test")).rejects.toThrow(expectedError);
    });
  });
});
