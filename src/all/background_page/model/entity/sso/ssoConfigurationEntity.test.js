/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2022 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         3.9.0
 */
import SsoSettingsEntity from "./ssoSettingsEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {v4 as uuid} from "uuid";

describe("Sso Settings Entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SsoSettingsEntity.ENTITY_NAME, SsoSettingsEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      "providers": ["azure", "test"],
      "provider": null,
      "data": null,
    };

    const entity = new SsoSettingsEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if full valid DTO is provided", () => {
    expect.assertions(1);
    const dto = {
      id: uuid(),
      providers: ["azure", "test"],
      provider: "azure",
      data: {
        sso_provider_specific_data: "data"
      },
      created: "2020-05-04T20:31:45+00:00",
      modified: "2020-05-04T20:31:45+00:00",
      created_by: uuid(),
      modified_by: uuid(),
    };

    const entity = new SsoSettingsEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are invalid", () => {
    expect.assertions(2);
    try {
      new SsoSettingsEntity({
        id: "🏆‍️",
        providers: [1],
        provider: "azure",
        data: "🏆‍️",
        created: uuid(),
        modified: uuid(),
        created_by: "2020-05-04T20:31:45+00:00",
        modified_by: "2020-05-04T20:31:45+00:00",
      });
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {format: 'The id is not a valid uuid.'},
        created: {format: "The created is not a valid date-time."},
        modified: {format: "The modified is not a valid date-time."},
        created_by: {format: 'The created_by is not a valid uuid.'},
        modified_by: {format: 'The modified_by is not a valid uuid.'},
        data:  {type: "The data is not a valid object."},
      });
    }
  });
});
