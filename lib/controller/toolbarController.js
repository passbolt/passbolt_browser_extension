/**
 * Toolbar controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var self = require('sdk/self');
var tabs = require('sdk/tabs');
var buttons = require('sdk/ui/button/action');
var Config = require("../model/config");
var Setup = new (require("../model/setup").Setup)();
var user = new (require('../model/user').User)();

// Add a passbolt button on browser toolbar
var button = buttons.ActionButton({
    id: 'passbolt-link',
    label: 'Passbolt',
    icon: {
        '16': './img/logo/icon-16.png',
        '32': './img/logo/icon-32.png',
        '64': './img/logo/icon-64.png'
    },
    onClick: function (state) {
        var url = '';

        // CASE The plugin is installed and configured
        if (user.isValid()) {
            url = user.settings.getDomain();
        }
        // CASE The plugin is installed but the configuration is incomplete
        else if (Setup.get('stepId') != '') {
            url = Config.read('extensionBasePath') + '/data/setup.html';
        }
        // CASE The plugin is installed but not configured
        else {
            url = 'http://www.passbolt.com/no-config';
        }

        // Open a new tab
        try {
            tabs.open(url);
        } catch (e) {
            // If something wrong happens, redirect the user to the passbolt home page
            console.log(e.message);
            tabs.open('http://www.passbolt.com');
        }
    }
});