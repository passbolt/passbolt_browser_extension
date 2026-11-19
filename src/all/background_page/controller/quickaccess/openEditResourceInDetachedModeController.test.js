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
 * @since         5.18.0
 */
import { v4 as uuidv4 } from "uuid";
import OpenEditResourceInDetachedModeController from "./openEditResourceInDetachedModeController";
import { QuickAccessService } from "../../service/ui/quickAccess.service";
import BrowserTabService from "../../service/ui/browserTab.service";

describe("OpenEditResourceInDetachedModeController", () => {
  let worker;

  beforeEach(() => {
    jest.restoreAllMocks();
    worker = { port: { emit: jest.fn() }, tab: { id: 12 } };
    jest.spyOn(QuickAccessService, "openInDetachedMode").mockImplementation(() => ({}));
    jest.spyOn(QuickAccessService, "isAttachedModeAvailable").mockImplementation(() => false);
    jest.spyOn(BrowserTabService, "getCurrent").mockImplementation(async () => ({ id: 34 }));
  });

  it("should open the edit form of the resource in a detached window", async () => {
    expect.assertions(2);
    const resourceId = uuidv4();
    const controller = new OpenEditResourceInDetachedModeController(worker, "request-id");

    await controller._exec(resourceId, "42");

    expect(QuickAccessService.openInDetachedMode).toHaveBeenCalledWith([
      { name: "feature", value: "edit-resource" },
      { name: "resourceId", value: resourceId },
      { name: "tabId", value: "42" },
    ]);
    expect(worker.port.emit).toHaveBeenCalledWith("request-id", "SUCCESS");
  });

  it("should target the active tab when no opener tab is given (toolbar popup)", async () => {
    expect.assertions(1);
    const resourceId = uuidv4();
    const controller = new OpenEditResourceInDetachedModeController(worker, "request-id");

    await controller._exec(resourceId);

    expect(QuickAccessService.openInDetachedMode).toHaveBeenCalledWith(
      expect.arrayContaining([{ name: "tabId", value: "34" }]),
    );
  });

  it("should refuse to open a separate window on Safari", async () => {
    expect.assertions(2);
    QuickAccessService.isAttachedModeAvailable.mockImplementation(() => true);
    const controller = new OpenEditResourceInDetachedModeController(worker, "request-id");

    await controller._exec(uuidv4());

    expect(QuickAccessService.openInDetachedMode).not.toHaveBeenCalled();
    expect(worker.port.emit).toHaveBeenCalledWith("request-id", "ERROR", expect.any(Error));
  });

  it("should ignore an opener tab id which is not a number", async () => {
    expect.assertions(1);
    const resourceId = uuidv4();
    const controller = new OpenEditResourceInDetachedModeController({ ...worker, tab: null }, "request-id");

    await controller._exec(resourceId, "javascript:alert(1)");

    expect(QuickAccessService.openInDetachedMode).toHaveBeenCalledWith([
      { name: "feature", value: "edit-resource" },
      { name: "resourceId", value: resourceId },
    ]);
  });

  it("should refuse an invalid resource id", async () => {
    expect.assertions(2);
    const controller = new OpenEditResourceInDetachedModeController(worker, "request-id");

    await controller._exec("not-a-uuid");

    expect(QuickAccessService.openInDetachedMode).not.toHaveBeenCalled();
    expect(worker.port.emit).toHaveBeenCalledWith("request-id", "ERROR", expect.any(Error));
  });
});
