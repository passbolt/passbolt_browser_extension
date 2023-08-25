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
import SubscriptionEntity from "./subscriptionEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Subscription entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SubscriptionEntity.ENTITY_NAME, SubscriptionEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "subscription_id": "test",
      "users": 10,
      "created": "2021-03-12",
      "expiry": "2022-03-12",
      "data": "key"
    };
    const entity = new SubscriptionEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new SubscriptionEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        subscription_id: {required: 'The subscription_id is required.'},
        users: {required: 'The users is required.'},
        created: {required: 'The created is required.'},
        expiry: {required: 'The expiry is required.'},
        data: {required: 'The data is required.'}
      });
    }
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    try {
      new SubscriptionEntity({
        "customer_id": [],
        "subscription_id": [],
        "users": [],
        "email": "test",
        "created": [],
        "expiry": [],
        "data": []
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        customer_id: {type: 'The customer_id is not a valid string.'},
        subscription_id: {type: 'The subscription_id is not a valid string.'},
        users: {type: 'The users is not a valid integer.'},
        email: {format: 'The email is not a valid email.'},
        created: {type: 'The created is not a valid string.'},
        expiry: {type: 'The expiry is not a valid string.'},
        data: {type: 'The data is not a valid string.'},
      });
    }
  });
});

