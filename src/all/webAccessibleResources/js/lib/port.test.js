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
import Port, { EMIT_MAX_ATTEMPTS, PORT_READY_TIMEOUT } from "./port";
import { v4 as uuidv4 } from "uuid";

/**
 * Trigger the disconnection listeners registered on a runtime port.
 * @param {object} runtimePort The mocked runtime port
 */
const triggerDisconnect = (runtimePort) =>
  runtimePort.onDisconnect.addListener.mock.calls.forEach(([listener]) => listener());

describe("Port", () => {
  describe("Port::connect", () => {
    it("Should create new port with the name and connect", async () => {
      expect.assertions(5);

      const portname = uuidv4();
      const port = new Port(portname);
      expect(port._connected).toBeFalsy();
      port.connect();
      expect(browser.runtime.connect).toHaveBeenCalledWith({ name: portname });
      expect(port._port.onDisconnect.addListener).toHaveBeenCalled();
      expect(port._port.onMessage.addListener).toHaveBeenCalled();

      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      expect(Object.keys(port._listeners).length).toBe(0);
    });

    it("Should raise an error if port has no name", async () => {
      expect.assertions(1);

      try {
        new Port(null);
      } catch (error) {
        expect(error.message).toBe("The port name should be a valid string.");
      }
    });

    it("Should raise an error if context is invalid and send destroy message", async () => {
      expect.assertions(3);

      const portname = uuidv4();
      const port = new Port(portname);
      const callback = jest.fn();
      port.onConnectError(callback);

      jest.spyOn(browser.runtime, "connect").mockImplementationOnce(() => {
        throw new Error("context invalid");
      });
      jest.spyOn(port.onConnectErrorHandler, "callback");

      expect(port._connected).toBeFalsy();
      try {
        await port.connect();
      } catch (error) {
        console.error(error);
        expect(browser.runtime.connect).toHaveBeenCalledWith({ name: portname });
        expect(port.onConnectErrorHandler.callback).toHaveBeenCalled();
      }
    });
  });

  describe("Port::request", () => {
    it("Should post a message and wait a success result", async () => {
      expect.assertions(6);

      const portname = uuidv4();
      const port = new Port(portname);
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      jest.spyOn(port, "emit");
      jest.spyOn(port.lock, "acquire");
      jest.spyOn(port.lock, "release");

      const message = "request_message";
      const promise = port.request(message, { data: "data" });
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, { data: "data" });
      expect(port.lock.acquire).toHaveBeenCalled();
      // Force to wait the promise has been resolve
      await Promise.resolve();
      expect(port.lock.release).toHaveBeenCalled();
      // Force to wait the promise has been resolve to be sure the post message has been called
      await Promise.resolve();
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, { data: "data" }]));

      const dataReceived = { data: "dataReceived" };
      port._onMessage(JSON.stringify([requestId, "SUCCESS", dataReceived]));
      expect(Object.keys(port._listeners).length).toBe(0);
      expect(await promise).toStrictEqual(dataReceived);
    });

    it("Should post a message and wait an error result", async () => {
      expect.assertions(6);

      const portname = uuidv4();
      const port = new Port(portname);
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      jest.spyOn(port, "emit");
      jest.spyOn(port.lock, "acquire");
      jest.spyOn(port.lock, "release");

      const message = "request_message";
      const promise = port.request(message, { data: "data" });
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, { data: "data" });
      expect(port.lock.acquire).toHaveBeenCalled();
      // Force to wait the promise has been resolve
      await Promise.resolve();
      expect(port.lock.release).toHaveBeenCalled();
      // Force to wait the promise has been resolve to be sure the post message has been called
      await Promise.resolve();
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, { data: "data" }]));

      const dataReceived = { data: "dataReceived" };
      port._onMessage(JSON.stringify([requestId, "ERROR", dataReceived]));
      expect(Object.keys(port._listeners).length).toBe(0);
      try {
        await promise;
      } catch (error) {
        expect(error).toStrictEqual(dataReceived);
      }
    });

    it("Should post a message on a disconnected port and wait to connect again before sending a message", async () => {
      expect.assertions(7);

      const portname = uuidv4();
      const port = new Port(portname);

      jest.spyOn(port, "connect");

      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      jest.spyOn(port, "emit");
      jest.spyOn(port.lock, "acquire");
      jest.spyOn(port.lock, "release");

      const message = "request_message";
      port._connected = false;
      const promise = port.request(message, { data: "data" });
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, { data: "data" });
      expect(port.lock.acquire).toHaveBeenCalled();
      // Wait connect listener has been added
      await Promise.resolve();
      // Connect the port again
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      expect(port.connect).toHaveBeenCalledTimes(2);
      // Wait connect has been done
      await Promise.resolve();
      expect(port.lock.release).toHaveBeenCalled();
      // Wait release has been done
      await Promise.resolve();
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, { data: "data" }]));

      const dataReceived = { data: "dataReceived" };
      port._onMessage(JSON.stringify([requestId, "SUCCESS", dataReceived]));
      expect(Object.keys(port._listeners).length).toBe(0);
      expect(await promise).toStrictEqual(dataReceived);
    });
  });

  describe("Port::connect failures", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it("should reject and release the port when it is disconnected before being ready", async () => {
      expect.assertions(3);

      const port = new Port(uuidv4());
      const promise = port.connect();
      const runtimePort = port._port;
      // The addon code denied the connection.
      triggerDisconnect(runtimePort);

      await expect(promise).rejects.toThrow("disconnected before being acknowledged");
      expect(port._connected).toStrictEqual(false);
      expect(runtimePort.disconnect).toHaveBeenCalled();
    });

    it("should reject when a reconnection is not acknowledged in time", async () => {
      expect.assertions(2);
      jest.useFakeTimers();

      const port = new Port(uuidv4());
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      port._connected = false;
      const promise = port.connect();
      jest.advanceTimersByTime(PORT_READY_TIMEOUT);

      await expect(promise).rejects.toThrow("not been acknowledged by the addon code in time");
      expect(port._connected).toStrictEqual(false);
    });

    it("should wait without maximum delay for the first connection to be acknowledged", async () => {
      expect.assertions(2);
      jest.useFakeTimers();

      const port = new Port(uuidv4());
      const promise = port.connect();
      // The addon code can take long to attach the application (i.e. API calls).
      jest.advanceTimersByTime(PORT_READY_TIMEOUT * 2);
      expect(port._connected).toStrictEqual(true);

      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      await expect(promise).resolves.toBeUndefined();
    });

    it("should release the lock and reject the request when the connection is denied", async () => {
      expect.assertions(3);

      const port = new Port(uuidv4());
      const promise = port.request("request_message");
      // Wait for the connection to be attempted, whatever the number of ticks the transpiled async chain takes.
      for (let tick = 0; tick < 20 && !port._port; tick++) {
        await Promise.resolve();
      }
      triggerDisconnect(port._port);

      await expect(promise).rejects.toThrow("disconnected before being acknowledged");
      expect(port.lock._locked).toBeFalsy();
      // Only the request listener had been added, it is removed with the failure.
      expect(Object.keys(port._listeners).length).toBe(0);
    });
  });

  describe("Port::disconnection", () => {
    it("should ignore the late disconnection of a previous port", async () => {
      expect.assertions(2);

      const port = new Port(uuidv4());
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      const previousRuntimePort = port._port;
      // The application reconnects (i.e. after a service worker restart) before the previous disconnection is received.
      port._connected = false;
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      expect(port._port).not.toBe(previousRuntimePort);

      triggerDisconnect(previousRuntimePort);

      expect(port._connected).toStrictEqual(true);
    });

    it("should flag the port as disconnected when the current port is disconnected", async () => {
      expect.assertions(1);

      const port = new Port(uuidv4());
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      triggerDisconnect(port._port);

      expect(port._connected).toStrictEqual(false);
    });
  });

  describe("Port::emit on a dead port", () => {
    it("should reconnect and send the message again when the port is dead without its disconnection received", async () => {
      expect.assertions(3);

      const port = new Port(uuidv4());
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      const deadRuntimePort = port._port;
      const connectionsCount = browser.runtime.connect.mock.calls.length;
      deadRuntimePort.postMessage.mockImplementation(() => {
        throw new Error("Attempting to use a disconnected port object");
      });

      const emitting = port.emit("message");
      // Wait for the reconnection to be attempted, then acknowledge it.
      await new Promise((resolve) => setTimeout(resolve, 0));
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      await emitting;

      expect(browser.runtime.connect).toHaveBeenCalledTimes(connectionsCount + 1);
      expect(port._port).not.toBe(deadRuntimePort);
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify(["message"]));
    });
  });

  describe("Port::emit retries", () => {
    it("should stop retrying and reject once the maximum number of attempts is reached", async () => {
      expect.assertions(2);

      const port = new Port(uuidv4());
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      const error = new Error("Attempting to use a disconnected port object");
      port._port.postMessage.mockImplementation(() => {
        throw error;
      });
      // Every reconnection succeeds but the port stays dead.
      jest.spyOn(port, "connectIfDisconnected").mockImplementation(async () => {
        port._connected = true;
      });

      await expect(port.emit("message")).rejects.toBe(error);
      expect(port._port.postMessage).toHaveBeenCalledTimes(EMIT_MAX_ATTEMPTS);
    });
  });

  describe("Port::request delivery", () => {
    it("should post a request only once", async () => {
      expect.assertions(2);

      const port = new Port(uuidv4());
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      const promise = port.request("request_message");
      const requestId = Object.keys(port._listeners)[0];
      // Wait for the message to be posted.
      for (let tick = 0; tick < 20 && port._port.postMessage.mock.calls.length === 0; tick++) {
        await Promise.resolve();
      }
      port._onMessage(JSON.stringify([requestId, "SUCCESS"]));
      await promise;

      expect(port._port.postMessage).toHaveBeenCalledTimes(1);
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify(["request_message", requestId]));
    });
  });
});
