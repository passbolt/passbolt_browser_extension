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
import GpgAuth from "../../all/background_page/model/gpgauth";
import {AppBootstrapEvents} from "../../all/background_page/event/appBootstrapEvents";
import ParseAppUrlService from "../../all/background_page/service/app/parseAppUrlService";
import {PortEvents} from "../../all/background_page/event/portEvents";

class AppBootstrap extends Pagemod {
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
    return [AppBootstrapEvents, PortEvents];
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
      && this.assertUrlAttachConstraint(frameDetails) &&
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
   * @returns {boolean}
   */
  assertUrlAttachConstraint(frameDetails) {
    const user = User.getInstance();
    if (user.isValid()) {
      return ParseAppUrlService.test(frameDetails.url);
    }
    return false;
  }

  /**
   * Is the constraint validated
   * @returns {Promise<boolean>}
   */
  assertUserAuthenticated() {
    const auth = new GpgAuth();
    const onSuccess = value => value;
    const onReject = () => false;
    return auth.isAuthenticated().then(onSuccess, onReject);
  }
}

export default new AppBootstrap('AppBootstrap');
