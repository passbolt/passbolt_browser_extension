/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.8.0
 */

import {enableFetchMocks} from "jest-fetch-mock";
import {commentsMockDto} from "../../model/entity/comment/comments.test.data";
import GetCommentsByRessourceController from "./getCommentsByRessourceIdController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {v4 as uuidv4} from "uuid";
import MockExtension from "../../../../../test/mocks/mockExtension";

beforeEach(async() =>  {
  enableFetchMocks();
  fetch.resetMocks();
  await MockExtension.withConfiguredAccount();
});

const mockApiResult = commentsMockDto();
const fetchCommentsMock = () => {
  fetch.doMock(() => mockApiResponse(mockApiResult));
};

const mockedWorker = {
  port: {
    emit: jest.fn()
  }
};

describe("GetCommentsByRessourceController", () => {
  describe("CreateCommentController::constructor", () => {
    it("Should init all properties.", async() => {
      const requestId = uuidv4();

      const controller = new GetCommentsByRessourceController(mockedWorker, requestId, defaultApiClientOptions());

      expect.assertions(3);

      expect(controller.worker).toBe(mockedWorker);
      expect(controller.requestId).toBe(requestId);
      expect(controller.commentModel).toBeDefined();
    });
  });
  describe("GetCommentsByRessourceController::exec", () => {
    it("Should retrieve the comments being used by the worker.", async() => {
      fetchCommentsMock();
      const resourceId = uuidv4();
      const controller = new GetCommentsByRessourceController(null, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller.commentModel, "findAllByResourceId");
      const commentsCollectionDto = await controller.exec(resourceId);

      expect.assertions(5);

      expect(commentsCollectionDto.items.length).toBe(2);
      expect(commentsCollectionDto.items[0]._props).toEqual(expect.objectContaining(mockApiResult[0]));
      expect(commentsCollectionDto.items[1]._props).toEqual(expect.objectContaining(mockApiResult[1]));
      //We expect the function findAllByResourceId to be called with resourceId
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(resourceId);
    });

    it("Should raise an error when resourceId is null", async() => {
      const controller = new GetCommentsByRessourceController(null, null, defaultApiClientOptions());

      expect.assertions(1);

      await expect(controller.exec(null)).rejects.toThrowError(new TypeError("A resource id is required."));
    });
    it("Should raise an error when resourceId is not a valid uuid", async() => {
      const uuid = "12345-6789";
      const controller = new GetCommentsByRessourceController(null, null, defaultApiClientOptions());

      expect.assertions(1);

      await expect(controller.exec(uuid)).rejects.toThrowError(new TypeError("The resource id should be a valid uuid."));
    });
    it("Should raise an error when service is not unavailable", async() => {
      fetch.doMock(() => { throw mockedError; });
      const mockedError = new TypeError("Service error. This is a mocked error");
      const controller = new GetCommentsByRessourceController(mockedWorker, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller, "exec");
      expect.assertions(3);

      await expect(controller.exec(uuidv4())).rejects.toThrowError(mockedError);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
