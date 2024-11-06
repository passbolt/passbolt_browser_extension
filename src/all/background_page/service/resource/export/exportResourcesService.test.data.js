/**
 * @jest-environment ./test/jest.custom-kdbx-environment
 */
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
 * @since         4.10.1
 */

import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {resourceTypePasswordAndDescriptionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity.test.data";
import {v4 as uuidv4} from "uuid";
import {defaultResourceDto} from "passbolt-styleguide/src/shared/models/entity/resource/resourceEntity.test.data";
import EncryptMessageService from "../../crypto/encryptMessageService";
import PlaintextEntity from "../../../model/entity/plaintext/plaintextEntity";
import {OpenpgpAssertion} from "../../../utils/openpgp/openpgpAssertions";

export const resourceCollectionV4ToExport = async(data = {}, options = {}) => {
  const collection = await resourceCollectionV5ToExport(data, options);

  delete collection[0].metadata;

  return collection;
};

export const resourceCollectionV5ToExport = async(data = {}, options = {}) => {
  const plaintextDto = {
    password: data.password || "Password 1",
    description: data.description || "Description 1",
    totp: data.totp
  };
  const id = uuidv4();
  const resourceType = data.resourceType || resourceTypePasswordAndDescriptionDto();

  const plaintextEntity = new PlaintextEntity(plaintextDto, {schema: resourceType.definition.secret});
  const serializedPlaintextDto = JSON.stringify(plaintextEntity);
  const userPublicKey = data.userPublicKey || await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.public);
  const privateKey = data.privateKey || await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);

  const encryptedSecret = await EncryptMessageService.encrypt(serializedPlaintextDto, userPublicKey, [privateKey]);
  const secret = {
    id: id,
    resource_id: id,
    data: encryptedSecret
  };
  const metadata = {
    name: "Password 1",
    username: "Username 1",
    uris: ["https://url1.com"],
    resource_type_id: resourceType.id,
  };
  const dto = defaultResourceDto({
    id: id,
    name: "Password 1",
    username: "Username 1",
    uri: "https://url1.com",
    secrets: [secret],
    resource_type_id: resourceType.id,
    folder_parent_id: data.folder_parent_id,
    metadata: metadata,
    ...data
  }, options);

  return [dto];
};
