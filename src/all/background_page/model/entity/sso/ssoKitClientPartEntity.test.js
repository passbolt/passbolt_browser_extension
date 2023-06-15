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
import "../../../../../../test/mocks/mockCryptoKey";
import SsoKitClientPartEntity from "./ssoKitClientPartEntity";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import {v4 as uuid} from "uuid";
import {clientSsoKit} from "./ssoKitClientPart.test.data";
import GenerateSsoIvService from "../../../service/crypto/generateSsoIvService";

describe("Sso Kit Client Part Entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(SsoKitClientPartEntity.ENTITY_NAME, SsoKitClientPartEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", async() => {
    expect.assertions(1);
    const dto = clientSsoKit();

    const entity = new SsoKitClientPartEntity(dto);
    expect(entity.toDbSerializableObject()).toEqual(dto);
  });

  it("constructor works if full valid DTO is provided", async() => {
    expect.assertions(1);
    const dto = clientSsoKit({
      created: "2020-05-04T20:31:45+00:00",
      modified: "2020-05-04T20:31:45+00:00",
      created_by: uuid(),
      modified_by: uuid(),
    });

    const entity = new SsoKitClientPartEntity(dto);
    expect(entity.toDbSerializableObject()).toEqual(dto);
  });

  it("constructor returns validation error if dto required fields are invalid", async() => {
    function generateNek({algorithmName = "AES-GCM", algorithmLength = 256, capabilities = ["encrypt", "decrypt"], extractable = false}) {
      const algorithm = {
        name: algorithmName,
        length: algorithmLength
      };
      return new CryptoKey(algorithm, extractable, capabilities);
    }
    const ssoKit = clientSsoKit();
    const invalidNeks = [
      "nek",
      {},
      generateNek({algorithmName: "test"}),
      generateNek({algorithmLength: 10}),
      generateNek({capabilities: []}),
      generateNek({capabilities: ["encrypt"]}),
      generateNek({capabilities: ["decrypt"]}),
      generateNek({capabilities: ["encrypt", "decrypt", "sign"]}),
      generateNek({extractable: true}),
    ];
    const invalidIvs = [{
      iv1: [1, 2, 3],
      iv2: GenerateSsoIvService.generateIv()
    }, {
      iv1: GenerateSsoIvService.generateIv(),
      iv2: [1, 2, 3]
    }, {
      iv1: GenerateSsoIvService.generateIv(),
      iv2: GenerateSsoIvService.generateIv(1)
    }, {
      iv1: GenerateSsoIvService.generateIv(1),
      iv2: GenerateSsoIvService.generateIv()
    }, {
      iv1: GenerateSsoIvService.generateIv(16),
      iv2: GenerateSsoIvService.generateIv()
    }, {
      iv1: GenerateSsoIvService.generateIv(),
      iv2: GenerateSsoIvService.generateIv(16)
    }];

    expect.assertions(invalidNeks.length + invalidIvs.length);

    for (let i = 0; i < invalidNeks.length; i++) {
      const dto = Object.assign({}, ssoKit, {nek: invalidNeks[i]});
      try {
        new SsoKitClientPartEntity(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
      }
    }

    for (let i = 0; i < invalidIvs.length; i++) {
      const dto = Object.assign({}, ssoKit, invalidIvs[i]);
      try {
        new SsoKitClientPartEntity(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(EntityValidationError);
      }
    }
  });

  it("isRegistered returns true only if the data is complete", async() => {
    const ssoKit = clientSsoKit();
    const ssoKitIdLess = clientSsoKit();
    const ssoKitProviderLess = clientSsoKit();

    delete ssoKitIdLess.id;
    delete ssoKitProviderLess.provider;

    const scenarios = [
      {data: ssoKit, isRegistered: true},
      {data: ssoKitIdLess, isRegistered: false},
      {data: ssoKitProviderLess, isRegistered: false},
    ];

    expect.assertions(scenarios.length);
    for (let i = 0; i < scenarios.length; i++) {
      const data = scenarios[i].data;
      const isRegistered = scenarios[i].isRegistered;
      const entity = new SsoKitClientPartEntity(data);
      expect(entity.isRegistered()).toBe(isRegistered);
    }
  });
});
