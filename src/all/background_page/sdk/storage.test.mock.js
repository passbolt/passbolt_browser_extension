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

class LocalStorage {
  constructor(changeCallbacks) {
    this.storage = {};
    this.changeCallbacks = changeCallbacks;
  }

  get(keys) {
    return keys.reduce((accumulator, key) => {
      if (this.storage[key]) {
        accumulator[key] = this.storage[key];
      }
      return accumulator;
    }, {});
  }

  set(data) {
    const storageChangeEventValue = {};
    Object.keys(data).forEach(key => {
      this.storage[key] = data[key];
      storageChangeEventValue[key] = {};
      storageChangeEventValue[key].newValue = data[key];
    });
    this.changeCallbacks.forEach(callback => callback(storageChangeEventValue));
  }

  remove(key) {
    delete this.storage[key];
  }

  clear() {
    this.storage = {};
  }
}

class MockStorage {
  constructor() {
    this.changeCallbacks = [];
    this.local = new LocalStorage(this.changeCallbacks);
    this.onChanged = {
      addListener: listener => {
        console.debug("browser.storage.onChanged.addListener");
        this.changeCallbacks.push(listener);
      }
    };
  }
}

export default MockStorage;
