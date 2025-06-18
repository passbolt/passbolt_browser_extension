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

import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import ShareMetadataPrivateKeysCollection from "./shareMetadataPrivateKeysCollection";
import {defaultMinimalShareMetadataPrivateKeysDtos, defaultShareMetadataPrivateKeysDtos, shareMetadataPrivateKeysWithDecryptedKeyDtos, shareMetadataPrivateKeysWithDifferentUserIdDtos, shareMetadataPrivateKeysWithEncryptedKeyDtos, shareMetadataPrivateKeysWithSameMetadataKeyIdDtos} from "./shareMetadataPrivateKeysCollection.test.data";
import MetadataPrivateKeyEntity from "passbolt-styleguide/src/shared/models/entity/metadata/metadataPrivateKeyEntity";

describe("ShareMetadataPrivateKeysCollection", () => {
  describe("::getSchema", () => {
    it("schema must validate", () => {
      EntitySchema.validateSchema(ShareMetadataPrivateKeysCollection.name, ShareMetadataPrivateKeysCollection.getSchema());
    });
  });

  describe("::constructor", () => {
    it("works with empty data", () => {
      expect.assertions(1);

      const collection = new ShareMetadataPrivateKeysCollection([]);

      expect(collection).toHaveLength(0);
    });

    it("works if valid minimal DTO is provided", () => {
      expect.assertions(3);

      const dtos = defaultMinimalShareMetadataPrivateKeysDtos();
      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection).toHaveLength(2);
      expect(collection.items[0]._props.user_id).toEqual(dtos[0].user_id);
      expect(collection.items[1]._props.user_id).toEqual(dtos[1].user_id);
    });

    it("works if valid complete DTOs are provided", () => {
      expect.assertions(3);

      const dtos = defaultShareMetadataPrivateKeysDtos();
      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection).toHaveLength(2);
      expect(collection.items[0]._props.id).toEqual(dtos[0].id);
      expect(collection.items[1]._props.id).toEqual(dtos[1].id);
    });

    it("works if valid complete entities are provided", () => {
      expect.assertions(3);

      const dtos = defaultShareMetadataPrivateKeysDtos();
      const entity1 = new MetadataPrivateKeyEntity(dtos[0]);
      const entity2 = new MetadataPrivateKeyEntity(dtos[1]);

      const collection = new ShareMetadataPrivateKeysCollection([entity1, entity2]);

      expect(collection).toHaveLength(2);
      expect(collection.items[0]._props.id).toEqual(entity1._props.id);
      expect(collection.items[1]._props.id).toEqual(entity2._props.id);
    });

    it("should throw if the collection schema does not validate", () => {
      expect.assertions(1);

      expect(() => new ShareMetadataPrivateKeysCollection({}))
        .toThrowEntityValidationError("items");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate their schema", () => {
      expect.assertions(2);

      const dtos = defaultShareMetadataPrivateKeysDtos();
      delete dtos[1].data;
      delete dtos[1].armored_key;

      const collection = new ShareMetadataPrivateKeysCollection(dtos, {ignoreInvalidEntity: true});

      expect(collection.items).toHaveLength(1);
      expect(collection.items[0]._props.id).toEqual(dtos[0].id);
    });

    it("should throw if one of data item does not validate the unique metadata_key_id build rule", () => {
      expect.assertions(1);

      const dtos = shareMetadataPrivateKeysWithSameMetadataKeyIdDtos();

      expect(() => new ShareMetadataPrivateKeysCollection(dtos))
        .toThrowCollectionValidationError("1.metadata_key_id.unique");
    });

    it("should, with enabling the ignore invalid option, ignore items which do not validate the unique metadata_key_id build rule", () => {
      expect.assertions(2);

      const dtos = shareMetadataPrivateKeysWithSameMetadataKeyIdDtos();

      const collection = new ShareMetadataPrivateKeysCollection(dtos, {ignoreInvalidEntity: true});

      expect(collection.items).toHaveLength(1);
      expect(collection.items[0]._props.id).toEqual(dtos[0].id);
    });

    it("should throw if one of data item does not validate the same_user_id build rule", () => {
      expect.assertions(1);

      const dtos = shareMetadataPrivateKeysWithDifferentUserIdDtos();

      expect(() => new ShareMetadataPrivateKeysCollection(dtos))
        .toThrowCollectionValidationError("1.user_id.same_user_id");
    });

    it("should not throw if the collection has many items without metadata_key_id", () => {
      expect.assertions(1);

      const dtos = defaultShareMetadataPrivateKeysDtos(4);
      delete dtos[0].metadata_key_id;
      delete dtos[3].metadata_key_id;

      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection).toHaveLength(4);
    });
  });

  describe("::hasDecryptedPrivateKeys", () => {
    it("should return true if at least 1 key in the collection is decrypted", () => {
      expect.assertions(1);

      const dtos = shareMetadataPrivateKeysWithDecryptedKeyDtos();

      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection.hasDecryptedPrivateKeys()).toStrictEqual(true);
    });

    it("should return false of none of the key in the collection is decrypted", () => {
      expect.assertions(1);

      const dtos = shareMetadataPrivateKeysWithEncryptedKeyDtos();

      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection.hasDecryptedPrivateKeys()).toStrictEqual(false);
    });

    it("should return false if the collection is empty", () => {
      expect.assertions(1);

      const collection = new ShareMetadataPrivateKeysCollection([]);

      expect(collection.hasDecryptedPrivateKeys()).toStrictEqual(false);
    });
  });

  describe("::hasEncryptedPrivateKeys", () => {
    it("should return true if at least 1 key in the collection is encrypted", () => {
      expect.assertions(1);

      const dtos = shareMetadataPrivateKeysWithEncryptedKeyDtos();
      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection.hasEncryptedPrivateKeys()).toStrictEqual(true);
    });

    it("should return false of none of the key in the collection is encrypted", () => {
      expect.assertions(1);

      const dtos = shareMetadataPrivateKeysWithDecryptedKeyDtos();

      const collection = new ShareMetadataPrivateKeysCollection(dtos);

      expect(collection.hasEncryptedPrivateKeys()).toStrictEqual(false);
    });

    it("should return false if the collection is empty", () => {
      expect.assertions(1);

      const collection = new ShareMetadataPrivateKeysCollection([]);

      expect(collection.hasEncryptedPrivateKeys()).toStrictEqual(false);
    });
  });
});
