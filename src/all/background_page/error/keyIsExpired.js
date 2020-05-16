/**
 * Key expired error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class KeyIsExpired extends Error {
  constructor(message) {
    super(message);
    this.name = 'KeyIsExpired';
  }
}

exports.KeyIsExpired = KeyIsExpired;
