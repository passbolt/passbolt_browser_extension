/**
 * Bad response
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
class PassboltBadResponseError extends Error {
  constructor() {
    super("An internal error occurred. The server response could not be parsed. Please contact your administrator.");
    this.name = 'PassboltBadResponseError';
  }
}

exports.PassboltBadResponseError = PassboltBadResponseError;
