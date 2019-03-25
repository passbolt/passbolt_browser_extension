/**
 * Invalid master password error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;

class InvalidMasterPasswordError extends Error {
  constructor(message){
    message = message || __('This is not a valid passphrase');
    super(message);
    this.name = 'InvalidMasterPasswordError';
  }
}

exports.InvalidMasterPasswordError = InvalidMasterPasswordError;
