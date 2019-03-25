/**
 * Login page.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.quickaccess = passbolt.quickaccess || {};

$(function () {

  passbolt.quickaccess.bootstrap = function () {
    passbolt.message.on('passbolt.quickaccess.fill-form', fillForm);
  };

  const fillForm = function (requestId, username, secret) {
    try {
      const passwordElement = getPasswordElement();
      const usernameElement = getUsernameElement(passwordElement);
      if (usernameElement) {
        fireEvent.change(usernameElement, { target: { value: username } });
      }
      fireEvent.change(passwordElement, { target: { value: secret } });
      passbolt.message.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      passbolt.message.emit(requestId, 'ERROR', { name: "Error", message: error.message });
    }
  };

  const getPasswordElement = function () {
    const passwordElement = document.querySelector("input[type='password']:not([disabled])");
    if (!passwordElement) {
      throw new Error('No password element found on the page');
    }

    return passwordElement;
  }

  const getUsernameElement = function (element) {
    const parentElement = element.parentElement;
    if (!parentElement) {
      return false;
    }

    let usernameElement = parentElement.querySelector("input[type='email']:not([disabled])");
    if (!usernameElement) {
      usernameElement = parentElement.querySelector("input[type='text']:not([disabled])");
    }

    if (!usernameElement) {
      return getUsernameElement(parentElement);
    }

    return usernameElement;
  };

});
undefined; // result must be structured-clonable data
