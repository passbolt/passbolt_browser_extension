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
 * @since         4.11.0
 */
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import FindAllNonDeletedMetadataKeysController from "./findAllNonDeletedMetadataKeysController";
import {
  defaultMetadataKeysDtos
} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection.test.data";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";

describe("FindAllNonDeletedMetadataKeysController", () => {
  let controller, account, apiClientOptions;

  beforeEach(async() => {
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = defaultApiClientOptions();
    controller = new FindAllNonDeletedMetadataKeysController(null, null, apiClientOptions, account);
  });

  describe("::exec", () => {
    it("find all non deleted metadadata keys.", async() => {
      expect.assertions(3);

      const metadataKeysDto = defaultMetadataKeysDtos();
      jest.spyOn(controller.findMetadataKeysService, "findAllNonDeleted")
        .mockImplementationOnce(() => new MetadataKeysCollection(metadataKeysDto));

      const metadataKeys = await controller.exec();

      expect(controller.findMetadataKeysService.findAllNonDeleted).toHaveBeenCalled();
      expect(metadataKeys).toBeInstanceOf(MetadataKeysCollection);
      expect(metadataKeys.toDto()).toEqual(metadataKeysDto);
    });
  });
});
