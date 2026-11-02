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
 * @since         5.17.0
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import MfaWebauthnCredentialEntity from "./mfaWebauthnCredentialEntity";
import MfaWebauthnCredentialsCollection from "./mfaWebauthnCredentialsCollection";
import { defaultMfaWebauthnCredentialDto } from "./mfaWebauthnCredentialEntity.test.data";
import { defaultMfaWebauthnCredentialsDtos } from "./mfaWebauthnCredentialsCollection.test.data";

describe("MfaWebauthnCredentialsCollection", () => {
  describe("MfaWebauthnCredentialsCollection::constructor", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(MfaWebauthnCredentialsCollection.name, MfaWebauthnCredentialsCollection.getSchema());
    });

    it("works if valid DTOs are provided", () => {
      expect.assertions(5);
      const dtos = defaultMfaWebauthnCredentialsDtos(2);
      const collection = new MfaWebauthnCredentialsCollection(dtos);
      expect(collection).toHaveLength(2);
      expect(collection.toDto()).toEqual(dtos);
      expect(collection.credentials[0]).toBeInstanceOf(MfaWebauthnCredentialEntity);
      expect(collection.credentials[0].id).toEqual(dtos[0].id);
      expect(collection.credentials[1].id).toEqual(dtos[1].id);
    });

    it("works with an empty array", () => {
      expect.assertions(1);
      expect(new MfaWebauthnCredentialsCollection([])).toHaveLength(0);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);
      expect(() => new MfaWebauthnCredentialsCollection({})).toThrowEntityValidationError("items");
    });

    it("should throw if one of data item does not validate the entity schema", () => {
      expect.assertions(1);
      const dtos = [defaultMfaWebauthnCredentialDto(), defaultMfaWebauthnCredentialDto({ sign_count: "3" })];
      expect(() => new MfaWebauthnCredentialsCollection(dtos)).toThrowCollectionValidationError("1.sign_count.type");
    });

    it("should throw if one of data item does not validate the unique id build rule", () => {
      expect.assertions(1);
      const dto1 = defaultMfaWebauthnCredentialDto();
      const dto2 = defaultMfaWebauthnCredentialDto({ id: dto1.id });
      expect(() => new MfaWebauthnCredentialsCollection([dto1, dto2])).toThrowCollectionValidationError("1.id.unique");
    });
  });
});
