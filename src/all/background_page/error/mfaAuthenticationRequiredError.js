/**
 * MFA authentication is required error.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;

class MfaAuthenticationRequiredError extends Error {
  constructor(message){
    message = message || __('MFA authentication is required.');
    super(message);
    this.name = 'MfaAuthenticationRequiredError';
  }
}

exports.MfaAuthenticationRequiredError = MfaAuthenticationRequiredError;
