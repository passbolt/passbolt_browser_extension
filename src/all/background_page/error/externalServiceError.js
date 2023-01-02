/**
 * External service error
 *
 * @copyright (c) 2023 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import i18n from "../sdk/i18n";

class ExternalServiceError extends Error {
  constructor(message) {
    message = message || i18n.t('The external service raised an error');
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export default ExternalServiceError;
