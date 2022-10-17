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

import {v4 as uuidv4} from "uuid";
import DeleteCommentController from "./deleteCommentController";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import {enableFetchMocks} from "jest-fetch-mock";
import CommentModel from "../../model/comment/commentModel";
import MockExtension from "../../../../../test/mocks/mockExtension";

const mockedWorker = {
  port: {
    emit: jest.fn()
  }
};

const fetchCommentsMock = () => {
  fetch.doMock(() => mockApiResponse(null));
};
const requestId = uuidv4();
const id = uuidv4();
beforeEach(async() =>  {
  enableFetchMocks();
  fetch.resetMocks();
  await MockExtension.withConfiguredAccount();
});

describe("DeleteCommentController", () => {
  describe("DeleteCommentController::constructor", () => {
    it("Should init all properties.", async() => {
      const controller = new DeleteCommentController(mockedWorker, requestId, defaultApiClientOptions());
      const apiClientOption = defaultApiClientOptions();

      expect.assertions(3);

      expect(controller.worker).toBe(mockedWorker);
      expect(controller.requestId).toBe(requestId);
      expect(controller.commentModel).toEqual(expect.objectContaining(new CommentModel(apiClientOption)));
    });
  });
  describe("DeleteCommentController::exec", () => {
    it("Should delete comment by using the service", async() => {
      fetchCommentsMock();

      const controller = new DeleteCommentController(mockedWorker, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller.commentModel, "delete");
      await controller.exec(id);

      expect.assertions(2);

      //We expect the function findAllByResourceId to be called with id to delete
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledWith(id);
    });
    it("Should raise an error when id not a valid uuid", async() => {
      fetchCommentsMock();
      const uuid = "1223-1225";
      const controller = new DeleteCommentController(mockedWorker, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller, "exec");
      const unvalidUuid = new TypeError("The comment id should be a valid uuid.");

      expect.assertions(3);

      await expect(controller.exec(uuid)).rejects.toThrowError(unvalidUuid);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it("Should raise an error when id is missing", async() => {
      fetchCommentsMock();
      const controller = new DeleteCommentController(mockedWorker, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller, "exec");
      const unvalidUuid = new TypeError("A comment id is required.");

      expect.assertions(3);

      await expect(controller.exec(null)).rejects.toThrowError(unvalidUuid);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it("Should call exec method and send ERROR to worker when fetch is failing", async() => {
      const mockedError = new TypeError("Service error. This is a mocked error");
      fetch.doMock(() => { throw mockedError; });
      const controller = new DeleteCommentController(mockedWorker, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller, "exec");

      expect.assertions(3);

      await expect(controller.exec(id)).rejects.toThrowError(mockedError);
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
