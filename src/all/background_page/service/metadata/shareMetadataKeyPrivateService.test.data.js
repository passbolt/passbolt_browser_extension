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
 * @since         5.1.1
 */
import {defaultUserDto} from "passbolt-styleguide/src/shared/models/entity/user/userEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {decryptedMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {defaultMetadataKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataKeyEntity.test.data";


export const usersWithMissingMetadataKeysDto = (data = {}) => {
  const user1 = defaultUserDto({
    id: pgpKeys.betty.userId,
    username: "user1@passbolt.com",
    missing_metadata_key_ids: data.missingMetadataKeysIds || [uuidv4()]
  });
  const user2 = defaultUserDto({
    username: "user2@passbolt.com",
    missing_metadata_key_ids: []
  });

  return [user1, user2];
};

export const usersWithoutMissingMetadataKeysDto = (data = {}) => {
  const userData = {
    missingMetadataKeysIds: [],
    ...data
  };
  return usersWithMissingMetadataKeysDto(userData);
};

export const metadataKeysSignedByCurrentDto = (data = {}) => {
  const metadataId = uuidv4();

  const metadataPrivateKeysDto = decryptedMetadataPrivateKeyDto({
    metadata_key_id: metadataId,
    user_id: pgpKeys.ada.userId,
    data_signed_by_current_user: (new Date()).toISOString(),
    ...data
  });

  const metadataKeyDto = defaultMetadataKeyDto({id: metadataId, metadata_private_keys: [metadataPrivateKeysDto]});

  return [metadataKeyDto];
};


export const metadataKeysNotSignedByCurrentDto = (data = {}) => metadataKeysSignedByCurrentDto({data_signed_by_current_user: null, ...data});
