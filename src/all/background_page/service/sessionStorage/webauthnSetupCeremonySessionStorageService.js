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
import WebauthnSetupCeremonyEntity from "../../model/entity/mfa/webauthnSetupCeremonyEntity";
import { assertType } from "../../utils/assertions";

const WEBAUTHN_SETUP_CEREMONY_KEY = "webauthn-setup-ceremony";

/**
 * Keeps the pending WebAuthn setup ceremony across service worker restarts.
 */
class WebauthnSetupCeremonySessionStorageService {
  /**
   * Get the pending ceremony.
   * @returns {Promise<WebauthnSetupCeremonyEntity|null>}
   */
  static async get() {
    const storageData = await browser.storage.session.get(WEBAUTHN_SETUP_CEREMONY_KEY);
    const dto = storageData?.[WEBAUTHN_SETUP_CEREMONY_KEY];
    return dto ? new WebauthnSetupCeremonyEntity(dto) : null;
  }

  /**
   * Store the pending ceremony, replacing any previous one.
   * @param {WebauthnSetupCeremonyEntity} ceremony
   * @throws {Error} If the ceremony is not a WebauthnSetupCeremonyEntity
   * @returns {Promise<void>}
   */
  static async set(ceremony) {
    assertType(
      ceremony,
      WebauthnSetupCeremonyEntity,
      "The ceremony is not a WebauthnSetupCeremonyEntity, storage has not been set",
    );

    await navigator.locks.request(WEBAUTHN_SETUP_CEREMONY_KEY, async () => {
      await browser.storage.session.set({ [WEBAUTHN_SETUP_CEREMONY_KEY]: ceremony.toDto() });
    });
  }

  /**
   * Flush the pending ceremony.
   * @returns {Promise<void>}
   */
  static async flush() {
    await navigator.locks.request(WEBAUTHN_SETUP_CEREMONY_KEY, async () => {
      await browser.storage.session.remove(WEBAUTHN_SETUP_CEREMONY_KEY);
    });
  }
}

export default WebauthnSetupCeremonySessionStorageService;
