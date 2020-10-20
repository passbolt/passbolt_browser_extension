/**
 * Application error
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

class ImportCsvError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ImportCsvError';
  }
}

exports.ImportCsvError = ImportCsvError;
