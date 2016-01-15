// When the page has been initialized.
$(document).bind('template-ready', function() {

    var $securityToken = $('.security-token'),
        $masterPassword = $('#js_master_password'),
        $masterPasswordSubmit = $('#master-password-submit'),
        $focusFirst = $('#js_master_password_focus_first');

    /* ==================================================================================
     *  Dialog init
     * ================================================================================== */

    var init = function() {

        passbolt.message('passbolt.secret_inactive.key_pressed')
            .subscribe(function(token) {
                $('#js_master_password').click();
                $('#js_master_password').focus();
            });

        // Get config regarding security token, and display it.
        passbolt.request('passbolt.user.settings.get.securityToken')
            .then(
                function success(securityToken) {
                    $securityToken.text(securityToken.code);
                    securityToken.id = '#js_master_password';
                    getTpl('./tpl/secret/securitytoken-style.ejs', function (tpl) {
                        var html = new EJS({text: tpl}).render(securityToken);
                        $('head').append(html);
                    });

                    $focusFirst.focus();
                    $focusFirst.keypress(function(e) {
                        // Prevent default.
                        e.preventDefault();

                        // Get keycode.
                        var keycode = e.keyCode || e.which;

                        // Characters accepted. Should be printable, no control.
                        var valid =
                            (keycode > 47 && keycode < 58)   || // number keys
                            keycode == 32                    || // spacebar
                            (keycode > 64 && keycode < 91)   || // letter keys
                            (keycode > 95 && keycode < 112)  || // numpad keys
                            (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
                            (keycode > 218 && keycode < 223);   // [\]' (in order)


                        // Escape
                        if (keycode == 27) {
                            passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
                        }

                        // If key pressed is not a control, or if tab.
                        if (valid || keycode == 9) {
                            // Give focus to field master password.
                            $masterPassword.focus();
                        }

                        // If key pressed is not a control.
                        // We enter the same value in the box.
                        if (valid) {
                            $masterPassword.val(String.fromCharCode(keycode));
                        }

                        return false;
                    });
                },
                function fail() {
                    throw 'No security token set';
                }
            );
    };

    init();


   /* ==================================================================================
    *  Add-on Code Events Listeners
    * ================================================================================== */

    // Wrong master password.
    passbolt.message('passbolt.keyring.master.request.complete')
        .subscribe(function(token, status, attempts) {
            if (status == 'ERROR') {
                if (attempts < 3) {
                    $('label[for="js_master_password"]').html('Please enter a valid master password.')
                            .addClass('error');
                } else {
                    getTpl('./tpl/master/master-password-failure.ejs', function(tpl) {
                        // Render the page template.
                        var html = new EJS({text: tpl}).render();
                        $('.js_dialog_content').html(html);
                    });
                }
            }
        });


   /* ==================================================================================
    *  View Events Listeners
    * ================================================================================== */

    // The user clicks on OK.
    $masterPasswordSubmit.on('click', function() {;
        self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, $masterPassword.val());
    });

    // The user presses a key.
    $masterPassword.keypress(function(e) {
        // Get keycode.
        var keycode = e.keyCode || e.which;

        // The user presses enter.
        if(keycode == 13) {
            self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, $masterPassword.val());
        }
        // The user presses escape.
        else if(keycode == 27) {
            passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
        }
    });

    // The user wants to close the dialog.
    $('body').on('click', '.js-dialog-close', function(ev) {
        ev.preventDefault();
        passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
    });
});

// Init the page with a template.
initPageTpl();
