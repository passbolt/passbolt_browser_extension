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
import MockExtension from "../../../../../test/mocks/mockExtension";
import {commentCreationMock, commentResponseMock} from "../../model/entity/comment/comments.test.data";
import {defaultApiClientOptions} from "../../service/api/apiClient/apiClientOptions.test.data";
import {mockApiResponse} from "../../../../../test/mocks/mockApiResponse";
import CreateCommentController from "./createCommentController";
import {v4 as uuidv4} from "uuid";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import CommentModel from "../../model/comment/commentModel";

beforeEach(async() =>  {
  enableFetchMocks();
  fetch.resetMocks();
  await MockExtension.withConfiguredAccount();
});

const mockApiCreation = commentCreationMock();
const mockApiResultCreation = commentResponseMock(mockApiCreation);

const fetchCommentsMock = () => {
  fetch.doMock(() => mockApiResponse(mockApiResultCreation));
};
const mockedWorker = {
  port: {
    emit: jest.fn()
  }
};
describe("CreateCommentController", () => {
  const validationError = new EntityValidationError("Could not validate entity Comment.");
  const expectInvalidField = (controller, mockCreation) => expect(controller.exec(mockCreation)).rejects.toThrowError(validationError);

  describe("CreateCommentController::constructor", () => {
    it("Should init all properties.", async() => {
      const requestId = uuidv4();
      const apiClientOption = defaultApiClientOptions();
      const controller = new CreateCommentController(mockedWorker, requestId, apiClientOption);

      expect.assertions(3);

      expect(controller.worker).toBe(mockedWorker);
      expect(controller.requestId).toBe(requestId);
      expect(controller.commentModel).toEqual(expect.objectContaining(new CommentModel(apiClientOption)));
    });
  });
  describe("CreateCommentController::exec", () => {
    it("Should create the comment and send the result back.", async() => {
      fetchCommentsMock();
      const controller = new CreateCommentController(null, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller.commentModel, "create");
      const createdComment = await controller.exec(mockApiCreation);

      expect.assertions(2);

      expect(createdComment.toDto()).toEqual(expect.objectContaining(mockApiResultCreation));
      //We expect the function findAllByResourceId to be called with resourceId
      expect(spy).toHaveBeenCalled();
    });
    it("Should raise an error if service is unavailable", async() => {
      const mockedError = new TypeError("Service error. This is a mocked error");
      fetch.doMock(() => { throw mockedError; });
      const controller = new CreateCommentController(mockedWorker, null, defaultApiClientOptions());
      const spy = jest.spyOn(controller.commentModel, "create");

      expect.assertions(2);

      await expect(controller.exec(mockApiCreation)).rejects.toThrowError(mockedError);
      expect(spy).toHaveBeenCalled();
    });
    it("Should raise error if user_id is missing.", async() => {
      const mockCreation = Object.assign({}, mockApiCreation);
      delete mockCreation.user_id;
      const controller = new CreateCommentController(null, null, defaultApiClientOptions());

      expect.assertions(1);

      expectInvalidField(controller, mockCreation);
    });
  });
});
