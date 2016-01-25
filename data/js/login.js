var passbolt = passbolt || {};
    passbolt.login = passbolt.login || {};

$(function() {

    var passphraseIframeId = 'passbolt-iframe-login-form';

    /* ==================================================================================
     *  View Events Listeners
     * ================================================================================== */

    /**
     * When the plugin configuration is missing
     */
    passbolt.login.onConfigurationMissing = function() {
        var $renderSpace = $('.login.page .js_main-login-section'),
          publicRegistration = $('.login.page.public-registration').length > 0 ? true : false;

          getTpl('./tpl/login/noconfig.ejs', function (tpl) {
              var html = new EJS({text: tpl}).render({publicRegistration: publicRegistration});
              $renderSpace.html(html);
          });
    };

    /**
     * Starts with server key check
     */
    passbolt.login.onStep0Start = function() {
        var $renderSpace = $('.login.page .js_main-login-section');

        // Display information about the state of login
        // e.g. that we're going to check for the server key first
        passbolt.request('passbolt.keyring.server.get')
            .then(function(serverKeyInfo) {
                getTpl('./tpl/login/stage0.ejs', function (tpl) {
                    var html = new EJS({text: tpl}).render({serverKeyId: serverKeyInfo.keyId.toUpperCase()});
                    $renderSpace.html(html);
                    passbolt.login.onStep0CheckServerKey();
                });
            })
            .fail(function(){
                console.log('passbolt.keyring.server.get fail: no server key set');
            });
    };

    /**
     * Server key check
     */
    passbolt.login.onStep0CheckServerKey = function () {

        passbolt.request('passbolt.auth.verify').then(
            function success(msg) {
                $('.plugin-check.gpg')
                    .removeClass('notice')
                    .addClass('success')
                    .html('<p class="message">' + msg + '<p>');

                passbolt.login.onStep1RequestPassphrase();
            },
            function error(msg) {
                $('.plugin-check.gpg')
                    .removeClass('notice')
                    .addClass('error')
                    .html('<p class="message">' + msg + '<p>');

                // @TODO stop spining
            }
        );

        $('html').addClass('server-verified');
    };

    /**
     * Insert the passphrase dialog
     */
    passbolt.login.onStep1RequestPassphrase = function () {

        // Inject the master password dialog iframe into the web page DOM.
        var $iframe = $('<iframe/>', {
            id: passphraseIframeId,
            src: 'about:blank?passbolt=' + passphraseIframeId,
            frameBorder: 0
        });
        $('.login.form').empty().append($iframe);

        // See passboltAuthPagemod and login-form for the logic
        // inside the iframe
    };

    /* ==================================================================================
     *  Add-on Code Events Listeners
     * ================================================================================== */

    // GPGAuth is complete
    passbolt.message('passbolt.auth.login.complete')
        .subscribe(function(token, status, message, referrer) {
            if(status === 'SUCCESS') {
                $('html').addClass('loaded').removeClass('loading');
                window.top.location.href = referrer;
            } else if(status === 'ERROR') {
                getTpl('./tpl/login/feedback-login-error.ejs', function (tpl) {
                    var html = new EJS({text: tpl}).render({'message':message});
                    $('.login.form').empty().append(html);
                });
            }
        });

    // Passphrase have been captured and verified
    passbolt.message('passbolt.auth.login.start')
        .subscribe(function(token, status, message) {
            $('html').addClass('loading').removeClass('loaded');
            // remove the iframe and tell the user we're logging in
            getTpl('./tpl/login/feedback-passphrase-ok.ejs', function (tpl) {
                var html = new EJS({text: tpl}).render({'message':message});
                $('.login.form').empty().append(html);
            });
        });

    /* ==================================================================================
     *  Content script init
     * ================================================================================== */

    /**
     * Check if the addon says we are ready for login
     */
    passbolt.login.init = function() {

        if (self.options.ready === true) {
            passbolt.login.onStep0Start();
        } else {
            passbolt.login.onConfigurationMissing();
        }
    };
    passbolt.login.init();

});
