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

import PostponedUserSettingInvitationService from './postponedUserSettingInvitationService';

describe("PostponedUserSettingInvitation service", () => {
  it("Retrieve the right information", async() => {
    expect.assertions(2);
    //Check that the default value is false
    expect(PostponedUserSettingInvitationService.hasPostponed()).toBe(false);

    PostponedUserSettingInvitationService.postpone();
    expect(PostponedUserSettingInvitationService.hasPostponed()).toBe(true);
  });

  it("Should listen the event passbolt.auth.after-logout and reset the postpone the right information", async() => {
    expect.assertions(3);
    PostponedUserSettingInvitationService.init();
    expect(PostponedUserSettingInvitationService.hasPostponed()).toBe(false);

    PostponedUserSettingInvitationService.postpone();
    expect(PostponedUserSettingInvitationService.hasPostponed()).toBe(true);

    window.dispatchEvent(new Event('passbolt.auth.after-logout'));
    expect(PostponedUserSettingInvitationService.hasPostponed()).toBe(false);
  });
});
