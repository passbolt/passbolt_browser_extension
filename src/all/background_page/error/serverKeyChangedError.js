/**
 * Key expired error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class ServerKeyChangedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerKeyChangedError';
  }
}

export default ServerKeyChangedError;
