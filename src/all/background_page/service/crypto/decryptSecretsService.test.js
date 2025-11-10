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
import {pgpKeys} from "passbolt-styleguide/test/fixture/pgpKeys/keys";
import {resourceTypesCollectionDto} from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection.test.data";
import {defaultResourceSecretRevisionsDtos} from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection.test.data";
import DecryptSecretsService from "./decryptSecretsService";
import ResourceTypesCollection from "passbolt-styleguide/src/shared/models/entity/resourceType/resourceTypesCollection";
import ResourceSecretRevisionsCollection from "passbolt-styleguide/src/shared/models/entity/secretRevision/resourceSecretRevisionsCollection";
import {OpenpgpAssertion} from "../../utils/openpgp/openpgpAssertions";
import {defaultSecretDataV5DefaultTotpEntityDto} from "passbolt-styleguide/src/shared/models/entity/secretData/secretDataV5DefaultTotpEntity.test.data";
import {minimalDto} from "passbolt-styleguide/src/shared/models/entity/secret/secretEntity.test.data";

describe("DecryptSecretsService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("::decryptAllFromSecretRevisions", () => {
    it('should decrypt a collection of revisions', async() => {
      const validPgpArmoredMessage = minimalDto().data;
      const resourceTypeCollection = new ResourceTypesCollection(resourceTypesCollectionDto());
      const secretRevisionCollectionDto = defaultResourceSecretRevisionsDtos({}, {withSecrets: true});
      secretRevisionCollectionDto.forEach(dto => dto.secrets[0].data = validPgpArmoredMessage);
      const secretRevisionCollection = new ResourceSecretRevisionsCollection(secretRevisionCollectionDto);
      const key = await OpenpgpAssertion.readKeyOrFail(pgpKeys.ada.private_decrypted);

      const passwordV5ResourceSecret = defaultSecretDataV5DefaultTotpEntityDto();
      jest.spyOn(DecryptMessageService, "decrypt").mockReturnValue(JSON.stringify(passwordV5ResourceSecret));
      jest.spyOn(DecryptSecretsService, "getSecretEntityClassByResourceType").mockReturnValue(SecretDataV5DefaultTotpEntity);

      await DecryptSecretsService.decryptAllFromSecretRevisions(secretRevisionCollection, resourceTypeCollection, key);
    });

    it('should throw an error if something wrong happens during decryption and the errors are not ignored', async() => {
      const resourceTypeCollection = resourceTypesCollectionDto();

      const secretRevisionCollection = defaultResourceSecretRevisionsDtos();

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("Impossible to decrypt message"); });
      jest.spyOn(DecryptSecretsService, "getSecretEntityClassByResourceType").mockReturnValue(SecretDataV5DefaultTotpEntity);

      await expect(() => DecryptSecretsService.decryptAllFromSecretRevisions(secretRevisionCollection, resourceTypeCollection, pgpKeys.ada.private_decrypted)).rejects.toThrowError();
    });

    it('should not throw an error if something wrong happens during decryption and the errors are ignored', async() => {
      const resourceTypeCollection = resourceTypesCollectionDto();
      const secretRevisionCollection = defaultResourceSecretRevisionsDtos();

      jest.spyOn(DecryptMessageService, "decrypt").mockImplementation(() => { throw new Error("Impossible to decrypt message"); });
      jest.spyOn(DecryptSecretsService, "getSecretEntityClassByResourceType").mockReturnValue(SecretDataV5DefaultTotpEntity);

      await expect(() => DecryptSecretsService.decryptAllFromSecretRevisions(secretRevisionCollection, resourceTypeCollection, pgpKeys.ada.private_decrypted, {ignoreDecryptionError: true})).resolves;
    });
  });

  describe("::getSecretEntityClassByResourceType", () => {
    it('should return the right secret data entity', async() => {
      expect.assertions(10);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_PASSWORD_STRING_SLUG})).toBe(SecretDataV4PasswordStringEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_PASSWORD_AND_DESCRIPTION_SLUG})).toBe(SecretDataV4DefaultEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_TOTP_SLUG})).toBe(SecretDataV4StandaloneTotpEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_PASSWORD_DESCRIPTION_TOTP_SLUG})).toBe(SecretDataV4DefaultTotpEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_V5_PASSWORD_STRING_SLUG})).toBe(SecretDataV5PasswordStringEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_V5_DEFAULT_SLUG})).toBe(SecretDataV5DefaultEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_V5_DEFAULT_TOTP_SLUG})).toBe(SecretDataV5DefaultTotpEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_V5_TOTP_SLUG})).toBe(SecretDataV5StandaloneTotpEntity);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_V5_CUSTOM_FIELDS_SLUG})).toBe(SecretDataV5StandaloneCustomFieldsCollection);
      expect(DecryptSecretsService.getSecretEntityClassByResourceType({slug: RESOURCE_TYPE_V5_STANDALONE_NOTE_SLUG})).toBe(SecretDataV5StandaloneNoteEntity);
    });

    it('should throw an error if the resource type slug is unknown', async() => {
      expect(() => DecryptSecretsService.getSecretEntityClassByResourceType("test")).toThrowError();
    });
  });
});
