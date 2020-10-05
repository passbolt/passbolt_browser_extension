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
 * @since         2.13.0
 */
import {UsersCollection} from "./usersCollection";
import {EntityCollectionError} from "../abstract/entityCollectionError";
import {UsersCollectionTestFixtures} from "./usersCollection.test.fixtures";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each user1.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("User entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UsersCollection.ENTITY_NAME, UsersCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const user1 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec851",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user1@passbolt.com"
    };
    const user2 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec852",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user2@passbolt.com"
    };
    const dto = [user1, user2];
    const entity = new UsersCollection(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(JSON.stringify(entity)).toEqual(JSON.stringify(dto));
    expect(entity.items[0].username).toEqual('user1@passbolt.com');
    expect(entity.items[1].username).toEqual('user2@passbolt.com');
    expect(entity.ids).toEqual(["d57c10f5-639d-5160-9c81-8a0c6c4ec851", "d57c10f5-639d-5160-9c81-8a0c6c4ec852"])
  });

  it("constructor fails if reusing same user", () => {
    const user1 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec851",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user1@passbolt.com"
    };
    const dto = [user1, user1];

    let t = () => {new UsersCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if reusing same id", () => {
    const user1 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec851",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user1@passbolt.com"
    };
    const user2 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec851",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user2@passbolt.com"
    };
    const dto = [user1, user2];

    let t = () => {new UsersCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor fails if reusing same username", () => {
    const user1 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec851",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user1@passbolt.com"
    };
    const user2 = {
      "id": "d57c10f5-639d-5160-9c81-8a0c6c4ec852",
      "role_id": "0d51c3a8-5e67-5e3d-882f-e1868966d817",
      "username": "user1@passbolt.com"
    };
    const dto = [user1, user2];

    let t = () => {new UsersCollection(dto)};
    expect(t).toThrow(EntityCollectionError);
  });

  it("constructor works with empty collection", () => {
    const collection = new UsersCollection([]);
    expect(collection.ids).toEqual([]);
  });

  it("serialization works with full object inside collection", () => {
    const dto = UsersCollectionTestFixtures.default;
    const collection = new UsersCollection(dto);
    expect(collection.toDto()).toEqual(dto);
  });
});
