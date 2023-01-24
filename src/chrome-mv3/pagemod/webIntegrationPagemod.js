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
import User from "../../all/background_page/model/user";
import {ConfigEvents} from "../../all/background_page/event/configEvents";
import {WebIntegrationEvents} from "../../all/background_page/event/webIntegrationEvents";
import {OrganizationSettingsEvents} from "../../all/background_page/event/organizationSettingsEvents";
import {PortEvents} from "../../all/background_page/event/portEvents";
import ParseWebIntegrationUrlService
  from "../../all/background_page/service/webIntegration/parseWebIntegrationUrlService";

class WebIntegration extends Pagemod {
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
    return [ConfigEvents, WebIntegrationEvents, OrganizationSettingsEvents, PortEvents];
  }

  /**
   * @inheritDoc
   */
  async canBeAttachedTo(frameDetails) {
    return this.assertUrlAttachConstraint(frameDetails);
  }

  /**
   * Assert that the attached frame is a top frame.
   * @param {Object} frameDetails
   * @returns {boolean}
   */
  assertUrlAttachConstraint(frameDetails) {
    const user = User.getInstance();
    if (user.isValid()) {
      return ParseWebIntegrationUrlService.test(frameDetails.url);
    }
    return false;
  }
}

export default new WebIntegration('WebIntegration');
