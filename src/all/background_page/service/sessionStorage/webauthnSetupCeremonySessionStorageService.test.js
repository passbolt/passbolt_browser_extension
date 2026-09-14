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
import WebauthnSetupCeremonySessionStorageService from "./webauthnSetupCeremonySessionStorageService";
import WebauthnSetupCeremonyEntity from "../../model/entity/mfa/webauthnSetupCeremonyEntity";
import { defaultWebauthnSetupCeremonyDto } from "../../model/entity/mfa/webauthnSetupCeremonyEntity.test.data";

describe("WebauthnSetupCeremonySessionStorageService", () => {
  beforeEach(async () => {
    await browser.storage.session.clear();
  });

  describe("WebauthnSetupCeremonySessionStorageService::get", () => {
    it("returns null when nothing is stored", async () => {
      expect.assertions(1);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });
  });

  describe("WebauthnSetupCeremonySessionStorageService::set", () => {
    it("stores the ceremony and keeps only the last one", async () => {
      expect.assertions(2);
      const ceremony1 = new WebauthnSetupCeremonyEntity(defaultWebauthnSetupCeremonyDto({ tab_id: 1 }));
      const ceremony2 = new WebauthnSetupCeremonyEntity(defaultWebauthnSetupCeremonyDto({ tab_id: 2 }));
      await WebauthnSetupCeremonySessionStorageService.set(ceremony1);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(ceremony1);
      await WebauthnSetupCeremonySessionStorageService.set(ceremony2);
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toEqual(ceremony2);
    });

    it("throws if the ceremony is not a WebauthnSetupCeremonyEntity", async () => {
      expect.assertions(2);
      await expect(WebauthnSetupCeremonySessionStorageService.set(defaultWebauthnSetupCeremonyDto())).rejects.toThrow(
        "The ceremony is not a WebauthnSetupCeremonyEntity, storage has not been set",
      );
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });
  });

  describe("WebauthnSetupCeremonySessionStorageService::flush", () => {
    it("removes the stored ceremony", async () => {
      expect.assertions(1);
      await WebauthnSetupCeremonySessionStorageService.set(
        new WebauthnSetupCeremonyEntity(defaultWebauthnSetupCeremonyDto()),
      );
      await WebauthnSetupCeremonySessionStorageService.flush();
      expect(await WebauthnSetupCeremonySessionStorageService.get()).toBeNull();
    });
  });
});
