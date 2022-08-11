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
import RoleEntity from "./roleEntity";
import EntityValidationError from "../abstract/entityValidationError";
import EntitySchema from "../abstract/entitySchema";

describe("Role entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(RoleEntity.ENTITY_NAME, RoleEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "a58de6d3-f52c-5080-b79b-a601a647ac85",
      "name": "user",
      "description": "Logged in user",
      "created": "2012-07-04T13:39:25+00:00",
      "modified": "2012-07-04T13:39:25+00:00"
    };
    const entity = new RoleEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'name': RoleEntity.ROLE_ADMIN,
      'description': 'role description',
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
      '_type': 'none'
    };
    const filtered = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'name': RoleEntity.ROLE_ADMIN,
      'description': 'role description',
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
    };
    const roleEntity = new RoleEntity(dto);
    expect(roleEntity.toDto()).toEqual(filtered);

    // test getters
    expect(roleEntity.id).toEqual('7f077753-0835-4054-92ee-556660ea04f1');
    expect(roleEntity.name).toEqual(RoleEntity.ROLE_ADMIN);
    expect(roleEntity.description).toEqual('role description');
    expect(roleEntity.created).toEqual('2020-04-25 12:52:00');
    expect(roleEntity.modified).toEqual('2020-04-25 12:52:01');
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    let t = () => { new RoleEntity({'name': 'test'}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new RoleEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1'}); };
    expect(t).toThrow(EntityValidationError);
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    let t = () => { new RoleEntity({'id': 'nope', 'name': 'test'}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new RoleEntity({'id': 'nope', 'name': Array(51).join("a")}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new RoleEntity({'id': '7f077753-0835-4054-92ee-556660ea04f1', 'name': 'user', 'description': Array(257).join("a")}); };
    expect(t).toThrow(EntityValidationError);
  });
});
