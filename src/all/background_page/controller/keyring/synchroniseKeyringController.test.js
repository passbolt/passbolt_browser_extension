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
 * @since         5.13.0
 */

import SynchroniseKeyringController from "../keyring/synchroniseKeyringController";
import Keyring from "../../model/keyring";

const mockSync = jest.spyOn(Keyring.prototype, "sync");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SynchroniseKeyringController", () => {
  it("Should synchronise the keyring", async () => {
    expect.assertions(1);
    mockSync.mockImplementation(() => Promise.resolve());
    const controller = new SynchroniseKeyringController();
    const promise = controller.exec();
    return expect(promise).resolves.not.toThrow();
  });

  it("Should call keyring.sync() once", async () => {
    expect.assertions(1);
    mockSync.mockImplementation(() => Promise.resolve());
    const controller = new SynchroniseKeyringController();
    await controller.exec();
    expect(mockSync).toHaveBeenCalledTimes(1);
  });

  it("Should propagate errors thrown by keyring.sync()", async () => {
    expect.assertions(1);
    const error = new Error("Could not synchronize the keyring.");
    mockSync.mockImplementation(() => Promise.reject(error));
    const controller = new SynchroniseKeyringController();
    const promise = controller.exec();
    return expect(promise).rejects.toThrow("Could not synchronize the keyring.");
  });
});
