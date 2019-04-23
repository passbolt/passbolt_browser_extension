/**
 * Bad response
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class PassboltBadResponseError extends Error {
  constructor(message, data) {
    message = message || "Bad response";
    super(message)
    this.name = 'PassboltBadResponseError';
    this.data = data || {};
  }
}

exports.PassboltBadResponseError = PassboltBadResponseError;
