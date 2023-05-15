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
 * @since         4.2.0
 */

describe("GetOrFindPasswordPoliciesController::exec", () => {
  it.todo("Should return the default password policies if API endpoint doesn't exist");
  it.todo("Should throw an error if something wrong happens on the API");

  it.todo("should ask the API for the current configuration and handle an old settings format");
  it.todo("should ask the API for the current configuration and handle a new settings format");
  it.todo("should fallback to the old endpoint in case the new one is not availabled");

  it.todo("should not ask the API if there is an existing configuration on the local storage and handle an old settings format");
  it.todo("should not ask the API if there is an existing configuration on the local storage and handle a new settings format");

  it.todo("should save the full password policy settings on the local storage and retrieve it later");

  it.todo("should not take, from the API, settings that generate too weak passwords and use the default generator instead");
  it.todo("should not take, from the local storage, settings that generate too weak passwords and use the default generator instead");
});
