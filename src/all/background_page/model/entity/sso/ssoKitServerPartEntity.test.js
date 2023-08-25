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

  const data = generateSsoKitServerData({});
  const dto = {data};

  it("constructor works if valid minimal DTO is provided", async() => {
    expect.assertions(1);

    const entity = new SsoKitServerPartEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if full valid DTO is provided", async() => {
    expect.assertions(1);
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

  it("constructor returns validation error if dto required fields are invalid", () => {
    const invalidData = [
      1,
      false,
      -13,
      123.43,
      "",
      "nek",
      {},
      generateSsoKitServerData({alg: "A128GCM"}),
      generateSsoKitServerData({alg: 256}),
      generateSsoKitServerData({alg: false}),
      generateSsoKitServerData({alg: {}}),
      generateSsoKitServerData({ext: false}),
      generateSsoKitServerData({k: 1}),
      generateSsoKitServerData({k: false}),
      generateSsoKitServerData({k: {}}),
      generateSsoKitServerData({key_ops: ["encrypt", "decrypt", "sign"]}),
      generateSsoKitServerData({key_ops: ["encrypt"]}),
      generateSsoKitServerData({key_ops: ["decrypt"]}),
      generateSsoKitServerData({key_ops: "decrypt"}),
      generateSsoKitServerData({key_ops: 1}),
      generateSsoKitServerData({key_ops: false}),
      generateSsoKitServerData({key_ops: {}}),
      generateSsoKitServerData({key_ops: {decrypt: "decrypt", encrypt: "encrypt"}}),
      generateSsoKitServerData({kty: ""}),
      generateSsoKitServerData({kty: 1}),
      generateSsoKitServerData({kty: false}),
      generateSsoKitServerData({kty: "EC"}),
    ];

    expect.assertions(invalidData.length);

    for (let i = 0; i < invalidData.length; i++) {
      const dto = {data: invalidData[i]};
      expect(() => new SsoKitServerPartEntity(dto)).toThrow();
    }
  });
});
