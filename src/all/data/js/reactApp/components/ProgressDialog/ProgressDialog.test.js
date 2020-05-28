/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2020 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.12.0
 */

import React from "react";
import {render, cleanup} from "@testing-library/react";
import ProgressDialog from "./ProgressDialog";
import AppContext from "../../contexts/AppContext";

beforeEach(() => {
  jest.resetModules();
  // mock window.port
  mockPort();
});

const mockPort = function() {
  window.port = {
    _mockedOnCallbacks: {},
    fireAddonMessage: function(message) {
      const callback = window.port._mockedOnCallbacks[message];
      if (callback) {
        const callbackArgs = Array.prototype.slice.call(arguments, 1);
        callback.apply(null, callbackArgs);
      }
    },
    on: (message, callback) => {
      window.port._mockedOnCallbacks[message] = callback;
    }
  };
};

afterEach(() => {
  cleanup();
  // Cleanup the global library port mock.
  delete window.port;
});

describe("ProgressDialog", () => {
  it("displays a spinning 100% progress bar by default.", () => {
    const appContext = {};

    const {container} = render(
      <AppContext.Provider value={appContext}>
        <ProgressDialog debug title={"Progress dialog title"}/>
      </AppContext.Provider>
    );

    // Dialog title exists and correct
    const dialogTitle = container.querySelector(".dialog-header h2");
    expect(dialogTitle).not.toBeNull();
    expect(dialogTitle.textContent).toBe("Progress dialog title");

    // Dialog label content
    const dialogContentLabel = container.querySelector(".form-content label");
    expect(dialogContentLabel.textContent).toBe("Take a deep breath and enjoy being in the present moment...");

    // Progress bar.
    const progressBarElement = container.querySelector(".progress-bar");
    const progressBarStyle = window.getComputedStyle(progressBarElement);
    expect(progressBarStyle.width).toBe("100%");

    // Progress details elements to not be displayed.
    const progressDetailsElement = container.querySelector(".progress-details");
    expect(progressDetailsElement).toBeNull();

    // Primary button exists
    const primaryButton = container.querySelector(".button.primary.processing");
    expect(primaryButton).not.toBeNull();
  });

  it("displays a progressive progress bar.", async() => {
    const appContext = {};

    const {container} = render(
      <AppContext.Provider value={appContext}>
        <ProgressDialog debug title={"Progress dialog title"} goals={2} message={"Step 0"} />
      </AppContext.Provider>
    );

    // Progress bar.
    const progressBarElement = container.querySelector(".progress-bar");
    const progressBarStyle = window.getComputedStyle(progressBarElement);
    expect(progressBarStyle.width).toBe("0%");

    // Details message.
    const progressStepLabel = container.querySelector(".progress-step-label");
    // &nbsp; translate to unix code \u00a0
    expect(progressStepLabel.textContent).toBe("\u00a0 Step 0");

    // Details percent.
    const progressPercent = container.querySelector(".progress-percent");
    expect(progressPercent.textContent).toBe("0%");

    // Progress details elements to not be displayed.
    const progressDetailsElement = container.querySelector(".progress-details");
    expect(progressDetailsElement).not.toBeNull();
  });
});
