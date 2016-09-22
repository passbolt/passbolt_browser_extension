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

    passbolt.setup.workflow.install = {
        'domain_check': {
            'label': '1. Get the plugin',
            'title': 'Welcome to passbolt! Let\'s take 5 min to setup your system.',
            'parents': null,
            'next': 'define_key',
            'viewData': {},
            'defaultActions': {
                'submit': 'disabled',
                'cancel': 'hidden'
            }
        },
        'define_key': {
            'label': '2. Define your keys',
            'title': 'Create a new key or <a id="js_setup_goto_import_key" href="#" class="button primary">import</a> an existing one!',
            'parents': ['domain_check'],
            'next': 'secret',
            'favorite': true,
            'viewData': {},
            'options': {
                defaultKeyLength : 2048,
                defaultKeyType : 'RSA-DSA'
            }
        },
        'generate_key': {
            'title': 'Give us a second while we crunch them numbers!',
            'label': '',
            'parents': ['secret'],
            'next': 'backup_key',
            'defaultActions': {
                'submit': 'hidden',
                'cancel': 'hidden'
            },
            // We do not save this step in history. It should be impossible to come back to this step
            // without executing the step before first.
            'saveInHistory': true,
            'subStep': true,
            'viewData': {}
        },
        'import_key': {
            'label': '2. Import your key',
            'title': 'Import an existing key or <a id="js_setup_goto_define_key" href="#" class="button primary">create</a> a new one!',
            'parents': ['domain_check'],
            'next': 'key_info',
            'defaultActions': {
                'submit': 'disabled',
                'cancel': 'enabled'
            },
            'viewData': {}
        },
        'backup_key': {
            'title': 'Success! Your secret key is ready.',
            'label': '',
            'parents': ['secret'],
            'next': 'security_token',
            'subStep': true,
            'viewData': {}
        },
        'key_info': {
            'label': '3. Review key info',
            'title': 'Let\'s make sure you imported the right key',
            'parents': ['import_key'],
            'next': 'security_token',
            'viewData': {}
        },
        'secret': {
            'title': 'Now let\'s setup your passphrase!',
            'label': '3. Set a passphrase',
            'parents': ['define_key'],
            'next': 'generate_key',
            'viewData': {},
            'defaultActions': {
                'submit': 'disabled',
                'cancel': 'enabled'
            }
        },
        'security_token': {
            'label': '4. Set a security token',
            'title': 'We need a visual cue to protect us from the bad guys..',
            'parents': ['key_info', 'backup_key'],
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
            'viewData': {}
        }
    };

})( passbolt );