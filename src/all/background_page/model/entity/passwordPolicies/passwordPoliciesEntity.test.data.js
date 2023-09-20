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
 * @since         4.3.0
 */

import {defaultPassphraseGeneratorSettings} from "./passphraseGeneratorSettingsEntity.test.data";
import {defaultPasswordGeneratorSettings} from "./passwordGeneratorSettingsEntity.test.data";

export const defaultPasswordPolicies = (data = {}) => {
  const defaultData = {
    default_generator: "password",
    external_dictionary_check: true,
    password_generator_settings: defaultPasswordGeneratorSettings(),
    passphrase_generator_settings: defaultPassphraseGeneratorSettings(),
  };
  return Object.assign(defaultData, data);
};
