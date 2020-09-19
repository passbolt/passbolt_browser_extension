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
import {GroupEntity} from "./groupEntity";
import {GroupEntityTestFixtures} from "./groupEntity.test.fixtures";
import {EntitySchema} from "../abstract/entitySchema";
import Validator from 'validator';

// Reset the modules before each test.
beforeEach(() => {
  window.Validator = Validator;
  jest.resetModules();
});

describe("Group entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupEntity.ENTITY_NAME, GroupEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GroupEntityTestFixtures.default;
    const entity = new GroupEntity(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.name).toEqual('test group');
  });
});
