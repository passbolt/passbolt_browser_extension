// When the page has been initialized.
$(document).bind('template-ready', function() {

    var $securityToken = $('.security-token'),
        $masterPassword = $('#js_master_password'),
        $masterPasswordSubmit = $('#master-password-submit');

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

    // The user clicks on enter.
    $masterPassword.keypress(function(e) {
        if(e.which == 13) {
            self.port.emit("passbolt.keyring.master.request.submit", passbolt.context.token, $masterPassword.val());
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
