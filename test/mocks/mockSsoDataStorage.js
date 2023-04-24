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
import SsoKitClientPartEntity from "../../src/all/background_page/model/entity/sso/ssoKitClientPartEntity";
import {assertSsoProvider} from "../../src/all/background_page/utils/assertions";

class MockSsoDataStorage {
  constructor() {
    this.data = null;
    this.get = jest.fn().mockImplementation(this.get.bind(this));
    this.save = jest.fn().mockImplementation(this.save.bind(this));
    this.updateLocalKitIdWith = jest.fn().mockImplementation(this.updateLocalKitIdWith.bind(this));
    this.updateLocalKitProviderWith = jest.fn().mockImplementation(this.updateLocalKitProviderWith.bind(this));
    this.flush = jest.fn().mockImplementation(this.flush.bind(this));
  }

  async setMockedData(data) {
    this.data = data;
  }

  async get() {
    return this.data
      ? new SsoKitClientPartEntity(this.data)
      : null;
  }

  async save(ssoKitClientPartEntity) {
    this.data = ssoKitClientPartEntity.toDbSerializableObject();
  }

  async updateLocalKitIdWith(ssoKitId) {
    this.data.id = ssoKitId;
  }

  async updateLocalKitProviderWith(provider) {
    assertSsoProvider(provider);
    this.data.provider = provider;
  }

  async flush() {
    this.data = null;
  }
}

const mockedStorage = new MockSsoDataStorage();
jest.mock("../../src/all/background_page/service/indexedDB_storage/ssoDataStorage", () => ({
  __esModule: true,
  default: mockedStorage
}));
