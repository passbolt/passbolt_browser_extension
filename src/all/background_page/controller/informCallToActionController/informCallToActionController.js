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
 * @since         3.4.0
 */
const Worker = require('../../model/worker');
const {ResourceModel} = require('../../model/resource/resourceModel');

class InformCallToActionController {
  /**
   * ExportResourcesFileController constructor
   * @param {Worker} worker
   * @param {ApiClientOptions} clientOptions
   */
  constructor(worker, clientOptions) {
    this.worker = worker;

    // Models
    this.resourceModel = new ResourceModel(clientOptions);
  }

  /**
   * Open the quick access popup
   */
  openQuickAccessPopup() {
    chrome.browserAction.getPopup({}, (popup) => {
      const detachedQuickAccess = window.open(popup, "extension_popup", `width=380,height=400,scrollbars=0,toolbar=0,location=0,resizable=0,status=0`);
      detachedQuickAccess.document.title = "Passbolt";
    });
  }

  /**
   * Open the mfa page
   * @param {String} url
   */
  openMfa(url) {
    chrome.tabs.create({url, active: true});
  }

  /**
   * Returns the count of suggested resources
   * @return {*[]|number}
   */
  countSuggestedResources() {
    return this.resourceModel.countSuggestedResources(this.worker.tab.url);
  }

}


exports.InformCallToActionController = InformCallToActionController;
