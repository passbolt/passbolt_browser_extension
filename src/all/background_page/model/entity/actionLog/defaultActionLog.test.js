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
 */
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import DefaultActionLogEntity from "./defaultActionLogEntity";
import UpdatedPermissionEntity from "../permission/actionLog/updatedPermissionEntity";
import {DefaultActionLogEntityTestFixtures} from './defaultActionLogEntity.test.fixtures';

describe("Default action log entity", () => {
  function getDummyDefaultActionLogDto(changes) {
    changes = changes || {};
    const dto = JSON.parse(JSON.stringify(DefaultActionLogEntityTestFixtures));
    return Object.assign(dto, changes);
  }

  it("schema must validate", () => {
    EntitySchema.validateSchema(DefaultActionLogEntity.ENTITY_NAME, DefaultActionLogEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = getDummyDefaultActionLogDto();
    const entity = new DefaultActionLogEntity(dto);
    expect(entity.toDto()).toEqual(dto);
    expect(entity.id).toEqual("5b998a97-29fb-5b1d-86d7-a026867addec");
    expect(entity.actionLogId).toEqual("eebf0a92-18a4-440e-8aa8-799287fc2c26");
    expect(entity.type).toBe("Resources.created");
    expect(entity.creator.id).toEqual('f848277c-5398-58f8-a82a-72397af2d450');
    expect(entity.creator.username).toEqual('ada@passbolt.com');
    expect(entity.creator.profile.firstName).toBe('Ada');
    expect(entity.creator.profile.lastName).toBe('Lovelace');
    expect(entity.creator.profile.avatar.urlMedium).toBe("img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.a99472d5.png");
    expect(entity.creator.profile.avatar.urlSmall).toBe("img\/public\/Avatar\/22\/47\/85\/50adf80e3534413abdd8e34c9be6d1b6\/50adf80e3534413abdd8e34c9be6d1b6.65a0ba70.png");
  });

  it("constructor works fails if not enough data is provided", () => {
    let t;
    t = () => { new UpdatedPermissionEntity({}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UpdatedPermissionEntity({id: "5b998a97-29fb-5b1d-86d7-a026867addec"}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UpdatedPermissionEntity({id: "5b998a97-29fb-5b1d-86d7-a026867addec", "action_log_id": "eebf0a92-18a4-440e-8aa8-799287fc2c26"}); };
    expect(t).toThrow(EntityValidationError);
  });

  it("constructor throws an exception if DTO contains invalid field", () => {
    try {
      new DefaultActionLogEntity({
        "id": "🤷",
        "action_log_id": "🤷",
        "type": 42
      });
      expect(false).toBe(true);
    } catch (error) {
      expect((error instanceof EntityValidationError)).toBe(true);
      expect(error.hasError('id', 'format')).toBe(true);
      expect(error.hasError('action_log_id', 'format')).toBe(true);
      expect(error.hasError('type', 'type')).toBe(true);
    }
  });
});
