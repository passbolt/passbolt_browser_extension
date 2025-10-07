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
 * @since         5.6.0
 */

import AccountEntity from "../../model/entity/account/accountEntity";
import {defaultAccountDto} from "../../model/entity/account/accountEntity.test.data";
import BuildApiClientOptionsService from "../account/buildApiClientOptionsService";
import ExpireMetadataKeyService from "./expireMetadataKeyService";
import {enableFetchMocks} from "jest-fetch-mock";
import MetadataKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity";
import MetadataKeysCollection from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeysCollection";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";
import {decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {v4 as uuidv4} from "uuid";
import RevokeGpgKeyService from "../crypto/revokeGpgKeyService";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

describe("ExpireMetadataKeyService", () => {
  let apiClientOptions, account;
  beforeEach(async() => {
    enableFetchMocks();
    fetch.resetMocks();
    account = new AccountEntity(defaultAccountDto());
    apiClientOptions = BuildApiClientOptionsService.buildFromAccount(account);
  });

  describe('::expire', () => {
    it("expire the metadata key on the API.", async() => {
      expect.assertions(3);

      const expectedId = uuidv4();
      const metadataPrivateKeysDto = [decryptedMetadataPrivateKeyDto({metadata_key_id: expectedId, user_id: account.userId})];
      const metadataKeyDto = defaultMetadataKeyDto({id: expectedId, metadata_private_keys: metadataPrivateKeysDto});
      const metadataKey = new MetadataKeyEntity(metadataKeyDto);

      const metadataPrivateKeyToRevoke = metadataKey.metadataPrivateKeys.items[0];
      const privateKeyToRevoke = await OpenpgpAssertion.readKeyOrFail(metadataPrivateKeyToRevoke.data.armoredKey);
      let publicKeyRevoked, expiredDate;

      jest.spyOn(RevokeGpgKeyService, "revoke");

      const service = new ExpireMetadataKeyService(account, apiClientOptions);
      jest.spyOn(service.getOrFindMetadataKeysService.findAndUpdateMetadataKeysService, "findAndUpdateAll").mockImplementationOnce(() => new MetadataKeysCollection([metadataKeyDto]));
      jest.spyOn(service.metadataKeysApiService, "update").mockImplementationOnce((metadataKeyId, metadataData) => {
        publicKeyRevoked = metadataData.armoredKey;
        expiredDate = metadataData.expired;
      });

      await service.expire(expectedId, pgpKeys.ada.passphrase);

      expect(RevokeGpgKeyService.revoke).toHaveBeenCalledWith(privateKeyToRevoke);
      await expect(OpenpgpAssertion.readKeyOrFail(publicKeyRevoked)).resolves.not.toThrow();
      expect(service.metadataKeysApiService.update).toHaveBeenCalledWith(expectedId, new MetadataKeyEntity({fingerprint: metadataKey.fingerprint, armored_key: publicKeyRevoked, expired: expiredDate}));
    });

    it("throws an invalid parameter error if the settings parameter is not valid uuid", async() => {
      expect.assertions(1);

      const service = new ExpireMetadataKeyService(account, apiClientOptions);

      await expect(() => service.expire(42)).rejects.toThrowError("The given parameter is not a valid UUID");
    });
  });
});
