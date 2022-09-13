/**
 * Bad response
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";

class PassboltBadResponseError extends Error {
  constructor(error, response) {
    super(i18n.t('An internal error occurred. The server response could not be parsed. Please contact your administrator.'));
    this.name = 'PassboltBadResponseError';
    this.srcError = error;
    this.srcResponse = response;
  }
}

export default PassboltBadResponseError;
