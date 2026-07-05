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
 * @since         5.14.0
 */
import browser from "webextension-polyfill";
import Fido2PinService from "./fido2PinService";

/**
 * Install a working in-memory browser.storage.local so setPin can be read back by unlockPassphrase
 * (the default webextension mock does not persist across get/set).
 * @returns {object} the backing store
 */
const useInMemoryStorage = () => {
  const store = {};
  jest.spyOn(browser.storage.local, "set").mockImplementation(async (items) => {
    Object.assign(store, items);
  });
  jest.spyOn(browser.storage.local, "get").mockImplementation(async (key) => {
    if (typeof key === "string") {
      return key in store ? { [key]: store[key] } : {};
    }
    return { ...store };
  });
  jest.spyOn(browser.storage.local, "remove").mockImplementation(async (key) => {
    delete store[key];
  });
  return store;
};

const account = { userId: "d57c10f5-639d-5160-9c81-8a0c6c4ec856" };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Fido2PinService", () => {
  describe("::setPin / ::unlockPassphrase", () => {
    it("seals the passphrase under the PIN and recovers it with the same PIN", async () => {
      expect.assertions(3);
      useInMemoryStorage();
      const service = new Fido2PinService(account);
      const passphrase = "this is the master passphrase";

      expect(await service.isPinSet()).toBe(false);
      await service.setPin("123456", passphrase);
      expect(await service.isPinSet()).toBe(true);

      const recovered = await service.unlockPassphrase("123456");
      expect(recovered).toBe(passphrase);
    });

    it("never stores the passphrase in the clear", async () => {
      expect.assertions(2);
      const store = useInMemoryStorage();
      const service = new Fido2PinService(account);
      const passphrase = "super-secret-passphrase";

      await service.setPin("4242", passphrase);

      const record = store[`fido2-passkey-pin-${account.userId}`];
      const serialized = JSON.stringify(record);
      expect(serialized).not.toContain(passphrase);
      // The blob only carries salt, iv and ciphertext.
      expect(Object.keys(record).sort()).toStrictEqual(["ciphertext", "iv", "salt"]);
    });

    it("rejects the wrong PIN with an AES-GCM authentication failure", async () => {
      expect.assertions(1);
      useInMemoryStorage();
      const service = new Fido2PinService(account);
      await service.setPin("123456", "the passphrase");

      await expect(service.unlockPassphrase("654321")).rejects.toThrow("The passkey PIN is incorrect.");
    });

    it("throws when unlocking with no PIN set", async () => {
      expect.assertions(1);
      useInMemoryStorage();
      const service = new Fido2PinService(account);

      await expect(service.unlockPassphrase("123456")).rejects.toThrow("No passkey PIN is set.");
    });

    it("throws on an empty PIN attempt once a PIN is set", async () => {
      expect.assertions(1);
      useInMemoryStorage();
      const service = new Fido2PinService(account);
      await service.setPin("123456", "the passphrase");

      await expect(service.unlockPassphrase("")).rejects.toThrow("The passkey PIN is incorrect.");
    });
  });

  describe("::setPin validation", () => {
    it("rejects a PIN that is not 4 to 12 digits", async () => {
      expect.assertions(3);
      useInMemoryStorage();
      const service = new Fido2PinService(account);

      await expect(service.setPin("123", "passphrase")).rejects.toThrow("The PIN must be 4 to 12 digits.");
      await expect(service.setPin("abcd", "passphrase")).rejects.toThrow("The PIN must be 4 to 12 digits.");
      await expect(service.setPin("1234567890123", "passphrase")).rejects.toThrow("The PIN must be 4 to 12 digits.");
    });

    it("requires a non-empty passphrase", async () => {
      expect.assertions(1);
      useInMemoryStorage();
      const service = new Fido2PinService(account);

      await expect(service.setPin("123456", "")).rejects.toThrow("The passphrase is required to set a passkey PIN.");
    });
  });

  describe("::verifyPin", () => {
    it("returns true when no PIN is configured (nothing to verify)", async () => {
      expect.assertions(1);
      useInMemoryStorage();
      const service = new Fido2PinService(account);

      expect(await service.verifyPin("anything")).toBe(true);
    });

    it("returns true for the correct PIN and false for a wrong one", async () => {
      expect.assertions(2);
      useInMemoryStorage();
      const service = new Fido2PinService(account);
      await service.setPin("123456", "the passphrase");

      expect(await service.verifyPin("123456")).toBe(true);
      expect(await service.verifyPin("000000")).toBe(false);
    });
  });

  describe("::clearPin", () => {
    it("removes the stored PIN blob", async () => {
      expect.assertions(2);
      useInMemoryStorage();
      const service = new Fido2PinService(account);
      await service.setPin("123456", "the passphrase");
      expect(await service.isPinSet()).toBe(true);

      await service.clearPin();
      expect(await service.isPinSet()).toBe(false);
    });
  });

  describe("::constructor", () => {
    it("keys storage per account, falling back to id then default", () => {
      expect.assertions(3);
      expect(new Fido2PinService({ userId: "user-1" }).storageKey).toBe("fido2-passkey-pin-user-1");
      expect(new Fido2PinService({ id: "acct-1" }).storageKey).toBe("fido2-passkey-pin-acct-1");
      expect(new Fido2PinService({}).storageKey).toBe("fido2-passkey-pin-default");
    });
  });
});
