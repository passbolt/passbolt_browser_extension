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
 */
const {LocaleController} = require("../controller/locale/localeController");
const {User} = require('../model/user');

const listen = async function (worker) {
  /*
   * Get locale language
   *
   * @listens passbolt.locale.get
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.language.get', async function(requestId) {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const localeController = new LocaleController(worker, apiClientOptions);
    try {
      const localeEntity = await localeController.getLocale();
      worker.port.emit(requestId, 'SUCCESS', localeEntity);
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Update the locale language
   *
   * @listens passbolt.locale.language.update
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.locale.language.update', async function(requestId, localDto) {
    const apiClientOptions = await User.getInstance().getApiClientOptions();
    const localeController = new LocaleController(worker, apiClientOptions);
    try {
      await localeController.updateLocale(localDto);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
}

exports.listen = listen;
