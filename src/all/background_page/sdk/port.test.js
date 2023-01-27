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
 * @since         3.9.0
 */
import Port from "./port";

describe("Port", () => {
  describe("Port::constructor", () => {
    it("Should create new port, emit and respond to messages", async() => {
      expect.assertions(5);
      // data mocked
      const port = {
        onMessage: {
          addListener: jest.fn(),
        },
        postMessage: jest.fn(),
        disconnect: jest.fn()
      };
      const portServiceWorker = new Port(port);
      const callback = jest.fn();
      // process
      portServiceWorker.on("test", callback);
      portServiceWorker._onMessage(JSON.stringify(["test"]));
      portServiceWorker.emitQuiet("hello");
      portServiceWorker.disconnect();
      // expectations
      expect(port.onMessage.addListener).toHaveBeenCalled();
      expect(portServiceWorker._listeners["test"]).toStrictEqual([{callback: callback, name: "test", once: false}]);
      expect(Object.keys(portServiceWorker._listeners).length).toBe(1);
      expect(port.postMessage).toHaveBeenCalledWith(JSON.stringify(["hello"]));
      expect(port.disconnect).toHaveBeenCalled();
    });

    it("Should raise an error if port is null or undefined", async() => {
      expect.assertions(2);

      try {
        new Port(null);
      } catch (error) {
        expect(error.message).toBe("A port is required.");
      }

      try {
        new Port();
      } catch (error) {
        expect(error.message).toBe("A port is required.");
      }
    });
  });

  describe("Port::request", () => {
    it("Should post a message and wait a success result", async() => {
      expect.assertions(5);
      // data mocked
      const port = {
        onMessage: {
          addListener: jest.fn(),
        },
        postMessage: jest.fn()
      };
      const portServiceWorker = new Port(port);
      const message = "request_message";
      jest.spyOn(portServiceWorker, "emit");
      // process
      const promise = portServiceWorker.request(message, {data: "data"});
      const requestId = Object.keys(portServiceWorker._listeners)[0];
      // expectations
      expect(portServiceWorker.emit).toHaveBeenCalledWith(message, requestId, {data: "data"});
      expect(port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, {data: "data"}]));
      expect(portServiceWorker._listeners[requestId]).toStrictEqual([{callback: expect.anything(), name: requestId, once: true}]);
      const dataReceived = {data: "dataReceived"};
      portServiceWorker._onMessage(JSON.stringify([requestId, "SUCCESS", dataReceived]));
      expect(Object.keys(portServiceWorker._listeners).length).toBe(0);
      expect(await promise).toStrictEqual(dataReceived);
    });

    it("Should post a message and wait an error result", async() => {
      expect.assertions(5);
      // data mocked
      const port = {
        onMessage: {
          addListener: jest.fn(),
        },
        postMessage: jest.fn()
      };
      const portServiceWorker = new Port(port);
      const message = "request_message";
      jest.spyOn(portServiceWorker, "emit");
      // process
      const promise = portServiceWorker.request(message, {data: "data"});
      const requestId = Object.keys(portServiceWorker._listeners)[0];
      // expectations
      expect(portServiceWorker.emit).toHaveBeenCalledWith(message, requestId, {data: "data"});
      expect(port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, {data: "data"}]));
      expect(portServiceWorker._listeners[requestId]).toStrictEqual([{callback: expect.anything(), name: requestId, once: true}]);
      const dataReceived = {data: "dataReceived"};
      portServiceWorker._onMessage(JSON.stringify([requestId, "ERROR", dataReceived]));
      expect(Object.keys(portServiceWorker._listeners).length).toBe(0);
      try {
        await promise;
      } catch (error) {
        expect(error).toStrictEqual(dataReceived);
      }
    });
  });
});
