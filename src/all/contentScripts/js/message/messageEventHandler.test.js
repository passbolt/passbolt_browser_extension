/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import MessageService from "../service/messageService";
import MessageEventHandler from "./messageEventHandler";
import {
  ControllerMessageEventHandlerErrorExecMock,
  ControllerMessageEventHandlerMock, ControllerWithResponseMessageEventHandlerMock
} from "./messageEventHandler.test.data";
import {ControllerMessageEventHandlerConstructorMock} from "./messageEventHandlerConstructorMock.test.data";

/*
 * The class we need to mock the constructor needs to be separated in a dedicated file.
 * If not spyOn cannot be used on the same mocked class as the one mocked as following.
 */
jest.mock("./messageEventHandlerConstructorMock.test.data");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("MessageEventHandler", () => {
  describe("MessageEventHandler::constructor", () => {
    it("Should instantiate the class", async() => {
      expect.assertions(1);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);
      expect(messageEventHandler).toBeInstanceOf(MessageEventHandler);
    });

    it("Should not instantiate the class if the message service is not valid", async() => {
      expect.assertions(2);
      expect(() => new MessageEventHandler(null)).toThrowError('The messageService should be a valid MessageService instance.');
      expect(() => new MessageEventHandler({messageService: 'not a valid message service'})).toThrowError('The messageService should be a valid MessageService instance.');
    });
  });

  describe("MessageEventHandler::listen", () => {
    it("Should listen to message, execute the controller and resolve the message.", async() => {
      expect.assertions(2);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);

      const spyControllerClassExec = jest.spyOn(ControllerMessageEventHandlerMock.prototype, "exec");
      const spyMessageServiceSuccess = jest.spyOn(messageService, "success");

      messageEventHandler.listen('message-to-listen', ControllerMessageEventHandlerMock);
      await messageService._onMessage(['message-to-listen']);
      expect(spyControllerClassExec).toHaveBeenCalled();
      expect(spyMessageServiceSuccess).toHaveBeenCalled();
    });

    it("Should listen to message, execute the controller and resolve the message with the controller response.", async() => {
      expect.assertions(2);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);

      const spyControllerClassExec = jest.spyOn(ControllerWithResponseMessageEventHandlerMock.prototype, "exec");
      const spyMessageServiceSuccess = jest.spyOn(messageService, "success");

      messageEventHandler.listen('message-to-listen', ControllerWithResponseMessageEventHandlerMock);
      await messageService._onMessage(['message-to-listen']);
      expect(spyControllerClassExec).toHaveBeenCalled();
      expect(spyMessageServiceSuccess).toHaveBeenCalledWith('controller-exec-output');
    });

    it("Should listen to message, execute the controller and reject the message with the controller error.", async() => {
      expect.assertions(3);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);

      const spyControllerClassExec = jest.spyOn(ControllerMessageEventHandlerErrorExecMock.prototype, "exec");
      const spyMessageServiceEmit = jest.spyOn(messageService, "error");
      messageEventHandler.listen('message-to-listen', ControllerMessageEventHandlerErrorExecMock);
      let expectedError;

      try {
        await messageService._onMessage(['message-to-listen']);
      } catch (error) {
        expectedError = error;
        expect(error).toBeInstanceOf(Error);
      }

      expect(spyControllerClassExec).toThrow();
      expect(spyMessageServiceEmit).toHaveBeenCalledWith(expectedError);
    });

    it("Should listen to message, instantiate the controller with parameters, execute the controller and resolve the message.", async() => {
      expect.assertions(3);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);

      const spyControllerClassExec = jest.spyOn(ControllerMessageEventHandlerConstructorMock.prototype, "exec");
      const spyMessageServiceSuccess = jest.spyOn(messageService, "success");

      messageEventHandler.listen('message-to-listen', ControllerMessageEventHandlerConstructorMock, 'ctl-arg1-value', 'ctl-arg2-value');
      await messageService._onMessage(['message-to-listen']);

      expect(ControllerMessageEventHandlerConstructorMock).toHaveBeenCalledWith('ctl-arg1-value', 'ctl-arg2-value');
      expect(spyControllerClassExec).toHaveBeenCalled();
      expect(spyMessageServiceSuccess).toHaveBeenCalled();
    });

    it("Should listen to message, instantiate the controller with parameters, execute the controller with parameters and resolve the message.", async() => {
      expect.assertions(3);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);

      const spyControllerClassExec = jest.spyOn(ControllerMessageEventHandlerConstructorMock.prototype, "exec");
      const spyMessageServiceSuccess = jest.spyOn(messageService, "success");

      messageEventHandler.listen('message-to-listen', ControllerMessageEventHandlerConstructorMock, 'ctl-arg1-value', 'ctl-arg2-value');
      await messageService._onMessage(['message-to-listen', 'event-arg1-value', 'event-arg2-value']);

      expect(ControllerMessageEventHandlerConstructorMock).toHaveBeenCalledWith('ctl-arg1-value', 'ctl-arg2-value');
      expect(spyControllerClassExec).toHaveBeenCalledWith('event-arg1-value', 'event-arg2-value');
      expect(spyMessageServiceSuccess).toHaveBeenCalled();
    });

    it("Should throw an error if the message is not a string.", async() => {
      expect.assertions(2);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);
      expect(() => messageEventHandler.listen(null, ControllerMessageEventHandlerMock)).toThrowError('The message should be a valid string.');
      expect(() => messageEventHandler.listen(() => {}, ControllerMessageEventHandlerMock)).toThrowError('The message should be a valid string.');
    });

    it("Should throw an error if the message is empty.", async() => {
      expect.assertions(1);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);
      class ControllerMessageEventHandlerTestClass {}
      expect(() => messageEventHandler.listen('', ControllerMessageEventHandlerTestClass)).toThrowError('The message should not be empty.');
    });

    it("Should throw an error if ControllerClass is not a class.", async() => {
      expect.assertions(2);
      const messageService = new MessageService();
      const messageEventHandler = new MessageEventHandler(messageService);
      expect(() => messageEventHandler.listen('message', null)).toThrowError('The ControllerClass should be a valid class');
      expect(() => messageEventHandler.listen('message', 12)).toThrowError('The ControllerClass should be a valid class');
    });
  });
});
