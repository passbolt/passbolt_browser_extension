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
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import SsoKitServerPartEntity from "./ssoKitServerPartEntity";
import {v4 as uuid} from "uuid";
import {generateSsoKitServerData} from "./ssoKitServerPart.test.data";

describe("Sso Kit Server Part Entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SsoKitServerPartEntity.ENTITY_NAME, SsoKitServerPartEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", async() => {
    expect.assertions(1);

    const data = await generateSsoKitServerData();
    const dto = {data};

    const entity = new SsoKitServerPartEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if full valid DTO is provided", async() => {
    expect.assertions(1);

    const data = await generateSsoKitServerData();
    const dto = {data};

    const fullDto = Object.assign({}, dto, {
      id: uuid(),
      user_id: uuid(),
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      created_by: uuid(),
      modified_by: uuid(),
    });

    const entity = new SsoKitServerPartEntity(fullDto);
    expect(entity.toDto()).toEqual(fullDto);
  });

  it("constructor returns validation error if dto required fields are invalid", async() => {
    const invalidData = [
      1,
      false,
      -13,
      123.43,
      "",
      "nek",
      {},
    ];

    expect.assertions(invalidData.length);

    for (let i = 0; i < invalidData.length; i++) {
      const dto = {data: invalidData[i]};
      expect(() => new SsoKitServerPartEntity(dto)).toThrow();
    }
  });
});
