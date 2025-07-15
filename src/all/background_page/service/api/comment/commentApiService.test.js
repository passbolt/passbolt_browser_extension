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

import {enableFetchMocks} from "jest-fetch-mock";
import {v4 as uuidv4} from "uuid";
import {mockApiResponse} from '../../../../../../test/mocks/mockApiResponse';
import CommentApiService from "./commentApiService";
import AccountEntity from "../../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../../account/buildApiClientOptionsService";
import {defaultCommentCollectionDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntityCollection.test.data";
import {defaultCommentDto} from "passbolt-styleguide/src/shared/models/entity/comment/commentEntity.test.data";
import PassboltServiceUnavailableError from "passbolt-styleguide/src/shared/lib/Error/PassboltServiceUnavailableError";
import CommentEntity from "../../../model/entity/comment/commentEntity";
import {mockApiResponseError} from "../../../../../../test/mocks/mockApiResponse";

describe.only("ActionLogService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::findAll', () => {
    it("retrieves the comments from API", async() => {
      expect.assertions(2);

      const commentsCollection = [defaultCommentCollectionDto()];
      fetch.doMockOnceIf(/comments\/resource/, () => mockApiResponse(commentsCollection));

      const service = new CommentApiService(apiClientOptions, account);
      const resultDto = await service.findAll('Resource', uuidv4(), {creator: true});

      expect(resultDto).toBeInstanceOf(Array);
      expect(resultDto).toHaveLength(commentsCollection.length);
    });

    it("throws API error if the API encountered an issue", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/comments\/resource/, () => mockApiResponseError(500, "Something wrong happened!"));

      const service = new CommentApiService(apiClientOptions);

      await expect(() => service.findAll('Resource')).rejects.toThrow(TypeError);
    });

    it("throws service unavailable error if an error occurred but not from the API (by instance cloudflare)", async() => {
      expect.assertions(1);
      fetch.doMockOnceIf(/comments\/resource/, () => { throw new Error("Service unavailable"); });

      const service = new CommentApiService(apiClientOptions);

      await expect(() => service.findAll('Resource', uuidv4(), {creator: true})).rejects.toThrow(PassboltServiceUnavailableError);
    });
  });

  describe('::create', () => {
    it("Create a comment", async() => {
      expect.assertions(2);

      const commentDto = defaultCommentDto({}, {withCreator: false, withModifier: false});

      const payload = new CommentEntity(commentDto);
      let reqPayload;
      fetch.doMockOnceIf(/comments\/resource/, async req => {
        expect(req.method).toEqual("POST");
        reqPayload = await req.json();
        return mockApiResponse(defaultCommentDto({...reqPayload, id: commentDto.id}));
      });

      const service = new CommentApiService(apiClientOptions);
      const resultDto = await service.create(payload._props);

      expect(resultDto).toEqual(expect.objectContaining(commentDto));
    });

    it("throws an error if input is invalid ", async() => {
      expect.assertions(1);

      const service = new CommentApiService(apiClientOptions);

      await expect(() => service.create(42, {withCreator: false, withModifier: false})).rejects.toThrow(TypeError);
    });
  });


  describe('::delete', () => {
    it("Delete a comment", async() => {
      expect.assertions(1);

      const deleteCommentId = uuidv4();
      fetch.doMockOnceIf(new RegExp(`/comments\/${deleteCommentId}\.json`), async req => {
        expect(req.method).toEqual("DELETE");
        return mockApiResponse({});
      });

      const service = new CommentApiService(apiClientOptions);
      await service.delete(deleteCommentId);
    });

    it("throws an invalid parameter error if the id parameter is not valid", async() => {
      expect.assertions(1);

      const service = new CommentApiService(apiClientOptions);

      await expect(() => service.delete(42)).rejects.toThrow(Error);
    });
  });
});
