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
 * @since         5.7.0
 */

import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import ResourceSecretRevisionsCollection from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection";
import {defaultResourceSecretRevisionsDtos} from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection.test.data";
import {v4 as uuidv4} from "uuid";
import FindResourceSecretRevisionsForDisplayController from "./findResourceSecretRevisionsForDisplayController";
import UserAbortsOperationError from "../../error/userAbortsOperationError";

describe("FindResourceSecretRevisionsForDisplayController", () => {
  describe("::exec", () => {
    it("should call the right services and return the right information", async() => {
      expect.assertions(5);

      const resource_id = uuidv4();
      const account = new AccountEntity(defaultAccountDto());
      const expectedRevisionsCollection = new ResourceSecretRevisionsCollection(defaultResourceSecretRevisionsDtos({resource_id}, {withCreator: true, withSecrets: true}));

      const controller = new FindResourceSecretRevisionsForDisplayController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.findAndDecryptSecretRevisionsService, "findAllByResourceIdAndDecryptForDisplay").mockResolvedValue(expectedRevisionsCollection);

      const result = await controller.exec(resource_id);
      expect(result).toBeInstanceOf(ResourceSecretRevisionsCollection);
      expect(result).toStrictEqual(expectedRevisionsCollection);
      expect(controller.getPassphraseService.getPassphrase).toHaveBeenCalledTimes(1);
      expect(controller.findAndDecryptSecretRevisionsService.findAllByResourceIdAndDecryptForDisplay).toHaveBeenCalledTimes(1);
      expect(controller.findAndDecryptSecretRevisionsService.findAllByResourceIdAndDecryptForDisplay).toHaveBeenCalledWith(resource_id, pgpKeys.ada.passphrase);
    });

    it("should assert its parameters", async() => {
      expect.assertions(3);
      const account = new AccountEntity(defaultAccountDto());
      const controller = new FindResourceSecretRevisionsForDisplayController(null, null, defaultApiClientOptions(), account);

      await expect(() => controller.exec(42)).rejects.toThrowError();
      await expect(() => controller.exec("42")).rejects.toThrowError();
      await expect(() => controller.exec(null)).rejects.toThrowError();
    });

    it("should not catch errors and let it throw from the service", async() => {
      expect.assertions(1);
      const expectedError = new Error("Something went wrong!");
      const account = new AccountEntity(defaultAccountDto());
      const controller = new FindResourceSecretRevisionsForDisplayController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockResolvedValue(pgpKeys.ada.passphrase);
      jest.spyOn(controller.findAndDecryptSecretRevisionsService, "findAllByResourceIdAndDecryptForDisplay").mockImplementation(() => { throw expectedError; });

      try {
        await controller.exec(uuidv4());
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });

    it("should let user passphrase input cancelation error be thrown", async() => {
      expect.assertions(1);
      const expectedError = new UserAbortsOperationError();
      const account = new AccountEntity(defaultAccountDto());
      const controller = new FindResourceSecretRevisionsForDisplayController(null, null, defaultApiClientOptions(), account);
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementation(() => { throw expectedError; });

      try {
        await controller.exec(uuidv4());
      } catch (e) {
        expect(e).toStrictEqual(expectedError);
      }
    });
  });
});
