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
import Port from "./port";
import browser from "../../../background_page/sdk/polyfill/browserPolyfill";
import {v4 as uuidv4} from "uuid";

describe("Port", () => {
  describe("Port::connect", () => {
    it("Should create new port with the name and connect", async() => {
      expect.assertions(5);

      const portname = uuidv4();
      const port = new Port(portname);
      expect(port._connected).toBeFalsy();
      port.connect();
      expect(browser.runtime.connect).toHaveBeenCalledWith({name: portname});
      expect(port._port.onDisconnect.addListener).toHaveBeenCalled();
      expect(port._port.onMessage.addListener).toHaveBeenCalled();

      port._onMessage(JSON.stringify(["passbolt.port.ready"]));
      expect(Object.keys(port._listeners).length).toBe(0);
    });

    it("Should raise an error if port has no name", async() => {
      expect.assertions(1);

      try {
        new Port(null);
      } catch (error) {
        expect(error.message).toBe('The port name should be a valid string.');
      }
    });
  });

  describe("Port::request", () => {
    it("Should post a message and wait a success result", async() => {
      expect.assertions(6);

      const portname = uuidv4();
      const port = new Port(portname);
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      jest.spyOn(port, "emit");
      jest.spyOn(port.lock, "acquire");
      jest.spyOn(port.lock, "release");

      const message = "request_message";
      const promise = port.request(message, {data: "data"});
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, {data: "data"});
      expect(port.lock.acquire).toHaveBeenCalled();
      // Force to wait the promise has been resolve
      await Promise.resolve();
      expect(port.lock.release).toHaveBeenCalled();
      // Force to wait the promise has been resolve to be sure the post message has been called
      await Promise.resolve();
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, {data: "data"}]));

      const dataReceived = {data: "dataReceived"};
      port._onMessage(JSON.stringify([requestId, "SUCCESS", dataReceived]));
      expect(Object.keys(port._listeners).length).toBe(0);
      expect(await promise).toStrictEqual(dataReceived);
    });

    it("Should post a message and wait an error result", async() => {
      expect.assertions(6);

      const portname = uuidv4();
      const port = new Port(portname);
      port.connect();
      port._onMessage(JSON.stringify(["passbolt.port.ready"]));

      jest.spyOn(port, "emit");
      jest.spyOn(port.lock, "acquire");
      jest.spyOn(port.lock, "release");

      const message = "request_message";
      const promise = port.request(message, {data: "data"});
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, {data: "data"});
      expect(port.lock.acquire).toHaveBeenCalled();
      // Force to wait the promise has been resolve
      await Promise.resolve();
      expect(port.lock.release).toHaveBeenCalled();
      // Force to wait the promise has been resolve to be sure the post message has been called
      await Promise.resolve();
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, {data: "data"}]));

      const dataReceived = {data: "dataReceived"};
      port._onMessage(JSON.stringify([requestId, "ERROR", dataReceived]));
      expect(Object.keys(port._listeners).length).toBe(0);
      try {
        await promise;
      } catch (error) {
        expect(error).toStrictEqual(dataReceived);
      }
    });

    it("Should post a message on a disconnected port and wait to connect again before sending a message", async() => {
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
      const promise = port.request(message, {data: "data"});
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, {data: "data"});
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
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, {data: "data"}]));

      const dataReceived = {data: "dataReceived"};
      port._onMessage(JSON.stringify([requestId, "SUCCESS", dataReceived]));
      expect(Object.keys(port._listeners).length).toBe(0);
      expect(await promise).toStrictEqual(dataReceived);
    });
  });
});
