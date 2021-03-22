/**
 * MFA authentication is required error.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
const {i18n} = require('../sdk/i18n');

class MfaAuthenticationRequiredError extends Error {
  constructor(message){
    message = message || i18n.t('MFA authentication is required.');
    super(message);
    this.name = 'MfaAuthenticationRequiredError';
  }
}

exports.MfaAuthenticationRequiredError = MfaAuthenticationRequiredError;
