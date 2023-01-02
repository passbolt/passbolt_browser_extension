/**
 * Network error when calling external service
 *
 * @copyright (c) 2023 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";

class ExternalServiceUnavailableError extends Error {
  constructor(message) {
    message = message || i18n.t('The external service is unavailable');
    super(message);
    this.name = 'ExternalServiceUnavailableError';
  }
}

export default ExternalServiceUnavailableError;
