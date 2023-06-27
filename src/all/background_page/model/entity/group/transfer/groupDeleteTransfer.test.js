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
import GroupDeleteTransferEntity from "./groupDeleteTransfer";
import EntityValidationError from "passbolt-styleguide/src/shared/models/entity/abstract/entityValidationError";

describe("Group delete transfer entity", () => {
  it("constructor works if valid minimal DTO is provided", () => {
    const dto = {
      owners: [{
        aco_foreign_key: '8e3874ae-4b40-590b-968a-418f704b9d9a',
        id: '898ce1d0-601f-5194-976b-147a680dd472'
      }]
    };
    expect(GroupDeleteTransferEntity.validate(dto)).toEqual(dto);
    const groupDeleteTransfer = new GroupDeleteTransferEntity(dto);
    expect(groupDeleteTransfer.toDto()).toEqual(dto);

    expect(groupDeleteTransfer.owners).toBeDefined();
    expect(groupDeleteTransfer.owners.length).toBe(1);
    expect(groupDeleteTransfer.owners.items[0].id).toBe('898ce1d0-601f-5194-976b-147a680dd472');
    expect(groupDeleteTransfer.owners.items[0].acoForeignKey).toBe('8e3874ae-4b40-590b-968a-418f704b9d9a');
  });

  it("constructor works fails if not enough data is provided", () => {
    let t;
    t = () => { new GroupDeleteTransferEntity({}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new GroupDeleteTransferEntity({owners: []}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new GroupDeleteTransferEntity({owners: [{}]}); };
    expect(t).toThrow(EntityValidationError);
    t = () => { new GroupDeleteTransferEntity({owners: [{id: '898ce1d0-601f-5194-976b-147a680dd472'}]}); };
    expect(t).toThrow(EntityValidationError);
  });
});
