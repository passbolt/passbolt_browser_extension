/**
 * WebIntegration pagemod.
 *
 * This pagemod allow inserting classes to help any page
 * to know about the status of the extension, in a modernizr fashion
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
import {Worker} from "../model/worker";
import PageMod from "../sdk/page-mod";
import User from "../model/user";
import {ConfigEvents} from "../event/configEvents";
import {WebIntegrationEvents} from "../event/webIntegrationEvents";
import {OrganizationSettingsEvents} from "../event/organizationSettingsEvents";
import {PortEvents} from "../event/portEvents";


const WebIntegration = function() {};
WebIntegration._pageMod = undefined;

WebIntegration.init = function() {
  if (typeof WebIntegration._pageMod !== 'undefined') {
    WebIntegration._pageMod.destroy();
    WebIntegration._pageMod = undefined;
  }

  const user = User.getInstance();
  const escapedDomain = user.settings.getDomain().replace(/\W/g, "\\$&");
  const url = `^((?!${escapedDomain}).)*$`;

  WebIntegration._pageMod = new PageMod({
    name: 'WebIntegration',
    include: new RegExp(url),
    contentScriptWhen: 'ready',
    contentStyleFile: [],
    contentScriptFile: [
      'contentScripts/js/dist/browser-integration/vendors.js',
      'contentScripts/js/dist/browser-integration/browser-integration.js'
    ],
    attachTo: {existing: true, reload: false},
    onAttach: function(worker) {
      Worker.add('WebIntegration', worker);
      ConfigEvents.listen(worker);
      WebIntegrationEvents.listen(worker);
      OrganizationSettingsEvents.listen(worker);
      PortEvents.listen(worker);
    }
  });
};
export default WebIntegration;
