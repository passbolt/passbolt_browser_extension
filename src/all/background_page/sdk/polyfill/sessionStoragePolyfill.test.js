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
 * @since         3.8.0
 */
import browser from "./browserPolyfill";

describe("SessionStorage", () => {
  beforeEach(async() => {
    await browser.storage.session.clear();
  });

  describe("SessionStorage::set", () => {
    it("Should create new values when the storage is empty", async() => {
      expect.assertions(2);

      const dataToSet = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };

      //ensure the storage is empty
      const emptyStorage = await browser.storage.session.get();
      expect(emptyStorage).toEqual({});

      await browser.storage.session.set(dataToSet);
      const newStorage = await browser.storage.session.get();
      expect(newStorage).toEqual(dataToSet);
    });

    it("Should replace the existing values", async() => {
      expect.assertions(2);

      const originalData = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };
      const newData = {
        keyB: "valueB-bis",
        keyC: "valueC-bis"
      };

      await browser.storage.session.set(originalData);
      const originalStorage = await browser.storage.session.get();
      expect(originalStorage).toEqual(originalData);

      await browser.storage.session.set(newData);
      const newStorage = await browser.storage.session.get();
      expect(newStorage).toEqual(Object.assign({}, originalData, newData));
    });

    it("Should replace and create new values", async() => {
      expect.assertions(2);

      const originalData = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };
      const newData = {
        keyB: "valueB-bis",
        keyC: "valueC-bis",
        keyD: "valueD"
      };

      await browser.storage.session.set(originalData);
      const originalStorage = await browser.storage.session.get();
      expect(originalStorage).toEqual(originalData);

      await browser.storage.session.set(newData);
      const newStorage = await browser.storage.session.get();
      expect(newStorage).toEqual(Object.assign({}, originalData, newData));
    });
  });

  describe("SessionStorage::get", () => {
    it("Should return an empty object if the given key doesn't exist in store", async() => {
      expect.assertions(2);

      const emptyStore = await browser.storage.session.get();
      expect(emptyStore).toStrictEqual({});

      const data = "key";
      const value = await browser.storage.session.get(data);
      expect(value).toStrictEqual({});
    });

    it("Should return all stored value if no key is specified", async() => {
      expect.assertions(2);

      const dataToSet = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };

      const emptyStore = await browser.storage.session.get();
      expect(emptyStore).toStrictEqual({});

      await browser.storage.session.set(dataToSet);

      const value = await browser.storage.session.get();
      expect(value).toStrictEqual(dataToSet);
    });

    it("Should return an object with a single field if the asked key is a string", async() => {
      expect.assertions(2);

      const dataToSet = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };

      const emptyStore = await browser.storage.session.get();
      expect(emptyStore).toStrictEqual({});

      await browser.storage.session.set(dataToSet);

      const value = await browser.storage.session.get("keyA");
      expect(value).toStrictEqual({keyA: "valueA"});
    });
  });

  describe("SessionStorage::remove", () => {
    it("Should do nothing if the key doesn't exist", async() => {
      expect.assertions(2);

      const dataToSet = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };
      await browser.storage.session.set(dataToSet);

      const value = await browser.storage.session.get();
      expect(value).toStrictEqual(dataToSet);

      await browser.storage.session.remove("non-existing-key");
      const newValues = await browser.storage.session.get();
      expect(newValues).toStrictEqual(dataToSet);
    });

    it("Should remove the existing key", async() => {
      expect.assertions(2);

      const dataToSet = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };
      await browser.storage.session.set(dataToSet);

      const value = await browser.storage.session.get();
      expect(value).toStrictEqual(dataToSet);

      await browser.storage.session.remove("keyA");
      const newValues = await browser.storage.session.get();
      delete dataToSet.keyA;
      expect(newValues).toStrictEqual(dataToSet);
    });
  });

  describe("SessionStorage::clear", () => {
    it("Should do nothing if the store is empty", async() => {
      expect.assertions(2);

      const value = await browser.storage.session.get();
      expect(value).toStrictEqual({});

      await browser.storage.session.clear();
      const newValue = await browser.storage.session.get();
      expect(newValue).toStrictEqual({});
    });

    it("Should remove the existing keys", async() => {
      expect.assertions(2);

      const dataToSet = {
        keyA: "valueA",
        keyB: "valueB",
        keyC: "valueC"
      };
      await browser.storage.session.set(dataToSet);

      const value = await browser.storage.session.get();
      expect(value).toStrictEqual(dataToSet);

      await browser.storage.session.clear();
      const newValues = await browser.storage.session.get();
      expect(newValues).toStrictEqual({});
    });
  });
});
