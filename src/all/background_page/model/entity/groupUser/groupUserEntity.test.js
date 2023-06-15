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
import GroupUserEntity from "./groupUserEntity";
import {GroupUserEntityFixtures} from "./groupUserEntity.test.fixtures";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Group user entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(GroupUserEntity.ENTITY_NAME, GroupUserEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = GroupUserEntityFixtures.default;
    const entity = new GroupUserEntity(dto);
    expect(entity.toDto()).toEqual(GroupUserEntityFixtures.associationless);
  });
});
