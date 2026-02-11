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
 * @since         5.10.0
 */

import { assertString } from "../../utils/assertions";
import BrowserTabService from "./browserTab.service";
import User from "../../model/user";

/**
 * List of allowed path to refresh to the tab with.
 */
const ALLOWED_PAGE_URL = [
  "/app/administration/mfa-policy",
  "/app/administration/mfa",
  "/app/administration/users-directory",
  "/app/administration/self-registration",
  "/app/administration/smtp-settings",
  "/app/administration/email-notification",
  "/app/administration/rbacs",
  "/app/administration/internationalization",
  "/app/administration/healthcheck",
];

export default class OpenAdministrationApiPageService {
  /**
   * Opens an administration page in the current tab
   * @param {string} pageName The name of the administration page to open
   * @returns {Promise<void>}
   * @throws {Error} If the page name is not a valid string
   * @throws {Error} If the page name is not found in the ALLOWED_PAGE_URL
   */
  async openPage(pageName) {
    assertString(pageName);

    const allowedPageIndex = ALLOWED_PAGE_URL.indexOf(pageName);
    if (allowedPageIndex === -1) {
      throw new Error(`Unknown administration page: ${pageName}`);
    }

    const user = User.getInstance();
    let domain = user.settings.getDomain();
    if (domain.endsWith("/")) {
      domain = domain.slice(0, -1);
    }
    const path = ALLOWED_PAGE_URL[allowedPageIndex];
    const url = `${domain}${path}`;

    await BrowserTabService.updateCurrentTabUrl(url);
  }
}
