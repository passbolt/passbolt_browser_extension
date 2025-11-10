
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

import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {assertType} from '../../utils/assertions';
import SecretEntity from 'passbolt-styleguide/src/shared/models/entity/secret/secretEntity';
import ResourceTypeEntity from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeEntity";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import DecryptMessageService from "./decryptMessageService";
import {
  RESOURCE_TYPE_TOTP_SLUG,
  RESOURCE_TYPE_PASSWORD_STRING_SLUG,
  RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG,
  RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG,
  RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_SLUG,
  RESOURCE_TYPE_V5_TOTP_SLUG,
  RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG,
  RESOURCE_TYPE_V5_CUSTOM_FIELDS_SLUG,
  RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG,
} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypeSchemasDefinition";
import SecretDataV5DefaultEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5DefaultEntity";
import SecretDataV5DefaultTotpEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5DefaultTotpEntity";
import SecretDataV5StandaloneTotpEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5StandaloneTotpEntity";
import SecretDataV5PasswordStringEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5PasswordStringEntity";
import SecretDataV4DefaultEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV4DefaultEntity";
import SecretDataV4DefaultTotpEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV4DefaultTotpEntity";
import SecretDataV4StandaloneTotpEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV4StandaloneTotpEntity";
import SecretDataV4PasswordStringEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV4PasswordStringEntity";
import SecretDataV5StandaloneCustomFieldsCollection from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5StandaloneCustomFieldsCollection";
import SecretDataV5StandaloneNoteEntity from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5StandaloneNoteEntity";
import ResourceSecretRevisionsCollection from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection";
import Logger from "passbolt-styleguide/src/shared/utils/logger";

export default class DecryptSecretsService {
  /**
   * Decrypts a collection of revisions.
   * @param {ResourceSecretRevisionsCollection} secretRevisionsCollection
   * @param {ResourceTypesCollection} resourceTypesCollection
   * @param {GpgPrivateKey} userDecryptedPrivateKey
   * @param {object} [options] The options.
   * @param {object} [options.ignoreDecryptionError=false] ignore decryption errors.
   */
  static async decryptAllFromSecretRevisions(secretRevisionsCollection, resourceTypesCollection, userDecryptedPrivateKey,  options = {ignoreDecryptionError: false}) {
    assertType(secretRevisionsCollection, ResourceSecretRevisionsCollection);
    assertType(resourceTypesCollection, ResourceTypesCollection);
    OpenpgpAssertion.assertDecryptedPrivateKey(userDecryptedPrivateKey);
    assertType(options, Object);

    for (let i = 0; i < secretRevisionsCollection.length; i++) {
      const secretRevisionEntity = secretRevisionsCollection.items[i];
      const resourceType = resourceTypesCollection.getFirstById(secretRevisionEntity.resourceTypeId);
      const secretCollections = secretRevisionEntity.secrets;

      try {
        for (let j = 0; j < secretCollections.length; j++) {
          const secretEntity =  secretCollections.items[j];
          await DecryptSecretsService.decryptOne(secretEntity, resourceType, userDecryptedPrivateKey);
        }
      } catch (e) {
        Logger.error(e);
        if (!options.ignoreDecryptionError) {
          throw e;
        }
      }
    }
  }

  /**
   * Decrypts one secret and instantiate the corresponding secret data entity given a resource type.
   * @param {SecretEntity} secret
   * @param {ResourceTypeEntity} resourceType
   * @param {GpgPrivateKey} userDecryptedPrivateKey
   * @private
   */
  static async decryptOne(secret, resourceType, userDecryptedPrivateKey)  {
    assertType(secret, SecretEntity);
    assertType(resourceType, ResourceTypeEntity);
    OpenpgpAssertion.assertDecryptedPrivateKey(userDecryptedPrivateKey);

    if (secret.isDataDecrypted) {
      throw new Error("The data should not be already decrypted");
    }

    const message = await OpenpgpAssertion.readMessageOrFail(secret.data);
    const decryptedData = await DecryptMessageService.decrypt(message, userDecryptedPrivateKey);
    const secretEntityClass = DecryptSecretsService.getSecretEntityClassByResourceType(resourceType);

    const secretEntity = resourceType.isPasswordString() ? new secretEntityClass({password: decryptedData})  : new secretEntityClass(JSON.parse(decryptedData));
    secret.data = secretEntity;
  }

  /**
   *
   * @param {ResourceTypeEntity} resourceType
   * @returns {Function} the type of the secret entity that matches the resource type
   */
  static getSecretEntityClassByResourceType(resourceType) {
    switch (resourceType.slug) {
      case RESOURCE_TYPE_PASSWORD_STRING_SLUG:
        return SecretDataV4PasswordStringEntity;
      case RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG:
        return SecretDataV4DefaultEntity;
      case RESOURCE_TYPE_TOTP_SLUG:
        return SecretDataV4StandaloneTotpEntity;
      case RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG:
        return SecretDataV4DefaultTotpEntity;
      case RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG:
        return SecretDataV5PasswordStringEntity;
      case RESOURCE_TYPE_V5_DEFAULT_SLUG:
        return SecretDataV5DefaultEntity;
      case RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG:
        return SecretDataV5DefaultTotpEntity;
      case RESOURCE_TYPE_V5_TOTP_SLUG:
        return SecretDataV5StandaloneTotpEntity;
      case RESOURCE_TYPE_V5_CUSTOM_FIELDS_SLUG:
        return SecretDataV5StandaloneCustomFieldsCollection;
      case RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG:
        return SecretDataV5StandaloneNoteEntity;
      default:
        throw new Error("There is no matching secret entity matching the given resource type");
    }
  }
}
