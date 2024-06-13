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
import {ConfigEvents} from "../event/configEvents";
import {WebIntegrationEvents} from "../event/webIntegrationEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {PortEvents} from "../event/portEvents";
import ParseWebIntegrationUrlService from "../service/webIntegration/parseWebIntegrationUrlService";
import GetActiveAccountService from "../service/account/getActiveAccountService";

class WebIntegration extends Pagemod {
  /**
   * @inheritDoc
   * @returns {string}
   */
  get appName() {
    return "WebIntegration";
  }

  /**
   * @inheritDoc
   */
  get contentStyleFiles() {
    return [];
  }

  /**
   * @inheritDoc
   */
  get contentScriptFiles() {
    return [
      'contentScripts/js/dist/browser-integration/vendors.js',
      'contentScripts/js/dist/browser-integration/browser-integration.js'
    ];
  }

  /**
   * @inheritDoc
   */
  get events() {
    return [
      ConfigEvents,
      WebIntegrationEvents,
      OrganizationSettingsEvents,
      PortEvents,
    ];
  }

  /**
   * @inheritDoc
   */
  async canBeAttachedTo(frameDetails) {
    return this.assertTopFrameAttachConstraint(frameDetails)
      && await this.assertUrlAttachConstraint(frameDetails);
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
      return ParseWebIntegrationUrlService.test(frameDetails.url);
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default new WebIntegration();
