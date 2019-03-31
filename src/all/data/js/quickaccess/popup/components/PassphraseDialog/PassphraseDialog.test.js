import React from "react";
import { render, fireEvent, wait, cleanup } from 'react-testing-library';
import PassphraseDialog from "./PassphraseDialog";
import AppContext from "../../contexts/AppContext";

// Reset the modules before each test.
beforeEach(() => {
  jest.resetModules();
});

// Cleanup after each test.
afterEach(cleanup);

describe("PassphraseDialog", () => {

  it("should execute the onComplete prop function when the passphrase is correct", async () => {
    const onComplete = jest.fn();
    const appContext = {
      user: {
        "user.settings.securityToken.code": "COD"
      }
    };
    const component = render(
      <AppContext.Provider value={appContext}>
        <PassphraseDialog debug onComplete={onComplete} />
      </AppContext.Provider>
    );
    // mock the passbolt messaging layer.
    window.passbolt = {
      message: {
        emit: () => new Promise(resolve => resolve())
      },
      request: () => new Promise(resolve => resolve())
    };

    // Fill the passphrase input.
    const passphraseInput = component.container.querySelector('[name="passphrase"]');
    const event = { target: { value: "admin@passbolt.com" } };
    fireEvent.change(passphraseInput, event);

    // Click on submit.
    const submitButton = component.container.querySelector('input[type="submit"]');
    fireEvent.click(submitButton, { button: 0 });

    await wait();
    expect(onComplete).toHaveBeenCalled();
  });

});
