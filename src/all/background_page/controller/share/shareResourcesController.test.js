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
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import Keyring from "../../model/keyring";
import ShareResourcesController from "./shareResourcesController";
import AccountEntity from "../../model/entity/account/accountEntity";
import {adminAccountDto} from "../../model/entity/account/accountEntity.test.data";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import {
  resourceTypesCollectionDto
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import ResourcesCollection from "../../model/entity/resource/resourcesCollection";
import expect from "expect";
import {defaultApiClientOptions} from "passbolt-styleguide/src/shared/lib/apiClient/apiClientOptions.test.data";
import MockPort from "passbolt-styleguide/src/react-extension/test/mock/MockPort";
import {v4 as uuidv4} from "uuid";
import {minimumPermissionDto} from "passbolt-styleguide/src/shared/models/entity/permission/permissionEntity.test.data";
import EncryptMessageService from "../../service/crypto/encryptMessageService";
import {defaultResourceV4Dto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import {plaintextSecretPasswordAndDescriptionDto} from "passbolt-styleguide/src/shared/models/entity/plaintextSecret/plaintextSecretEntity.test.data";
import {simulateShareSecretsChangesDto} from "../../service/share/shareResourceService.test.data";

const {pgpKeys} = require("passbolt-styleguide/test/fixture/pgpKeys/keys");

describe("ShareResourcesController", () => {
  describe("::exec", () => {
    let account, controller;
    beforeEach(async() => {
      const apiClientOptions = defaultApiClientOptions();
      account = new AccountEntity(adminAccountDto());
      const mockedWorker = {port: new MockPort()};
      controller = new ShareResourcesController(mockedWorker, uuidv4(), apiClientOptions, account);
    });

    it("throws if the parameters are not valid.", async() => {
      expect.assertions(6);
      await expect(() => controller.exec("wrong", [])).rejects.toThrow(new TypeError('The parameter "resourcesIds" should be an array'));
      await expect(() => controller.exec([], [])).rejects.toThrow(new TypeError('The parameter "resourcesIds" should be a non empty array'));
      await expect(() => controller.exec(["test"], [])).rejects.toThrow(new TypeError('The parameter "resourcesIds" should contain only uuid', {cause: new TypeError("The given parameter is not a valid UUID")}));
      await expect(() => controller.exec([uuidv4()], "not-valid")).rejects.toThrow(new TypeError('The parameter "permissionChangesDto" should be an array'));
      await expect(() => controller.exec([uuidv4()], [])).rejects.toThrow(new TypeError('The parameter "permissionChangesDto" should be a non empty array'));
      const execPromiseEntityValidationError = controller.exec([uuidv4()], [{}]);
      await expect(execPromiseEntityValidationError).rejects.toThrowEntityValidationErrorOnProperties(["aco", "aro", "aco_foreign_key", "aro_foreign_key", "type"]);
    });

    it("shares resources.", async() => {
      expect.assertions(12);
      const resourceId = uuidv4();
      const carolPermissionChange = minimumPermissionDto({
        aro_foreign_key: pgpKeys.carol.userId,
        aco_foreign_key: resourceId,
        type: 1,
      });

      // mock passphrase service
      jest.spyOn(controller.getPassphraseService, "getPassphrase").mockImplementation(() => pgpKeys.admin.passphrase);
      const resourceDto = defaultResourceV4Dto({id: resourceId}, {withTags: true});
      // mock resource getOrFindAll service
      jest.spyOn(controller.shareResourceService.getOrFindResourcesService, "getOrFindAll").mockImplementation(() => new ResourcesCollection([resourceDto]));
      // Mock request retrieving the resource types.
      jest.spyOn(controller.shareResourceService.resourceTypeModel, "getOrFindAll").mockImplementation(() => new ResourceTypesCollection(resourceTypesCollectionDto()));
      // Mock request simulating the share.
      jest.spyOn(controller.shareResourceService.shareService, "simulateShareResource").mockImplementation(() =>
        simulateShareSecretsChangesDto([pgpKeys.carol.userId], []));
      // Mock find all for share.
      const secretDto = plaintextSecretPasswordAndDescriptionDto();
      const resourceSecretData = await EncryptMessageService.encrypt(JSON.stringify(secretDto), await OpenpgpAssertion.readKeyOrFail(pgpKeys.admin.public));
      const resourceForShareDto = new defaultResourceV4Dto({
        ...resourceDto,
        secrets: [plaintextSecretPasswordAndDescriptionDto({resource_id: resourceId, data: resourceSecretData})]
      });
      jest.spyOn(controller.shareResourceService.findResourcesService, "findAllByIdsForShare").mockImplementation(() => new ResourcesCollection([resourceForShareDto]));
      // Mock keyring.
      jest.spyOn(Keyring.prototype, "sync").mockImplementation(jest.fn);
      const keyring = new Keyring();
      keyring.importPublic(pgpKeys.carol.public, pgpKeys.carol.userId);
      // Mock the share request.
      let shareRequestData;
      jest.spyOn(controller.shareResourceService.shareService, "shareResource").mockImplementation((resourceId, data) => {
        shareRequestData = data;
        return {};
      });
      // Mock the local storage refresh
      jest.spyOn(controller.shareResourceService.findAndUpdateResourcesLocalStorage, "findAndUpdateAll").mockImplementation(jest.fn);
      // Mock the local storage refresh
      jest.spyOn(controller.progressService, "finishStep").mockImplementation(jest.fn);

      await controller.exec([resourceId], [carolPermissionChange]);

      // Assert share API call.
      expect(carolPermissionChange).toEqual(expect.objectContaining(shareRequestData.permissions[0].toDto()));
      expect(shareRequestData.secrets?.length).toStrictEqual(1);
      await expect(shareRequestData.secrets[0].data)
        .toDecryptAndEqualTo(pgpKeys.carol.private_decrypted, JSON.stringify(secretDto));

      // Assert progress dialog
      expect(controller.progressService.finishStep).toHaveBeenCalledTimes(9);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(1, "Updating resources metadata", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(2, "Calculating secrets", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(3, "Retrieving secrets", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(4, "Decrypting secrets", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(5, "Synchronizing keyring", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(6, "Encrypting secrets", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(7, "Sharing resources", true);
      expect(controller.progressService.finishStep).toHaveBeenNthCalledWith(8, "Updating resources local storage", true);
    });
  });
});
