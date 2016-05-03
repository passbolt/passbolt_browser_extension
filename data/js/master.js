/**
 * Master password field.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

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
                },
                function fail() {
                    throw 'No security token set';
                }
            );

        // Remove all focuses from the client app.
        passbolt.messageOn('App', 'passbolt.event.trigger_to_page', 'remove_all_focuses');

        // We set the focus on the first focus field and wait for events.
        // TODO improvement : client js should send remove_all_focuses_done, instead of a timeout.
        setTimeout(function() {
            // Set focus on the temporary first focus field.
            $focusFirst.focus();

            // First focus field listen to keypress events.
            $focusFirst.keypress(function(e) {
                // Prevent default.
                e.preventDefault();

                // Get keycode.
                var keycode = e.keyCode || e.which;

                // Characters accepted. Should be printable, no control.
                var char = String.fromCharCode(keycode);
                var regex = /^[\u0020-\u007e\u00a0-\u00ff]*$/;
                var valid = regex.test(char);

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
                    $masterPassword.val(char);
                }

                return false;
            });
        }, 200);
    };

    init();


   /* ==================================================================================
    *  Add-on Code Events Listeners
    * ================================================================================== */

    /**
     * Handles wrong master password scenario.
     */
    passbolt.message('passbolt.keyring.master.request.complete')
        .subscribe(function(token, status, attempts) {
            if (status == 'ERROR') {
                $masterPasswordSubmit.removeClass('processing');
                $masterPassword.focus();
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

    /**
     * Submit handler.
     */
    var onSubmit = function() {
        $masterPasswordSubmit.addClass('processing');
        var masterPassword = $masterPassword.val();
        if ($('#js_remember_master_password').is(':checked')) {
            passbolt.request('passbolt.user.rememberMasterPassword', masterPassword, 1000);
        }
        self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, masterPassword);
    };

    /**
     * Event when the user clicks on ok.
     */
    $masterPasswordSubmit.on('click', function() {
        onSubmit();
    });

    /**
     * Event when the user presses a key.
     */
    $masterPassword.keypress(function(e) {
        // Get keycode.
        var keycode = e.keyCode || e.which;

        // The user presses enter.
        if(keycode == 13) {
            onSubmit();
        }
        // The user presses escape.
        else if(keycode == 27) {
            passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
        }
    });

    /**
     * Event when the user clicks on close button.
     */
    $('body').on('click', '.js-dialog-close', function(ev) {
        ev.preventDefault();
        passbolt.messageOn('App', 'passbolt.keyring.master.request.close');
    });
});

// Init the page with a template.
initPageTpl();
