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
 */
import InformCallToActionController from "../controller/informCallToActionController/informCallToActionController";
import AuthCheckStatusController from "../controller/auth/authCheckStatusController";
import IsApplicationOverlaidController from "../controller/applicationOverlaid/IsApplicationOverlaidController";

/**
 * Listens the inform call to action events
 * @param {Worker} worker
 * @param {ApiClientOptions} apiClientOptions
 * @param {AccountEntity} account the user account
 */
const listen = function (worker, apiClientOptions, account) {
  /*
   * Whenever the in-form call-to-action status is required
   * @listens passbolt.in-form-cta.check-status
   * @param requestId {uuid} The request identifier
   * @returns {*{isAuthenticated,isMfaRequired}
   */
  worker.port.on("passbolt.in-form-cta.check-status", async (requestId, flushCache = false) => {
    const authIsAuthenticatedController = new AuthCheckStatusController(worker, requestId);
    await authIsAuthenticatedController._exec(flushCache);
  });

  /*
   * Whenever the in-form call-to-action suggested resources is required
   * @listens passbolt.in-form-cta.suggested-resources
   * @param requestId {uuid} The request identifier
   * @returns {*[]|number}
   */
  worker.port.on("passbolt.in-form-cta.suggested-resources", async (requestId) => {
    const informCallToActionController = new InformCallToActionController(worker, apiClientOptions, account);
    await informCallToActionController.countSuggestedResourcesCount(requestId);
  });

  /*
   * Whenever the in-form call-to-action is executed
   * @listens passbolt.in-form-cta.execute
   * @param requestId {uuid} The request identifier
   */
  worker.port.on("passbolt.in-form-cta.execute", async (requestId) => {
    const informCallToActionController = new InformCallToActionController(worker, apiClientOptions, account);
    await informCallToActionController.execute(requestId);
  });

  /*
   * Whenever the in-form call-to-action is application overlaid
   * @listens passbolt.in-form-cta.is-application-overlaid
   * @param requestId {uuid} The request identifier
   * @param applicationId {uuid} The application id
   */
  worker.port.on("passbolt.in-form-cta.is-application-overlaid", async (requestId, applicationId) => {
    const controller = new IsApplicationOverlaidController(worker, requestId);
    await controller._exec(applicationId);
  });
};

export const InformCallToActionEvents = { listen };
