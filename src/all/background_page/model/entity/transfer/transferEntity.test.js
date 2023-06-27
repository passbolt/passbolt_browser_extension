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
import TransferEntity from "./transferEntity";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";
import EntitySchema from "passbolt-styleguide/src/shared/models/entity/abstract/entitySchema";

describe("Transfer entity", () => {
  it("schema must validate", () => {
    EntitySchema.validateSchema(TransferEntity.ENTITY_NAME, TransferEntity.getSchema());
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {'total_pages': 3};
    const entity = new TransferEntity(dto);
    expect(entity.toDto()).toEqual(dto);
  });

  it("constructor works if valid DTO is provided with optional and non supported fields", () => {
    const dto = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'user_id': '7f077753-0835-4054-92ee-556660ea04f2',
      'hash': '0809f23914bc27cd25196d9a968cb23a6652efa0b0233afe043bea54dc64468de952d50ffd53898098bf44a9b125b96aa5bbff7c900f36530d62b883e05afb3d',
      'current_page': 0,
      'total_pages': 3,
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
      'authentication_token': {
        'id': '7f077753-0835-4054-92ee-556660ea04f3',
        'token': '7f077753-0835-4054-92ee-556660ea04f4',
        'active': true,
        'type': 'mobile_transfer',
        'created': '2020-04-25 12:52:00',
        'modified': '2020-04-25 12:52:01',
      },
      '_type': 'none'
    };
    const filtered = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'user_id': '7f077753-0835-4054-92ee-556660ea04f2',
      'hash': '0809f23914bc27cd25196d9a968cb23a6652efa0b0233afe043bea54dc64468de952d50ffd53898098bf44a9b125b96aa5bbff7c900f36530d62b883e05afb3d',
      'current_page': 0,
      'total_pages': 3,
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01'
    };
    const filteredWithAssoc = {
      'id': '7f077753-0835-4054-92ee-556660ea04f1',
      'user_id': '7f077753-0835-4054-92ee-556660ea04f2',
      'hash': '0809f23914bc27cd25196d9a968cb23a6652efa0b0233afe043bea54dc64468de952d50ffd53898098bf44a9b125b96aa5bbff7c900f36530d62b883e05afb3d',
      'current_page': 0,
      'total_pages': 3,
      'created': '2020-04-25 12:52:00',
      'modified': '2020-04-25 12:52:01',
      'authentication_token': {
        'id': '7f077753-0835-4054-92ee-556660ea04f3',
        'token': '7f077753-0835-4054-92ee-556660ea04f4',
        'active': true,
        'type': 'mobile_transfer',
        'created': '2020-04-25 12:52:00',
        'modified': '2020-04-25 12:52:01',
      },
    };

    const transferEntity = new TransferEntity(dto);
    expect(transferEntity.toDto()).toEqual(filtered);
    expect(transferEntity.toDto({authentication_token: true})).toEqual(filteredWithAssoc);

    // test getters
    expect(transferEntity.id).toEqual('7f077753-0835-4054-92ee-556660ea04f1');
    expect(transferEntity.created).toEqual('2020-04-25 12:52:00');
    expect(transferEntity.modified).toEqual('2020-04-25 12:52:01');
  });

  it("constructor returns validation error if dto fields are invalid", () => {
    let t;
    t = () => { new TransferEntity({'id': 'nope', 'total_pages': 3}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'user_id': 'nope', 'total_pages': 3}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'hash': 3, 'total_pages': 3}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'current_page': 'nope', 'total_pages': 3}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'total_pages': 'nope'}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'created': 'nope', 'total_pages': 3}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'modified': 'nope', 'total_pages': 3}); };
    expect(t).toThrow(EntityValidationError);

    t = () => { new TransferEntity({'total_pages': 3, 'authentication_token': {id: 'nope'}}); };
    expect(t).toThrow(EntityValidationError);
  });
});
