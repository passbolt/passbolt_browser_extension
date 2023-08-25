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
import UpdateSubscriptionEntity from "./updateSubscriptionEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Update subscription entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(UpdateSubscriptionEntity.ENTITY_NAME, UpdateSubscriptionEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "data": "key"
    };
    const entity = new UpdateSubscriptionEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new UpdateSubscriptionEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        data: {required: 'The data is required.'}
      });
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new UpdateSubscriptionEntity({
        "data": []
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        data: {type: 'The data is not a valid string.'},
      });
    }
  });
});

