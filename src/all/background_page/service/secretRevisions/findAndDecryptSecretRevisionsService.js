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

import ResourceTypeModel from "../../model/resourceType/resourceTypeModel";
import {assertString, assertUuid} from "../../utils/assertions";
import GetDecryptedUserPrivateKeyService from "../account/getDecryptedUserPrivateKeyService";
import DecryptSecretsService from "../crypto/decryptSecretsService";
import FindSecretRevisionsService from "./findSecretRevisionsService";

export default class FindAndDecryptSecretRevisionsService {
  /**
   * @constructor
   * @param {ApiClientOptions} apiClientOptions
   */
  constructor(apiClientOptions) {
    this.findSecretRevisionsService = new FindSecretRevisionsService(apiClientOptions);
    this.resourceTypeModel = new ResourceTypeModel(apiClientOptions);
  }

  /**
   * Find and decrypt all secret revision given a resource id for displaying in the UI.
   * @param {string} resourceId
   * @param {string} passphrase
   * @returns {Promise<ResourceSecretRevisionsCollection>}
   * @throws {TypeError} If resourceId is not a valid UUID
   * @throws {TypeError} If passphrase is not a string
   * @throws {Error} If private key decryption fails
   */
  async findAllByResourceIdAndDecryptForDisplay(resourceId, passphrase) {
    assertUuid(resourceId);
    assertString(passphrase);

    const decryptedKey = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    const resourceTypesCollection = await this.resourceTypeModel.getOrFindAll();
    const contains = {
      secret: true,
      creator: true,
      "creator.profile": true,
      /*
       *  Not supported yet
       *  owner_accessors: true,
       * "owner_accessors.profile": true,
       */
    };

    const resourceSecretRevisions = await this.findSecretRevisionsService.findAllByResourceId(resourceId, contains);
    await DecryptSecretsService.decryptAllFromSecretRevisions(resourceSecretRevisions, resourceTypesCollection, decryptedKey, {ignoreDecryptionError: true});
    resourceSecretRevisions.filterOutItemsHavingSecretDataEncrypted();

    return resourceSecretRevisions;
  }
}
