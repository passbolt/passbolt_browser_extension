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

import ChangeThemeEntity from "../../model/entity/theme/change/ChangeThemeEntity";
import UpdateThemeService from "../../service/theme/updateThemeService";

class UpdateThemeController {
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
    this.updateThemeService = new UpdateThemeService(apiClientOptions);
  }
  /**
   * Controller executor.
   * @returns {Promise<void>}
   */
  async _exec() {
    try {
      await this.exec.apply(this, arguments);
      this.worker.port.emit(this.requestId, "SUCCESS");
    } catch (error) {
      console.error(error);
      this.worker.port.emit(this.requestId, "ERROR", error);
    }
  }
  /**
   * Update the current user theme
   * @param {string} name The theme name to apply
   * @returns {Promise<void>}
   * @throws {EntityValidationError} If the name is not a valid theme name
   */
  async exec(name) {
    const changeThemeEntity = new ChangeThemeEntity({ name });
    await this.updateThemeService.update(changeThemeEntity);
  }
}
export default UpdateThemeController;
