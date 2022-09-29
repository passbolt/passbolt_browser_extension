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
 * @since         3.3.0
 */
import browser from "../sdk/polyfill/browserPolyfill";
import ToolbarController from "./toolbarController";

jest.useFakeTimers();

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("Toolbar controller", () => {
  it("should do restart the update suggested resource badge after an error", async() => {
    expect.assertions(7);
    const toolbarController = new ToolbarController();
    jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => {
      browser.runtime.lastError = 'Tab url not present';
      throw new Error();
    });
    const spy = jest.spyOn(toolbarController, "updateSuggestedResourcesBadge");
    const spyOnAlarmClear = jest.spyOn(browser.alarms, "clear");
    const spyOnAlarmCreate = jest.spyOn(browser.alarms, "create");
    const timeoutDelay = 50;

    expect(spy).not.toHaveBeenCalled();

    await toolbarController.updateSuggestedResourcesBadge();
    expect(spy).toHaveBeenCalledTimes(1);
    //Called 1 times during the ::set
    expect(spyOnAlarmCreate).toHaveBeenCalledTimes(1);
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(1);

    jest.spyOn(browser.tabs, "query").mockImplementationOnce(() => {
      browser.runtime.lastError = null;
      return [null];
    });
    jest.advanceTimersByTime(timeoutDelay);
    expect(spy).toHaveBeenCalledTimes(2);
    //Called 1 time
    expect(spyOnAlarmClear).toHaveBeenCalledTimes(2);
    expect(spyOnAlarmClear).toHaveBeenCalledWith("UpdateSuggestedResourceBadgeCacheFlush");
  });
});
