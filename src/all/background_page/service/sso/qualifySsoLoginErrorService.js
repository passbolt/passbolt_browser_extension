import SsoDisabledError from "../../error/ssoDisabledError";
import SsoProviderMismatchError from "../../error/ssoProviderMismatchError";
import SsoDataStorage from "../indexedDB_storage/ssoDataStorage";

/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
const UNEXPECTED_SSO_LOGIN_ERROR = new Error("Unexpected SSO Login error");

class QualifySsoLoginErrorService {
  /**
   * Qualifies an occured SSO login error based on the given configuration
   *
   * @param {Object} ssoSettings the settings from which to qualify an error
   * @return {Promise<Error>}
   */
  static async qualifyErrorFromConfiguration(ssoSettings) {
    const localSsoKit = await SsoDataStorage.get();
    if (!localSsoKit) {
      // This means a login attempt has been made without a local kit which should not happen in this scenario
      return UNEXPECTED_SSO_LOGIN_ERROR;
    }

    if (!ssoSettings.provider) {
      // the provider is empty meaning that an admin disabled the configuration.
      return new SsoDisabledError("The SSO is disabled");
    }

    if (ssoSettings.provider !== localSsoKit.provider) {
      // there is a provider set so it means an admin changed the SSO provider
      return new SsoProviderMismatchError("The request SSO provider is not corresponding to the configured one", ssoSettings.provider);
    }

    // This means both configured provider and local provider are the same which should not happen in this scenario
    return UNEXPECTED_SSO_LOGIN_ERROR;
  }
}

export default QualifySsoLoginErrorService;
