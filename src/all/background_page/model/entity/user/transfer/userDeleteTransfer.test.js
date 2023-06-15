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
 * @since         3.0.0
 */
import UserDeleteTransferEntity from "./userDeleteTransfer";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("User delete transfer entity", () => {
  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      owners: [{
        aco_foreign_key: '8e3874ae-4b40-590b-968a-418f704b9d9a',
        id: '898ce1d0-601f-5194-976b-147a680dd472'
      }],
      managers: [{
        group_id: '47787831-f9c2-4edc-a27f-06978ac18406',
        id: '0c17f5e3-2f28-4697-9e7b-4e4943ec546a'
      }, {
        group_id: '47787831-f9c2-4edc-a27f-06978ac18405',
        id: '0c17f5e3-2f28-4697-9e7b-4e4943ec5465'
      }]
    };
    expect(UserDeleteTransferEntity.validate(dto)).toEqual(dto);
    const userDeleteTransfer = new UserDeleteTransferEntity(dto);
    expect(userDeleteTransfer.toDto()).toEqual(dto);

    expect(userDeleteTransfer.owners).toBeDefined();
    expect(userDeleteTransfer.owners.length).toBe(1);
    expect(userDeleteTransfer.owners.items[0].id).toBe('898ce1d0-601f-5194-976b-147a680dd472');
    expect(userDeleteTransfer.owners.items[0].acoForeignKey).toBe('8e3874ae-4b40-590b-968a-418f704b9d9a');

    expect(userDeleteTransfer.managers).toBeDefined();
    expect(userDeleteTransfer.managers.length).toBe(2);
    expect(userDeleteTransfer.managers.items[0].id).toBe('0c17f5e3-2f28-4697-9e7b-4e4943ec546a');
    expect(userDeleteTransfer.managers.items[0].groupId).toBe('47787831-f9c2-4edc-a27f-06978ac18406');
  });

  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      owners: [{
        aco_foreign_key: '8e3874ae-4b40-590b-968a-418f704b9d9a',
        id: '898ce1d0-601f-5194-976b-147a680dd472'
      }]
    };
    expect(UserDeleteTransferEntity.validate(dto)).toEqual(dto);
    const userDeleteTransfer = new UserDeleteTransferEntity(dto);
    expect(userDeleteTransfer.toDto()).toEqual(dto);

    expect(userDeleteTransfer.owners).toBeDefined();
    expect(userDeleteTransfer.owners.length).toBe(1);
    expect(userDeleteTransfer.owners.items[0].id).toBe('898ce1d0-601f-5194-976b-147a680dd472');
    expect(userDeleteTransfer.owners.items[0].acoForeignKey).toBe('8e3874ae-4b40-590b-968a-418f704b9d9a');
  });

  it("constructor works fails if not enough data is provided", () => {
    let t;
    t = () => { new UserDeleteTransferEntity({}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UserDeleteTransferEntity({owners: []}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UserDeleteTransferEntity({owners: [{}]}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UserDeleteTransferEntity({owners: [{id: '898ce1d0-601f-5194-976b-147a680dd472'}]}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UserDeleteTransferEntity({managers: []}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new UserDeleteTransferEntity({managers: [{id: '898ce1d0-601f-5194-976b-147a680dd472'}]}); };
    expect(t).toThrow(EntityValidationError);
  });
});
