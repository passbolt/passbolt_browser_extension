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
import GroupService from "./groupService";

describe("Group entity", () => {
  it('remap legacy contains', () => {
    const v1 = {
      Group: {
        name: 'test name',
      },
      GroupUsers: [
        {GroupUser: {user_id: 'uuid1'}},
        {GroupUser: {user_id: 'uuid2', is_admin: 1}},
        {GroupUser: {user_id: 'uuid3', is_admin: 0}},
      ]
    };
    const v2 = {
      name: 'test name',
      groups_users: [
        {user_id: 'uuid1'},
        {user_id: 'uuid2', is_admin: true},
        {user_id: 'uuid3', is_admin: false},
      ]
    };
    const sut = GroupService.remapV2DataToV1(v2); // crassette
    expect(sut).toEqual(v1);
  });

  it('remap to legacy data', () => {
    let v2 = {
      'modifier': true,
      'groups_users': true
    };
    let v1 = {
      'modifier': true,
      'group_user': true
    };
    expect(GroupService.remapLegacyContain(v2)).toEqual(v1);
    v2 = {groups_users: {user: {profile: true}}};
    v1 = {group_user: {user: {profile: true}}};
    expect(GroupService.remapLegacyContain(v2)).toEqual(v1);
  });
});
