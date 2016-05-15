/**
 * Login form.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

// When the page has been initialized.
$(document).bind('template-ready', function() {

    var $securityToken = $('.security-token'),
        $loginSubmit = $('#loginSubmit'),
        $username = $('#UserUsername'),
        $masterPassword = $('#js_master_password'),
        $loginMessage = $('#loginMessage');


    /* ==================================================================================
     *  Iframe init
     * ================================================================================== */

    var init = function() {

        // Get config regarding security token, and display it.
        passbolt.request('passbolt.user.settings.get.securityToken').then(
            function success(securityToken) {
                // the token should always exist at this point
                $securityToken.text(securityToken.code);
                securityToken.id = '#js_master_password';
                getTpl('./tpl/secret/securitytoken-style.ejs', function (tpl) {
                    var html = new EJS({text: tpl}).render(securityToken);
                    $('head').append(html);
                });
            }
        );

        passbolt.request('passbolt.user.get').then(
            function success(user) {
                // the user should always exist at this point
                $username.val(user.username);
            }
        );

    };
    init();


    /* ==================================================================================
     *  View Events Listeners
     * ================================================================================== */

    var onInvalidPassphrase = function(msg) {
        $loginSubmit.removeClass('disabled').removeClass('processing');
        $loginMessage.addClass('error').text(msg);
    };

    var onLoginError = function(msg) {
        $loginSubmit.addClass('disabled').removeClass('processing');
        $loginMessage.addClass('error').text(msg);
    };

    var onValidPassphrase = function () {
        $loginMessage.removeClass('error');
        passbolt.request('passbolt.auth.login', $masterPassword.val());
            /**
            .then(
            function success(msg, referrer) {
                $loginMessage.text(msg);
                $('html').addClass('loaded');
                window.top.location.href = referrer;
            },
            function fail(msg) {
                $('html').addClass('loaded').removeClass('loading');
                onLoginError(msg);
            }
        );*/
    };

    var onSubmit = function() {
        if ($loginSubmit.addClass('disabled').hasClass('processing')) {
            return;
        }

        $('html').addClass('loading').removeClass('loaded');
        $loginMessage.text('Please wait...'); // @TODO l18n
        $loginSubmit.addClass('disabled').addClass('processing');

        passbolt.request('passbolt.keyring.private.checkpassphrase', $masterPassword.val()).then(
            function success() {
                onValidPassphrase();
            },
            function fail(msg) {
                onInvalidPassphrase(msg);
            }
        );
    };

    // The user clicks on OK.
    $loginSubmit.on('click', function() {
        onSubmit();
        return false;
    });

    // On keypress inside the passphrase field.
    $masterPassword.keypress(function(e) {
        // Get keycode.
        var keycode = e.keyCode || e.which;

        // The user presses enter.
        if (keycode == 13) {
            onSubmit();
        }
    });


});

// Init the page with a template.
initPageTpl();
