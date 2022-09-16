/**
 * Network error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";

class PassboltServiceUnavailableError extends Error {
  constructor(message) {
    message = message || i18n.t('The service is unavailable');
    super(message);
    this.name = 'PassboltServiceUnavailableError';
  }
}

export default PassboltServiceUnavailableError;
