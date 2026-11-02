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
import { defaultWebauthnRegistrationResponseDto } from "./webauthnRegistrationResponseEntity.test.data";
import WebauthnSetupCeremonyEntity from "./webauthnSetupCeremonyEntity";

export const defaultWebauthnSetupCeremonyDto = (data = {}) => ({
  id: "8e3874ae-4b40-590b-968a-418f704b9d9a",
  tab_id: 1,
  handle: "5f2ab5a4-9dd7-4a7c-a0fd-2d8f4b1b3f0c",
  started_at: new Date().toISOString(),
  ...data,
});

export const webauthnSetupCeremonyWithCredentialDto = (data = {}) =>
  defaultWebauthnSetupCeremonyDto({
    credential: defaultWebauthnRegistrationResponseDto(),
    aaguid: "fbfc3007-154e-4ecc-8c0b-6e020557d7bd",
    ...data,
  });

export const expiredWebauthnSetupCeremonyDto = (data = {}) =>
  defaultWebauthnSetupCeremonyDto({
    started_at: new Date(Date.now() - WebauthnSetupCeremonyEntity.TTL_MS - 1000).toISOString(),
    ...data,
  });
