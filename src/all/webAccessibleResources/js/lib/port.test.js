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
  beforeEach(async() => {

  });

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

      port._onMessage(["passbolt.port.ready"]);
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
    it("Should post a message and wait the result", async() => {
      expect.assertions(6);

      const portname = uuidv4();
      const port = new Port(portname);
      port.connect();
      port._onMessage(["passbolt.port.ready"]);

      jest.spyOn(port, "emit");
      jest.spyOn(port.lock, "acquire");
      jest.spyOn(port.lock, "release");

      const message = "request_message";
      const promise = port.request(message, {data: "data"});
      const requestId = Object.keys(port._listeners)[0];

      expect(port.emit).toHaveBeenCalledWith(message, requestId, {data: "data"});
      expect(port.lock.acquire).toHaveBeenCalled();
      // Force to wait the promise has been resolve to be sure the post message has been called
      await port.connectIfDisconnected();
      expect(port.lock.release).toHaveBeenCalled();
      expect(port._port.postMessage).toHaveBeenCalledWith(JSON.stringify([message, requestId, {data: "data"}]));

      const dataReceived = {data: "dataReceived"};
      port._onMessage([requestId, "SUCCESS", dataReceived]);
      expect(Object.keys(port._listeners).length).toBe(0);
      expect(await promise).toStrictEqual(dataReceived);
    });
  });
});
