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
 * @since         5.17.0
 */
export const defaultWebauthnRegistrationResponseDto = (data = {}) => ({
  id: "AQIDBAUGBwgJCgsMDQ4PEA",
  rawId: "AQIDBAUGBwgJCgsMDQ4PEA",
  type: "public-key",
  response: {
    clientDataJSON: "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIn0",
    attestationObject: "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YVg",
    transports: ["internal"],
  },
  authenticatorAttachment: "platform",
  clientExtensionResults: {},
  ...data,
});
