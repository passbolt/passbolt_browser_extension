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
const {InformCallToActionController} = require("../controller/informCallToActionController/informCallToActionController");
const {User} = require('../model/user');
const GpgAuth = require('../model/gpgauth').GpgAuth;
const {Log} = require('../model/log');

/**
 * Listens the inform call to action events
 * @param worker
 */
const listen = function(worker) {

  /*
  * Whenever the the in-form call-to-action status is required
  * @listens passbolt.in-form-cta.check-status
  * @param requestId {uuid} The request identifier
  * @returns {*{isAuthenticated,isMfaRequired}
  */
  worker.port.on('passbolt.in-form-cta.check-status', async requestId => {
    try {
      const auth = new GpgAuth();
      const status = await auth.checkAuthStatus({requestApi: false});
      worker.port.emit(requestId, "SUCCESS", status);
    }
    catch(error) {
      /* When we are in a logged out mode and there's some cleaning of the local storage
       * the check status request the api. In case of unauthenticated user, it throws a 401
       * that we catch right here
       */
      worker.port.emit(requestId, "SUCCESS", {isAuthenticated: false});
    }
  });

  /*
   * Whenever the the in-form call-to-action suggested resources is required
   * @listens passbolt.in-form-cta.suggested-resources
   * @param requestId {uuid} The request identifier
   * @returns {*[]|number}
   */
  worker.port.on('passbolt.in-form-cta.suggested-resources', async requestId => {
    try {
      const apiClientOptions =  await User.getInstance().getApiClientOptions();
      const informCallToActionController = new InformCallToActionController(worker, apiClientOptions);
      worker.port.emit(requestId, "SUCCESS", {suggestedResourcesCount: await informCallToActionController.countSuggestedResources()});
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });

  /*
   * Whenever the the in-form call-to-action is executed
   * @listens passbolt.in-form-cta.execute
   * @param requestId {uuid} The request identifier
   */
  worker.port.on('passbolt.in-form-cta.execute', async requestId => {
    try {
      const auth = new GpgAuth();
      const status = await auth.checkAuthStatus({requestApi: false});
      const apiClientOptions =  await User.getInstance().getApiClientOptions();
      const informCallToActionController = new InformCallToActionController(worker, apiClientOptions);
      if (!status.isAuthenticated) {
        informCallToActionController.openQuickAccessPopup();
        worker.port.emit(requestId, "SUCCESS");
      } else if (status.isMfaRequired) {
        informCallToActionController.openMfa(User.getInstance().settings.getDomain());
        worker.port.emit(requestId, "SUCCESS");
      }
    } catch (error) {
      console.error(error);
      worker.port.emit(requestId, 'ERROR', error);
    }
  });
};

exports.listen = listen;
