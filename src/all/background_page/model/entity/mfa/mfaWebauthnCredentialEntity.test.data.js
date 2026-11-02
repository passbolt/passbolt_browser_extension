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
import { v4 as uuidv4 } from "uuid";

export const defaultMfaWebauthnCredentialDto = (data = {}) => ({
  id: uuidv4(),
  credential_id: "AZv1kKjbTxOX8BRWmQE1bPQmnPX5Gm0ARgqVGaM_UZo",
  aaguid: "adce0002-35bc-c60a-648b-0b25f1f05503",
  name: "My passkey",
  sign_count: 3,
  last_used: "2026-09-10T10:00:00+00:00",
  created: "2026-09-01T10:00:00+00:00",
  modified: "2026-09-10T10:00:00+00:00",
  ...data,
});
