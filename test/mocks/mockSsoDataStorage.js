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
import SsoKitClientPartEntity from "../../src/all/background_page/model/entity/sso/ssoKitClientPartEntity"

class MockSsoDataStorage {
  constructor() {
    this.data = null;
    this.get = jest.fn().mockImplementation(this.get.bind(this));
    this.save = jest.fn().mockImplementation(this.save.bind(this));
    this.updateLocalKitIdWith = jest.fn().mockImplementation(this.updateLocalKitIdWith.bind(this));
    this.updateLocalKitProviderWith = jest.fn().mockImplementation(this.updateLocalKitProviderWith.bind(this));
    this.flush = jest.fn().mockImplementation(this.flush.bind(this));
  }

  /**
   * Mock/Set the serialized SSO kit on a simulated IndexedDB
   * @param {Object} data
   * @returns {Promise<void>}
   */
  setMockedData(data) {
    this.data = data;
  }

  /**
   * Returns the SSO kit currently stored on the IndexedDB
   * @returns {Promise<SsoKitClientPartEntity|null>}
   */
  async get() {
    return this.data
      ? new SsoKitClientPartEntity(this.data)
      : null;
  }

  /**
   * Simulates a registration of the SSO kit on the IndexedDB
   * @param {SsoKitClientPartEntity} ssoKit
   * @returns {Promise<void>}
   */
  async save(ssoKitClientPartEntity) {
    this.data = ssoKitClientPartEntity.toDbSerializableObject();
  }

  /**
   * Simulates an update of the ID of the SSO kit stored on the IndexedDB
   * @param {SsoKitClientPartEntity} ssoKit
   * @returns {Promise<void>}
   */
  async updateLocalKitIdWith(ssoKit) {
    this.data.id = ssoKit.id;
  }

  /**
   * Simulates an update of the provider of the SSO kit stored on the IndexedDB
   * @param {SsoKitClientPartEntity} ssoKit
   * @returns {Promise<void>}
   */
  async updateLocalKitProviderWith(ssoKit) {
    this.data.provider = ssoKit.provider;
  }

  /**
   * Simulates a flush of the SSO kit on the IndexedDB
   * @param {SsoKitClientPartEntity} ssoKit
   * @returns {Promise<void>}
   */
  async flush() {
    this.data = null;
  }
}

const mockedStorage = new MockSsoDataStorage();
jest.mock("../../src/all/background_page/service/indexedDB_storage/ssoDataStorage", () => ({
  __esModule: true,
  default: mockedStorage
}));
