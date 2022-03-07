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
 * @since         3.6.0
 */
import {EntitySchema} from "../abstract/entitySchema";
import {EntityValidationError} from "../abstract/entityValidationError";
import {AccountRecoveryRequestEntity} from "./accountRecoveryRequestEntity";
import {AccountRecoveryRequestEntityTestFixtures} from "./accountRecoveryRequestEntity.test.fixtures";

describe("AccountRecoveryRequest entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(AccountRecoveryRequestEntity.ENTITY_NAME, AccountRecoveryRequestEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "authentication_token_id": "d4c0e643-3967-443b-93b3-102d902c4512",
      "status": "pending",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    };
    const entity = new AccountRecoveryRequestEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO with associated entity data is provided", () => {
    const dto = AccountRecoveryRequestEntityTestFixtures.default;
    const filtered = {
      "id": "d4c0e643-3967-443b-93b3-102d902c4510",
      "user_id": "d4c0e643-3967-443b-93b3-102d902c4511",
      "armored_key": "-----BEGIN PGP MESSAGE-----\n\nwcFMAxYTR81eetNbAQ\/\/TEWCA7W1kx7IzcZi4nmT92IZbdpzCBSQt5htSCoJ\nFfzGd27yeDT2GoEtmxmkG+gEak8ci0Jxa9FECaYDBzG4ixEDfDMfWqw\/WK2w\nj04oja+0qCAimV2nyItSYoaK5aZj8vL97V6U\/7YcraC9QTNY1Kd8RDPeL32D\nO2dpquPDLx5uMAmMoSZWruNCGqqJPjxMcxc2PBco+GJMcaGcYa5Y3+YueNpZ\nIIS0PbMpgiJlVvYzZywYC5lkIKFadVeV6MNkMmJfWB4VHq2Hoo3poZVP1rZV\n6cU7a7UuG4W3UUmezxQGQ6WAjh+qzkQHXrwI3cgU14du9sTCh8occwcPhG1C\nj8ljcTJqexQxA91TSj2UqhAnyB9yzZRcoh38bj\/OyGQmtiwxEFIzUymSi2pt\nysjJOZ7lB1Oh2l4vbgxJoNxtgvzY+3dsNXL510x793Hev3X2YcbO\/TJoy6G9\n89cuocJ1dlLIHqrfri43y1V0ZTfoa\/vigma4Qa5kUtB1tN0j38z+6tcjiz\/s\n8RJmXUK2bfHhvEbuc\/YnDDltpiZHc3QUtbj5TV2m+fO0ad2jVqxsi4eZid\/V\n\/WDUrAxRzY7xNRTRQQDbnT831NZeZbYobCpfPqU8ylF9iv\/V4lsyNYFrU0ne\n37JRFzl3cOY+jlqxGHaAF9\/mC3b3D3DmlZ+kOOQ7lE\/SwaoBAuDaJRsKzNqj\nTz8UFif5iwrEQY5BNzYd+zwGVzMlVP\/RNXR2YlAHx5lPMylgI73RDMoMZ4RT\nb7AQB9DqgobZI3dh3B90XqjkRiy3VJ\/nMhwknaZc6onJQgl2O\/ULie9kh69U\n1ojIkN+SHFCl42T1iT2eN08QUPffDVTMvT103WlX+MW8FV6CmF+TcDRUexs3\nT\/2EvFlxP6QTG41vLk4Sm3xce7rEZHiJ9hRrF26xVfT5jM+7z149lP5J8mgA\nARSBj2jlO7P1afQX+5RyYR+guD9LN95qMsNJwukTCzIo1AhE7yywf7b8v3a6\nXyanZo+TbDqxnJlozEMsdyGBwBn7UX6Erv072cZadO\/ZG2RBkbgiBGZ5hAjg\nPqwRAkfzDNa4WhsE9Crqs5ROy6IsDBGuAa8\/as0oCzIV+Ou4BPzKHfQDQS6U\nT0R+48sVAZAYY7TqaNHvf+3nlqMyssaK0SPm2fg3DZXPM2pcDatCFb4gVElC\n1qbG8pRIBmS\/NYr8m7IBnazDs9L6lYAjybuHes6cPqasDmHKha6DKl1P6jX+\nEeDxA0AVL4rZdUCt1fpEcFR\/R\/o4uDDLO8NGiHwM3MnbNI8G0SQy8q\/NhI11\nzWXyDeAR6hHKYC4h6WCCTFxe364PWLjQ5PGOLeAfeWEPCDZmP6U99kwoiOUu\ni8UuoIAFon3lIOXZnJ3ZtAcQ5UJ3gNcJH1EImZFdYtRgLo3GOPjBcNqGbmCu\n4xo+yMGy9Y8YJZM9HakKAChmHf01J3DAwNfUm8Rhx5w+NBQRm0aJ319wsACH\nlLEYvv+bVfPkNTvW\/vWND9eOPGI0Q8o=\n=AOt0\n-----END PGP MESSAGE-----\n",
      "fingerprint": "0C1D1761110D1E33C9006D1A5B1B332ED06426D3",
      "authentication_token_id": "d4c0e643-3967-443b-93b3-102d902c4512",
      "status": "pending",
      "created": "2020-05-04T20:31:45+00:00",
      "modified": "2020-05-04T20:31:45+00:00",
      "created_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856",
      "modified_by": "d57c10f5-639d-5160-9c81-8a0c6c4ec856"
    };
    const entity = new AccountRecoveryRequestEntity(dto);
    expect(entity.toDto()).toEqual(filtered);
    expect(entity.accountRecoveryPrivateKeyPasswords).not.toBe(null);
    expect(entity.accountRecoveryPrivateKeyPasswords.length).toEqual(1);

    const dtoWithContain = entity.toDto({account_recovery_private_key_passwords: true});
    expect(dtoWithContain.account_recovery_private_key_passwords[0].recipient_foreign_key).toEqual('10801423-4151-42a4-99d1-86e66145a08c');
  });

  it("constructor returns validation error if dto required fields are missing", () => {
    try {
      new AccountRecoveryRequestEntity({});
    } catch (error) {
      expect(error instanceof EntityValidationError).toBe(true);
      expect(error.details).toEqual({
        id: {required: 'The id is required.'},
        authentication_token_id: {required: 'The authentication_token_id is required.'},
        status: {required: 'The status is required.'},
        created: {required: 'The created is required.'},
        created_by: {required: 'The created_by is required.'},
        modified: {required: 'The modified is required.'},
        modified_by: {required: 'The modified_by is required.'},
      });
    }
  });
});

