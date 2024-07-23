/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.6.0
 */

import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

export const adaExternalPrivateGpgKeyEntityDto = (data = {}) => {
  const defaultData = {
    "armored_key": pgpKeys.ada.private,
    "key_id": pgpKeys.ada.key_id,
    "user_ids": pgpKeys.ada.user_ids,
    "fingerprint": pgpKeys.ada.fingerprint,
    "expires": pgpKeys.ada.expires,
    "created": pgpKeys.ada.created,
    "algorithm": pgpKeys.ada.algorithm.toLowerCase(),
    "length": pgpKeys.ada.length,
    "curve": pgpKeys.ada.curve,
    "private": true,
    "revoked": pgpKeys.ada.revoked
  };

  return Object.assign(defaultData, data);
};
