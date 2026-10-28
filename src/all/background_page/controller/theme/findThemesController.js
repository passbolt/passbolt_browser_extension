/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         5.18.0
 */

import FindThemesService from "../../service/theme/findThemesService";

class FindThemesController {
  /**
   * Constructor
   *
   * @param {Worker} worker The associated worker
   * @param {string} requestId The associated request id
   * @param {ApiClientOptions} apiClientOptions The api client options
   */
  constructor(worker, requestId, apiClientOptions) {
    this.worker = worker;
    this.requestId = requestId;
    this.findThemesService = new FindThemesService(apiClientOptions);
  }
  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      const result = await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS", result);
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }
  /**
   * Find all the themes
   * @returns {Promise<ThemesCollection>}
   * @throws {CollectionValidationError} If the API returns invalid themes
   */
  async exec() {
    return this.findThemesService.findAll();
  }
}
export default FindThemesController;
