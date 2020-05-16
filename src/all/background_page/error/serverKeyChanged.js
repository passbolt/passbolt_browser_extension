/**
 * Key expired error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class ServerKeyChanged extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerKeyChanged';
  }
}

exports.ServerKeyChanged = ServerKeyChanged;
