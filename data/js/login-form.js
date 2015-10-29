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
        $loginMessage.removeClass('error').text('Please wait...');
        passbolt.request('passbolt.auth.login', $masterPassword.val()).then(
            function success(msg) {
                console.log(msg);
                // @TODO trigger redirect
            },
            function fail(msg) {
                onLoginError(msg);
            }
        );
    };

    // The user clicks on OK.
    $loginSubmit.on('click', function() {
        $loginSubmit.addClass('disabled').addClass('processing');

        passbolt.request('passbolt.keyring.private.checkpassphrase', $masterPassword.val()).then(
            function success() {
                onValidPassphrase();
            },
            function fail(msg) {
                onInvalidPassphrase(msg);
            }
        );
        return false;
    });

});

// Init the page with a template.
initPageTpl();
