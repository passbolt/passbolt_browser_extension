/**
 * Network error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class PassboltServiceUnavailableError extends Error {
  constructor(message) {
    message = message || "The service is unavailable";
    super(message)
    this.name = 'PassboltServiceUnavailableError';
  }
}

exports.PassboltServiceUnavailableError = PassboltServiceUnavailableError;
