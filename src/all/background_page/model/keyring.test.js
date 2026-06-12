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
 * @since         5.13.0
 */
import { enableFetchMocks } from "jest-fetch-mock";
import { v4 as uuidv4 } from "uuid";
import { pgpKeys } from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import Keyring from "./keyring";
import UserSettings from "./userSettings/userSettings";

beforeAll(() => {
  enableFetchMocks();
});

beforeEach(() => {
  jest.restoreAllMocks();
  fetch.resetMocks();
  jest.spyOn(UserSettings.prototype, "getDomain").mockImplementation(() => "https://passbolt.dev");
  new Keyring().flush(Keyring.PUBLIC);
});

const syncResponse = (body) => JSON.stringify({ header: { servertime: "2026-06-02T00:00:00+00:00" }, body });

describe("Keyring", () => {
  describe("::sync", () => {
    it("should store every synced public key, tagged with its user id", async () => {
      expect.assertions(5);
      const keyring = new Keyring();
      const adaId = uuidv4();
      const bettyId = uuidv4();
      fetch.mockResponseOnce(
        syncResponse([
          { user_id: adaId, armored_key: pgpKeys.ada.public },
          { user_id: bettyId, armored_key: pgpKeys.betty.public },
        ]),
      );

      const count = await keyring.sync();

      const publicKeys = keyring.getPublicKeysFromStorage();
      expect(count).toEqual(2);
      expect(publicKeys[adaId]).toBeDefined();
      expect(publicKeys[adaId].user_id).toEqual(adaId);
      expect(publicKeys[bettyId]).toBeDefined();
      expect(publicKeys[bettyId].user_id).toEqual(bettyId);
    });

    it("should persist the keyring only once, not once per key (O(n^2) regression guard)", async () => {
      expect.assertions(2);
      const keyring = new Keyring();
      // Reuse one armored key across many distinct users — we only assert the persistence strategy.
      const body = Array.from({ length: 50 }, () => ({ user_id: uuidv4(), armored_key: pgpKeys.ada.public }));
      fetch.mockResponseOnce(syncResponse(body));
      const storeSpy = jest.spyOn(Keyring.prototype, "store");

      await keyring.sync();

      expect(Object.keys(keyring.getPublicKeysFromStorage())).toHaveLength(50);
      // The bug stored the whole keyring once per key (50 times); the fix stores once.
      expect(storeSpy).toHaveBeenCalledTimes(1);
    });

    it("should ignore body entries missing an armored key or user id", async () => {
      expect.assertions(2);
      const keyring = new Keyring();
      const adaId = uuidv4();
      fetch.mockResponseOnce(
        syncResponse([
          { user_id: adaId, armored_key: pgpKeys.ada.public },
          { user_id: uuidv4() }, // missing armored_key
          { armored_key: pgpKeys.betty.public }, // missing user_id
        ]),
      );

      const count = await keyring.sync();

      expect(count).toEqual(1);
      expect(keyring.getPublicKeysFromStorage()[adaId]).toBeDefined();
    });
  });

  describe("::importPublic", () => {
    it("should still import and store a single public key", async () => {
      expect.assertions(2);
      const keyring = new Keyring();
      const adaId = uuidv4();
      const storeSpy = jest.spyOn(Keyring.prototype, "store");

      await keyring.importPublic(pgpKeys.ada.public, adaId);

      expect(keyring.getPublicKeysFromStorage()[adaId].user_id).toEqual(adaId);
      expect(storeSpy).toHaveBeenCalledTimes(1);
    });

    it("should reject an invalid user id", async () => {
      expect.assertions(1);
      const keyring = new Keyring();
      await expect(keyring.importPublic(pgpKeys.ada.public, "not-a-uuid")).rejects.toThrow("The user id is not valid");
    });
  });
});
