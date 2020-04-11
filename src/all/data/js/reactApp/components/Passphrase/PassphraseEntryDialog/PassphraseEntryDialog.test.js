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
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import PassphraseEntryDialog from "./PassphraseEntryDialog";
import AppContext from "../../../contexts/AppContext";
import "../../../../lib/secretComplexity";
import {UserAbortsOperationError} from "../../../../../../background_page/error/userAbortsOperationError";

const PassboltApiFetchError = require("../../../../../../background_page/error/passboltApiFetchError").PassboltApiFetchError;

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
    },
    emit: jest.fn(),
    request: jest.fn()
  };
};

afterEach(() => {
  cleanup();
  // Cleanup the global library port mock.
  delete window.port;
});

describe("PassphraseEntryDialog", () => {
  const getAppContext = function(appContext) {
    const defaultAppContext = {
      user: {
        "user.settings.securityToken.code": "TST",
        "user.settings.securityToken.textColor": "#FFFFFF",
        "user.settings.securityToken.color": "#000000"
      },
      rememberMeOptions: {
        "300": "5 minutes",
        "900": "15 minutes",
        "1800": "30 minutes",
        "3600": "1 hour",
        "-1": "until I log out"
      }
    };

    return Object.assign(defaultAppContext, appContext || {});
  };

  const renderPassphraseEntryDialog = function(appContext, props) {
    appContext = getAppContext(appContext);
    props = props || {};
    return render(
      <AppContext.Provider value={appContext}>
        <PassphraseEntryDialog debug onClose={props.onClose || jest.fn()}/>
      </AppContext.Provider>
    );
  };

  it("matches the styleguide.", () => {
    const appContext = getAppContext();
    const {container} = renderPassphraseEntryDialog();

    // Dialog title exists and correct.
    const dialogTitle = container.querySelector(".dialog-header h2");
    expect(dialogTitle).not.toBeNull();
    expect(dialogTitle.textContent).toBe("Please enter your passphrase");

    // Close button exists.
    const closeButton = container.querySelector(".dialog-close");
    expect(closeButton).not.toBeNull();

    // Dialog label exists and correct.
    const dialogLabel = container.querySelector(".dialog-content label");
    expect(dialogLabel).not.toBeNull();
    expect(dialogLabel.textContent).toBe("You need your passphrase to continue.");

    // Passphrase input field exists.
    const passphraseInput = container.querySelector("[type=\"password\"][name=\"passphrase\"]");
    expect(passphraseInput).not.toBeNull();
    // Is focus.
    expect(passphraseInput).toBe(document.activeElement);
    // Has the expected style.
    const passphraseInputStyle = window.getComputedStyle(passphraseInput);
    expect(passphraseInputStyle.background).toBe("rgb(0, 0, 0)");
    expect(passphraseInputStyle.color).toBe("rgb(255, 255, 255)");

    // Security token element exists.
    const securityTokenElement = container.querySelector(".security-token");
    expect(securityTokenElement).not.toBeNull();
    expect(securityTokenElement.textContent).toBe("TST");
    // Has the expected style.
    const securityTokenStyle = window.getComputedStyle(securityTokenElement);
    expect(securityTokenStyle.background).toBe("rgb(255, 255, 255)");
    expect(securityTokenStyle.color).toBe("rgb(0, 0, 0)");

    // Remember me checkbox exists.
    const rememberMeInput = container.querySelector("[name=\"rememberMe\"]");
    expect(rememberMeInput).not.toBeNull();
    expect(rememberMeInput.checked).toBe(false);

    // Remember me duration options exists.
    const rememberMeDurationSelect = container.querySelector("[name=\"rememberMeDuration\"]");
    expect(rememberMeDurationSelect).not.toBeNull();
    Object.keys(appContext.rememberMeOptions).forEach(optionKey => {
      const rememberMeDurationOption = container.querySelector(`option[value="${optionKey}"]`);
      expect(rememberMeDurationOption).not.toBeNull();
      expect(rememberMeDurationOption.textContent).toBe(appContext.rememberMeOptions[optionKey]);
    });

    // Submit button exists.
    const submitButton = container.querySelector(".submit-wrapper [type=\"submit\"]");
    expect(submitButton).not.toBeNull();

    // Cancel button exists.
    const cancelButton = container.querySelector(".submit-wrapper .cancel");
    expect(cancelButton).not.toBeNull();
  });

  it("Should not display the remember me section if no remember me options provided", () => {
    const appContext = {
      rememberMeOptions: {}
    };
    const {container} = renderPassphraseEntryDialog(appContext);

    // Remember me checkbox exists.
    const rememberMeInput = container.querySelector("[name=\"rememberMe\"]");
    expect(rememberMeInput).toBeNull();

    // Remember me duration options exists.
    const rememberMeDurationSelect = container.querySelector("[name=\"rememberMeDuration\"]");
    expect(rememberMeDurationSelect).toBeNull();
  });

  it("calls onClose props when clicking on the close button.", () => {
    // Mock the request function to make it return an error.
    jest.spyOn(window.port, 'request').mockImplementation(jest.fn(() => {
      throw new PassboltApiFetchError("Jest simulate API error.");
    }));

    const props = {
      onClose: jest.fn()
    };
    const {container} = renderPassphraseEntryDialog({}, props);

    const leftClick = {button: 0};
    const dialogCloseIcon = container.querySelector(".dialog-close");
    fireEvent.click(dialogCloseIcon, leftClick);
    expect(props.onClose).toBeCalled();
    const error = new UserAbortsOperationError("The dialog has been closed.");
    expect(window.port.emit).toBeCalledWith(undefined, "ERROR", error);
  });

  it("calls onClose props when clicking on the cancel button.", () => {
    // Mock the request function to make it return an error.
    jest.spyOn(window.port, 'request').mockImplementation(jest.fn(() => {
      throw new PassboltApiFetchError("Jest simulate API error.");
    }));

    const props = {
      onClose: jest.fn()
    };
    const {container} = renderPassphraseEntryDialog({}, props);

    const leftClick = {button: 0};
    const cancelButton = container.querySelector(".submit-wrapper .cancel");
    fireEvent.click(cancelButton, leftClick);
    expect(props.onClose).toBeCalled();
    const error = new UserAbortsOperationError("The dialog has been closed.");
    expect(window.port.emit).toBeCalledWith(undefined, "ERROR", error);
  });

  it("changes the style of its security token when the passphrase input get or lose focus.", () => {
    const {container} = renderPassphraseEntryDialog();

    const passphraseInput = container.querySelector("[name=\"passphrase\"]");
    const securityTokenElement = container.querySelector(".security-token");

    /*
     * Passphrase input got focus.
     * Assert style change.
     */
    fireEvent.focus(passphraseInput);
    let securityTokenStyle = window.getComputedStyle(securityTokenElement);
    let passphraseInputStyle = window.getComputedStyle(passphraseInput);
    expect(passphraseInputStyle.background).toBe("rgb(0, 0, 0)");
    expect(passphraseInputStyle.color).toBe("rgb(255, 255, 255)");
    expect(securityTokenStyle.background).toBe("rgb(255, 255, 255)");
    expect(securityTokenStyle.color).toBe("rgb(0, 0, 0)");

    /*
     * Passphrase input lost focus.
     * Assert style
     */
    fireEvent.blur(passphraseInput);
    securityTokenStyle = window.getComputedStyle(securityTokenElement);
    passphraseInputStyle = window.getComputedStyle(passphraseInput);
    expect(passphraseInputStyle.background).toBe("white");
    expect(passphraseInputStyle.color).toBe("");
    expect(securityTokenStyle.background).toBe("rgb(0, 0, 0)");
    expect(securityTokenStyle.color).toBe("rgb(255, 255, 255)");
  });

  it("Should validate the passphrase.", async() => {
    // Mock the request function to make it return an error.
    jest.spyOn(window.port, 'request').mockImplementation(jest.fn(message => {
      if (message == "passbolt.keyring.private.checkpassphrase") {
        throw new Error();
      }
    }));

    const {container} = renderPassphraseEntryDialog();

    // Fill the passphrase input.
    const passphraseInput = container.querySelector("[name=\"passphrase\"]");
    const passphraseInputEvent = {target: {value: "ada@passbolt.com"}};
    fireEvent.change(passphraseInput, passphraseInputEvent);

    // Submit.
    const submitButton = container.querySelector(".submit-wrapper [type=\"submit\"]");
    const leftClick = {button: 0};
    fireEvent.click(submitButton, leftClick);

    await wait();

    // Label changed
    const dialogLabel = container.querySelector(".dialog-content label");
    expect(dialogLabel.textContent).toBe("Please enter a valid passphrase.");

    // Throw passphrase error message
    const errorMessage = container.querySelector(".error.message");
    expect(errorMessage.textContent).toBe("This is not a valid passphrase.");
  });

  it("Should allow only 3 attempts.", async() => {
    // Mock the request function to make it return an error.
    jest.spyOn(window.port, 'request').mockImplementation(jest.fn(message => {
      if (message === "passbolt.keyring.private.checkpassphrase") {
        throw new Error();
      }
    }));

    const props = {
      onClose: jest.fn()
    };
    const {container} = renderPassphraseEntryDialog({}, props);

    // Attempting 3 times with a wrong passphrase.
    const passphraseInput = container.querySelector("[name=\"passphrase\"]");
    const passphraseInputEvent = {target: {value: "ada@passbolt.com"}};
    fireEvent.change(passphraseInput, passphraseInputEvent);
    const submitButton = container.querySelector(".submit-wrapper [type=\"submit\"]");
    const leftClick = {button: 0};
    for (let i = 0; i < 3; i++) {
      fireEvent.click(submitButton, leftClick);
      await wait();
    }

    // Dialog label does not exist.
    const dialogLabel = container.querySelector(".dialog-content label");
    expect(dialogLabel).toBeNull();

    // Feedback message to be displayed
    const formContent = container.querySelector(".form-content");
    expect(formContent).not.toBeNull();
    expect(formContent.textContent).toBe("Your passphrase is wrong! The operation has been aborted.");

    // Close button exists.
    const closeButton = container.querySelector(".button.primary");
    expect(closeButton).not.toBeNull();
    expect(closeButton.textContent).toBe("Close");

    // Clicking on close.
    fireEvent.click(closeButton, leftClick);
    expect(props.onClose).toBeCalled();
    const error = new UserAbortsOperationError("The dialog has been closed.");
    expect(window.port.emit).toBeCalledWith(undefined, "ERROR", error);
  });

  it("Should capture passphrase.", async() => {
    const props = {
      onClose: jest.fn()
    };
    const {container} = renderPassphraseEntryDialog({}, props);

    const leftClick = {button: 0};

    // Fill passphrase.
    const passphraseInput = container.querySelector("[name=\"passphrase\"]");
    const passphraseInputEvent = {target: {value: "ada@passbolt.com"}};
    fireEvent.change(passphraseInput, passphraseInputEvent);

    // Submit.
    const submitButton = container.querySelector(".submit-wrapper [type=\"submit\"]");
    fireEvent.click(submitButton, leftClick);

    await wait();

    // Assert the dialog well respond to the original request call.
    expect(props.onClose).toBeCalled();
    expect(window.port.emit).toBeCalledWith(undefined, "SUCCESS", {
      passphrase: "ada@passbolt.com",
      rememberMe: false
    });
  });

  it("Should capture passphrase and the remember me duration.", async() => {
    const props = {
      onClose: jest.fn()
    };
    const {container} = renderPassphraseEntryDialog({}, props);

    const leftClick = {button: 0};

    // Fill passphrase.
    const passphraseInput = container.querySelector("[name=\"passphrase\"]");
    const passphraseInputEvent = {target: {value: "ada@passbolt.com"}};
    fireEvent.change(passphraseInput, passphraseInputEvent);

    // Check remember me.
    const rememberMeInput = container.querySelector("[name=\"rememberMe\"]");
    fireEvent.click(rememberMeInput, leftClick);

    // Select a remember me duration.
    const rememberMeDurationSelect = container.querySelector("[name=\"rememberMeDuration\"]");
    // Simulate change event, the click on the option does not trigger the onChange event.
    fireEvent.change(rememberMeDurationSelect, {target: {value: "1800"}});

    // Submit.
    const submitButton = container.querySelector(".submit-wrapper [type=\"submit\"]");
    fireEvent.click(submitButton, leftClick);

    await wait();

    // Assert the dialog well respond to the original request call.
    expect(props.onClose).toBeCalled();
    expect(window.port.emit).toBeCalledWith(undefined, "SUCCESS", {
      passphrase: "ada@passbolt.com",
      rememberMe: 1800
    });
  });

  it("Should capture passphrase when no remember me options are provided.", async() => {
    const props = {
      onClose: jest.fn()
    };
    const {container} = renderPassphraseEntryDialog({}, props);

    const leftClick = {button: 0};

    // Fill passphrase.
    const passphraseInput = container.querySelector("[name=\"passphrase\"]");
    const passphraseInputEvent = {target: {value: "ada@passbolt.com"}};
    fireEvent.change(passphraseInput, passphraseInputEvent);

    // Submit button exists.
    const submitButton = container.querySelector(".submit-wrapper [type=\"submit\"]");
    fireEvent.click(submitButton, leftClick);

    await wait();

    // Assert the dialog well respond to the original request call.
    expect(props.onClose).toBeCalled();
    expect(window.port.emit).toBeCalledWith(undefined, "SUCCESS", {
      passphrase: "ada@passbolt.com",
      rememberMe: false
    });
  });
});
