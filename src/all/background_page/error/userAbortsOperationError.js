/**
 * Users aborts operation error.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class UserAbortsOperationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserAbortsOperationError';
  }
}

export default UserAbortsOperationError;
