/**
 * MFA authentication is required error.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";

class MfaAuthenticationRequiredError extends Error {
  /**
   * Retrieve the error details for the windows app
   * @param message
   * @param {object} errors details
   */
  constructor(message, details) {
    message = message || i18n.t('MFA authentication is required.');
    super(message);
    this.name = 'MfaAuthenticationRequiredError';
    this.details = details;
  }
}

export default MfaAuthenticationRequiredError;
