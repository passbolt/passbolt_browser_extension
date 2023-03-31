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
 * @since         hackaton
 */

import {PassphraseGenerator} from '../../utils/secret/passphraseGenerator';
import {PasswordGenerator} from '../../utils/secret/passwordGenerator';

class GenerateSecretService {
  /**
   * Generate a secret given a generator configuration
   * @param configuration A generator configuration
   * @return {string} A generated secret
   */
  generate(configuration) {
    const {type} = configuration;
    if (type === 'password') {
      return PasswordGenerator.generate(configuration);
    } else if (type === 'passphrase') {
      return PassphraseGenerator.generate(configuration);
    }
  }
}

export default GenerateSecretService;
