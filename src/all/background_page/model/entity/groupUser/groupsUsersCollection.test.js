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
import {GroupsUsersCollection} from "./groupsUsersCollection";
import {GroupsUsersCollectionTestFixtures} from "./groupsUsersCollection.test.fixtures";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Groups users collection", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupsUsersCollection.ENTITY_NAME, GroupsUsersCollection.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GroupsUsersCollectionTestFixtures.default;
    const entity = new GroupsUsersCollection(dto);
    expect(entity.toDto()).toEqual(GroupsUsersCollectionTestFixtures.without_user);
  });
});
