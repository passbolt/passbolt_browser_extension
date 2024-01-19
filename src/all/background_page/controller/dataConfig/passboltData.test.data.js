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
 * @since         4.6.0
 */

export const defaultPassboltData = (data = {}) => ({
  config: {
    "user.settings.securityToken.code": "TST",
    "user.settings.securityToken.color": "#f44336",
    "user.settings.securityToken.textColor": "#ffffff",
    "user.settings.trustedDomain": (new URL(window.location.href)).origin,
    "user.id": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
    "user.username": "admin@passbolt.com",
    "user.firstname": "Admin",
    "user.lastname": "User",
    "user.settings.locale": "fr-FR",
    "user.settings.theme": "midgar",
  },
  ...data,
});
