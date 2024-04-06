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
 * @since         4.7.0
 */

import AuthenticationEventController from "./authenticationEventController";
import {defaultWorker} from "./authenticationEventController.test.data";

describe("AuthenticationEventController", () => {
  describe("::initialise", () => {
    it("should accept a worker and register it", () => {
      expect.assertions(2);
      const worker = defaultWorker();

      expect(AuthenticationEventController.worker).toBeUndefined();
      AuthenticationEventController.initialise(worker);
      expect(AuthenticationEventController.worker).toStrictEqual(worker);
    });
  });

  describe("::startListen", () => {
    it("should initialise its state and listen to port.onDisconnect", () => {
      expect.assertions(4);
      const worker = defaultWorker();

      expect(AuthenticationEventController.isPortConnected).toBeFalsy();
      AuthenticationEventController.initialise(worker);
      AuthenticationEventController.startListen();

      expect(AuthenticationEventController.isPortConnected).toStrictEqual(true);
      expect(worker.port._port.onDisconnect.addListener).toHaveBeenCalledTimes(1);
      expect(worker.port._port.onDisconnect.addListener).toHaveBeenCalledWith(AuthenticationEventController.handlePortDisconnected);
    });
  });

  describe("::handleUserLoggedIn", () => {
    it("should emit 'passbolt.auth.after-login' on port if it is marked as connected", () => {
      expect.assertions(2);

      const worker = defaultWorker();
      AuthenticationEventController.initialise(worker);
      AuthenticationEventController.startListen();
      AuthenticationEventController.handleUserLoggedIn();

      expect(worker.port.emit).toHaveBeenCalledTimes(1);
      expect(worker.port.emit).toHaveBeenCalledWith("passbolt.auth.after-login");
    });

    it("should not emit 'passbolt.auth.after-login' on port if it is marked as disconnected", () => {
      expect.assertions(1);

      const worker = defaultWorker();
      AuthenticationEventController.initialise(worker);
      AuthenticationEventController.startListen();
      AuthenticationEventController.isPortConnected = false;
      AuthenticationEventController.handleUserLoggedIn();

      expect(worker.port.emit).not.toHaveBeenCalled();
    });
  });

  describe("::handleUserLoggedOut", () => {
    it("should emit 'passbolt.auth.after-logout' on port if it is marked as connected", () => {
      expect.assertions(2);

      const worker = defaultWorker();
      AuthenticationEventController.initialise(worker);
      AuthenticationEventController.startListen();
      AuthenticationEventController.handleUserLoggedOut();

      expect(worker.port.emit).toHaveBeenCalledTimes(1);
      expect(worker.port.emit).toHaveBeenCalledWith("passbolt.auth.after-logout");
    });

    it("should not emit 'passbolt.auth.after-login' on port if it is marked as disconnected", () => {
      expect.assertions(1);
      const worker = defaultWorker();

      AuthenticationEventController.initialise(worker);
      AuthenticationEventController.startListen();
      AuthenticationEventController.isPortConnected = false;
      AuthenticationEventController.handleUserLoggedOut();

      expect(worker.port.emit).not.toHaveBeenCalled();
    });
  });

  describe("::handlePortDisconnected", () => {
    it("should mark the port as disconnected", () => {
      expect.assertions(1);
      const worker = defaultWorker();

      AuthenticationEventController.initialise(worker);
      AuthenticationEventController.startListen();
      AuthenticationEventController.handlePortDisconnected();

      expect(AuthenticationEventController.isPortConnected).toStrictEqual(false);
    });
  });
});
