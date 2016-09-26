/**
 * Passbolt define key setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.workflow = passbolt.setup.workflow || {};

(function (passbolt) {

    passbolt.setup.workflow.recover = {
        'domain_check': {
            'label': '1. Security checks',
            'title': 'Account recovery: let\'s take 5 min to reconfigure your plugin!',
            'parents': null,
            'next': 'import_key',
            'viewData': {},
            'defaultActions': {
                'submit': 'disabled',
                'cancel': 'hidden'
            }
        },
        'import_key': {
            'label': '2. Import your key',
            'title': 'Import your existing key!',
            'parents': ['domain_check'],
            'next': 'security_token',
            'defaultActions': {
                'submit': 'disabled',
                'cancel': 'enabled'
            },
            'options': {
                'workflow': 'recover',
                'infoTemplate': 'elements/import_key_recover_info.ejs'
            },
            'viewData': {}
        },
        'security_token': {
            'label': '4. Set a new security token',
            'title': 'We need a visual cue to protect us from the bad guys..',
            'parents': ['import_key'],
            'next': 'login_redirection',
            'viewData': {},
            'options' : {
                txtpossible : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-',
                colorpossible : 'ABCDEF0123456789'
            }
        },
        'login_redirection': {
            'title': 'Alright sparky, it\'s time to log in!',
            'label': '5. Login !',
            'parents': ['security_token'],
            'defaultActions': {
                'submit': 'hidden',
                'cancel': 'hidden'
            },
            'options': {
                'workflow': 'recover'
            },
            'viewData': {}
        }
    };

})( passbolt );