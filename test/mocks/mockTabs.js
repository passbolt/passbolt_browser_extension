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
 * @since         3.9.0
 */

class EventListerners {
  constructor() {
    this.listeners = [];
    this.addListener = jest.fn().mockImplementation(this.addListener.bind(this));
    this.removeListener = jest.fn().mockImplementation(this.removeListener.bind(this));
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.find(cb => cb === callback);
    if (index > -1) {
      this.listeners.splice(index);
    }
  }

  triggers(...args) {
    this.listeners.forEach(listener => {
      listener.apply(null, args);
    });
  }
}

export default class MockTabs {
  constructor() {
    this.onUpdated = new EventListerners();
    this.onRemoved = new EventListerners();
    this.remove = jest.fn();
    this.update = jest.fn();
  }
}
