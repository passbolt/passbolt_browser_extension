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
 * @since         5.12.1
 */

import AutofillSettingsService from "./autofillSettingsService";

beforeEach(async () => {
  await browser.storage.local.clear();
  jest.clearAllMocks();
});

describe("AutofillSettingsService", () => {
  describe("::get", () => {
    it("returns the safe (off) default when nothing is stored", async () => {
      expect(await AutofillSettingsService.get()).toEqual({ autofillOnLaunch: false });
    });

    it("returns autofillOnLaunch true when stored true", async () => {
      await browser.storage.local.set({ "passbolt-autofill-settings": { autofillOnLaunch: true } });
      expect(await AutofillSettingsService.get()).toEqual({ autofillOnLaunch: true });
    });

    it("strictly normalises truthy-but-non-true stored values to false", async () => {
      await browser.storage.local.set({ "passbolt-autofill-settings": { autofillOnLaunch: "true" } });
      expect(await AutofillSettingsService.get()).toEqual({ autofillOnLaunch: false });
    });
  });

  describe("::set", () => {
    it("persists and returns a strict boolean", async () => {
      expect(await AutofillSettingsService.set({ autofillOnLaunch: true })).toEqual({ autofillOnLaunch: true });
      expect(await AutofillSettingsService.get()).toEqual({ autofillOnLaunch: true });
    });

    it("coerces non-true input to false", async () => {
      expect(await AutofillSettingsService.set({ autofillOnLaunch: "yes" })).toEqual({ autofillOnLaunch: false });
      expect(await AutofillSettingsService.set(undefined)).toEqual({ autofillOnLaunch: false });
    });
  });
});
