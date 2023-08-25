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
 * @since         3.2.0
 */
import AuthenticationTokenEntity from "./authenticationTokenEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("AuthenticationToken entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AuthenticationTokenEntity.ENTITY_NAME, AuthenticationTokenEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      'token': '7f077753-0835-4054-92ee-556660ea04f4'
    };
    const entity = new AuthenticationTokenEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      'id': '7f077753-0835-4054-92ee-556660ea04f3',
      'token': '7f077753-0835-4054-92ee-556660ea04f4',
      'active': true,
      'type': 'mobile_transfer',
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
      '_type': 'none'
    };
    const filtered = {
      'id': '7f077753-0835-4054-92ee-556660ea04f3',
      'token': '7f077753-0835-4054-92ee-556660ea04f4',
      'active': true,
      'type': 'mobile_transfer',
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
    };

    const authenticationTokenEntity = new AuthenticationTokenEntity(dto);
    expect(authenticationTokenEntity.toDto()).toEqual(filtered);

    // test getters
    expect(authenticationTokenEntity.token).toEqual('7f077753-0835-4054-92ee-556660ea04f4');
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    let t;
    t = () => {
      new AuthenticationTokenEntity({
        'id': 'nope',
        'token': '7f077753-0835-4054-92ee-556660ea04f4'
      });
    };
    expect(t).toThrow(EntityValidationError);

    t = () => {
      new AuthenticationTokenEntity({
        'active': 'nope',
        'token': '7f077753-0835-4054-92ee-556660ea04f4'
      });
    };
    expect(t).toThrow(EntityValidationError);

    t = () => {
      new AuthenticationTokenEntity({
        'type': 'nope',
        'token': '7f077753-0835-4054-92ee-556660ea04f4'
      });
    };
    expect(t).toThrow(EntityValidationError);

    t = () => {
      new AuthenticationTokenEntity({
        'created': 'nope',
        'token': '7f077753-0835-4054-92ee-556660ea04f4'
      });
    };
    expect(t).toThrow(EntityValidationError);

    t = () => {
      new AuthenticationTokenEntity({
        'created': 'modified',
        'token': '7f077753-0835-4054-92ee-556660ea04f4'
      });
    };
    expect(t).toThrow(EntityValidationError);
  });
});
