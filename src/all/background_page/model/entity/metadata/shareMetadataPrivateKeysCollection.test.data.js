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
 * @since         5.2.0
 */

import {v4 as uuidv4} from "uuid";
import {minimalMetadataPrivateKeyDto, defaultMetadataPrivateKeyDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity.test.data";
import {defaultMetadataPrivateKeyDataDto} from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyDataEntity.test.data";
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";

export const defaultShareMetadataPrivateKeysDtos = (count = 2, data = {}) => {
  const user_id = uuidv4();

  const dtos = [];
  for (let i = 0; i < count; i += 2) {
    const dto1 = defaultMetadataPrivateKeyDto({user_id, ...data});
    const dto2 = defaultMetadataPrivateKeyDto({user_id: user_id, data: defaultMetadataPrivateKeyDataDto(), ...data});
    dtos.push(dto1, dto2);
  }

  return dtos;
};

export const defaultMinimalShareMetadataPrivateKeysDtos = (count = 2, data = {}) => {
  const dtos = [];
  const user_id = uuidv4();

  for (let i = 0; i < count; i += 2) {
    const dto1 = minimalMetadataPrivateKeyDto({user_id, ...data});
    const dto2 = minimalMetadataPrivateKeyDto({user_id: user_id, data: defaultMetadataPrivateKeyDataDto(), ...data});
    dtos.push(dto1, dto2);
  }

  return dtos;
};


export const shareMetadataPrivateKeysWithSameMetadataKeyIdDtos = () => {
  const metadataKeyId = uuidv4();
  return defaultShareMetadataPrivateKeysDtos(2, {
    metadata_key_id: metadataKeyId
  });
};

export const shareMetadataPrivateKeysWithSameIdDtos = () => {
  const id = uuidv4();
  return defaultShareMetadataPrivateKeysDtos(2, {
    id: id
  });
};

export const shareMetadataPrivateKeysWithDifferentUserIdDtos = () => {
  const userId1 = uuidv4();
  const userId2 = uuidv4();

  const data =  defaultShareMetadataPrivateKeysDtos();
  data[0].user_id = userId1;
  data[1].user_id = userId2;

  return data;
};

export const shareMetadataPrivateKeysWithDecryptedKeyDtos = () => {
  const user_id = uuidv4();
  const data = defaultMetadataPrivateKeyDataDto();
  return [
    defaultMetadataPrivateKeyDto({user_id, data}),
    defaultMetadataPrivateKeyDto({user_id, data}),
  ];
};

export const shareMetadataPrivateKeysWithEncryptedKeyDtos = () => {
  const user_id = uuidv4();
  const data = pgpKeys.metadataKey.encryptedMetadataPrivateKeyDataMessage;
  return [
    defaultMetadataPrivateKeyDto({user_id}),
    defaultMetadataPrivateKeyDto({user_id, data}),
  ];
};
