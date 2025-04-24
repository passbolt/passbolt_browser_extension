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
 * @since         5.1.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {
  defaultMetadataTrustedKeyDto
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity.test.data";
import GetMetadataTrustedKeyService from "./getMetadataTrustedKeyService";
import TrustedMetadataKeyLocalStorage from "../local_storage/trustedMetadataKeyLocalStorage";
import MetadataTrustedKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataTrustedKeyEntity";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GetMetadataTrustedKeyService", () => {
  let account, storage, service;
  beforeEach(() => {
    account = new AccountEntity(defaultAccountDto());
    storage = new TrustedMetadataKeyLocalStorage(account);
    service = new GetMetadataTrustedKeyService(account);
    // flush account related storage before each.
    storage.flush();
  });

  describe("::get", () => {
    it("returns null if nothing is stored in the local storage.", async() => {
      expect.assertions(1);
      const result = await service.get();
      expect(result).toBeNull();
    });

    it("returns content stored in the local storage.", async() => {
      const settingsDto = defaultMetadataTrustedKeyDto();
      expect.assertions(1);
      browser.storage.local.set({[storage.storageKey]: settingsDto});
      const result = await service.get();
      expect(result).toEqual(new MetadataTrustedKeyEntity(settingsDto));
    });
  });
});
