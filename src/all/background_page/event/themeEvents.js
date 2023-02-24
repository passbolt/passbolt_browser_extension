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
import User from "../model/user";
import ThemeModel from "../model/theme/themeModel";
import ChangeThemeEntity from "../model/entity/theme/change/ChangeThemeEntity";


const listen = function(worker) {
  /*
   * Find all themes
   *
   * @listens passbolt.themes.find-all
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.themes.find-all', async requestId => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const themeModel = new ThemeModel(clientOptions);
      const themes = await themeModel.findAll();
      worker.port.emit(requestId, 'SUCCESS', themes);
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Change the current user theme
   *
   * @listens passbolt.themes.change
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.themes.change', async(requestId, name) => {
    try {
      const clientOptions = await User.getInstance().getApiClientOptions();
      const themeModel = new ThemeModel(clientOptions);
      const changeThemeEntity = new ChangeThemeEntity({name: name});
      await themeModel.change(changeThemeEntity);
      worker.port.emit(requestId, 'SUCCESS');
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

export const ThemeEvents = {listen};
