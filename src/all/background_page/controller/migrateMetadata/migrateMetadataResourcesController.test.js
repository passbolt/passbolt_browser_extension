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
 * @since         4.12.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import {defaultPassboltResponsePaginationHeaderDto} from "passbolt-styleguide/src/shared/models/entity/apiService/PassboltResponsePaginationHeaderEntity.test.data";
import MigrateMetadataResourcesController from "./migrateMetadataResourcesController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {defaultMigrateMetadataDto} from "passbolt-styleguide/src/shared/models/entity/metadata/migrateMetadataEntity.test.data";
import MigrateMetadataEntity from "passbolt-styleguide/src/shared/models/entity/metadata/migrateMetadataEntity";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";

describe("MigrateMetadataResourcesController", () => {
  describe("::exec", () => {
    it("Migrate the resources metadata.", async() => {
      expect.assertions(6);

      const passphrase = "ada@passbolt.com";
      const migrateMetadataDto = defaultMigrateMetadataDto();
      const paginationDatils = defaultPassboltResponsePaginationHeaderDto({
        count: 78,
        limit: 20
      });
      const pageCount = 4;
      const worker = {port: new MockPort()};
      const controller = new MigrateMetadataResourcesController(worker, null, defaultApiClientOptions(), new AccountEntity(defaultAccountDto()));

      jest.spyOn(controller.migrateMetadataResourcesService, "migrate").mockReturnValue();
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockReturnValue(passphrase);
      jest.spyOn(controller.progressService, "start");
      jest.spyOn(controller.progressService, "close");

      await controller.exec(migrateMetadataDto, paginationDatils);

      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.migrateMetadataResourcesService.migrate).toHaveBeenCalledTimes(1);
      expect(controller.migrateMetadataResourcesService.migrate).toHaveBeenCalledWith(new MigrateMetadataEntity(migrateMetadataDto), passphrase, {count: 0});
      expect(controller.progressService.start).toHaveBeenCalledTimes(1);
      expect(controller.progressService.start).toHaveBeenCalledWith(pageCount + 3, "Migrating metadata");
      expect(controller.progressService.close).toHaveBeenCalledTimes(1);
    });
  });
});
