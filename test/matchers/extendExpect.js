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

import {toThrowEntityValidationErrorOnProperties} from "./toThrowEntityValidationErrorOnProperties";
import {toBeOpenpgpKeySignedBy} from "./toBeOpenpgpKeySignedBy";
import {toBeOpenpgpPublicKey} from "./toBeOpenpgpPublicKey";
import {toBeOpenpgpRevokedKey} from "./toBeOpenpgpRevokedKey";
import {toBeEqualToOpenpgpKey} from "./toBeEqualToOpenpgpKey";
import {toBeOpenpgpPrivateKey} from "./toBeOpenpgpPrivateKey";
import {toThrowCollectionValidationError} from "./toThrowCollectionValidationError";
import {toThrowEntityValidationError} from "./toThrowEntityValidationError";

const extensions = {
  toBeEqualToOpenpgpKey,
  toBeOpenpgpKeySignedBy,
  toBeOpenpgpPrivateKey,
  toBeOpenpgpPublicKey,
  toBeOpenpgpRevokedKey,
  toThrowEntityValidationErrorOnProperties,
  toThrowCollectionValidationError,
  toThrowEntityValidationError
};

expect.extend(extensions);
