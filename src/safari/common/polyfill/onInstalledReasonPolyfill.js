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
 * @since         5.5.0
 */

function setOnInstalledReason(browserRuntime) {
  if (!browserRuntime.OnInstalledReason) {
    browserRuntime.OnInstalledReason = {};
  }

  if (!browserRuntime.OnInstalledReason.INSTALL) {
    browserRuntime.OnInstalledReason.INSTALL = "install";
  }

  if (!browserRuntime.OnInstalledReason.UPDATE) {
    browserRuntime.OnInstalledReason.UPDATE = "update";
  }

  if (!browserRuntime.OnInstalledReason.CHROME_UPDATE) {
    browserRuntime.OnInstalledReason.CHROME_UPDATE = "chrome_update";
  }

  if (!browserRuntime.OnInstalledReason.BROWSER_UPDATE) {
    browserRuntime.OnInstalledReason.BROWSER_UPDATE = "browser_update";
  }
}

module.exports = setOnInstalledReason;
