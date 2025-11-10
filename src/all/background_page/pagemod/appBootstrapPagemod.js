/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) 2023 Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         4.0.0
 */
import Pagemod from "./pagemod";
import ParseAppUrlService from "../service/app/parseAppUrlService";
import {PortEvents} from "../event/portEvents";
import CheckAuthStatusService from "../service/auth/checkAuthStatusService";
import GetActiveAccountService from "../service/account/getActiveAccountService";

class AppBootstrap extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "AppBootstrap";
  }

  /**
   * @inheritDoc
   */
  get contentStyleFiles() {
    return ['webAccessibleResources/css/themes/default/ext_external.min.css'];
  }

  /**
   * @inheritDoc
   */
  get contentScriptFiles() {
    return [
      'contentScripts/js/dist/vendors.js',
      'contentScripts/js/dist/app.js'
    ];
  }

  /**
   * @inheritDoc
   */
  get events() {
    return [PortEvents];
  }

  /**
   * @inheritDoc
   */
  get mustReloadOnExtensionUpdate() {
    return true;
  }

  /**
   * @inheritDoc
   */
  async canBeAttachedTo(frameDetails) {
    return this.assertTopFrameAttachConstraint(frameDetails)
      && await this.assertUrlAttachConstraint(frameDetails) &&
      await this.assertUserAuthenticated();
  }

  /**
   * Assert that the attached frame is a top frame.
   * @param {Object} frameDetails
   * @returns {boolean}
   */
  assertTopFrameAttachConstraint(frameDetails) {
    return frameDetails.frameId === Pagemod.TOP_FRAME_ID;
  }

  /**
   * Assert that the attached frame is a top frame.
   * @param {Object} frameDetails
   * @returns {Promise<boolean>}
   */
  async assertUrlAttachConstraint(frameDetails) {
    try {
      await GetActiveAccountService.get();
      return ParseAppUrlService.test(frameDetails.url);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Is the constraint validated
   * @returns {Promise<boolean>}
   */
  async assertUserAuthenticated() {
    const checkAuthStatusService = new CheckAuthStatusService();
    const authStatus = await checkAuthStatusService.checkAuthStatus(true);
    return authStatus.isAuthenticated;
  }
}

export default new AppBootstrap();
