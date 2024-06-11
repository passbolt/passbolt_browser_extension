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
import {PublicWebsiteSignInEvents} from "../event/publicWebsiteSignInEvents";
import ParsePublicWebsiteUrlService from "../service/publicWebsite/parsePublicWebsiteUrlService";
import GetActiveAccountService from "../service/account/getActiveAccountService";

class PublicWebsiteSignIn extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "PublicWebsiteSignIn";
  }

  /**
   * @inheritDoc
   */
  get contentScriptFiles() {
    return [
      'contentScripts/js/dist/public-website-sign-in/vendors.js',
      'contentScripts/js/dist/public-website-sign-in/public-website-sign-in.js'
    ];
  }

  /**
   * @inheritDoc
   */
  get events() {
    return [PublicWebsiteSignInEvents];
  }

  /**
   * @inheritDoc
   */
  async canBeAttachedTo(frameDetails) {
    return this.assertTopFrameAttachConstraint(frameDetails)
      && this.assertUrlAttachConstraint(frameDetails)
      && await this.assertUserValidConstraint();
  }

  /**
   * @inheritDoc
   */
  async attachEvents(port) {
    try {
      const tab = port._port.sender.tab;
      const account =  await GetActiveAccountService.get();
      for (const event of this.events) {
        event.listen({port, tab}, null, account);
      }
    } catch (error) {
      // Unexpected error, this pagemod shouldn't have been initialized as the PublicWebsiteSignPagemod should have raised an exception and not inject the content script.
      console.error('PublicWebsiteSignIn::attach legacy account cannot be retrieved, please contact your administrator.');
      console.error(error);
    }
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
   * @returns {boolean}
   */
  assertUrlAttachConstraint(frameDetails) {
    return ParsePublicWebsiteUrlService.test(frameDetails.url);
  }

  /**
   * Assert that the user is valid.
   * @returns {Promise<boolean>}
   */
  async assertUserValidConstraint() {
    try {
      await GetActiveAccountService.get();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default new PublicWebsiteSignIn();
