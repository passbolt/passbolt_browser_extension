var passbolt = passbolt || {};
    passbolt.login = passbolt.login || {};

$(function() {

    /**
     * Update the login page with a server side rendered template
     * @param step
     */
    passbolt.login.render = function(step, callback) {
        var self = this;
            self.callback = callback;
        var $renderSpace = $('.login.page .js_main-login-section');

        url = '/auth/partials/' + step;
        $.ajax({
            url: url,
            context: $renderSpace
        }).done(function(data) {
            $( this ).html(data);
            if(typeof self.callback !== 'undefined') {
                self.callback();
            }
        }).fail(function() {
            console.log(self.id + ' Server could not be reached at: ' + url );
        });
    };

    /**
     * When the plugin configuration is missing
     */
    passbolt.login.onConfigurationMissing = function() {
        // Do not allow login, but explain you need to register
        // or contact the domain administrator based on server side config
        passbolt.login.render('noconfig');
    };

    /**
     * Starts with server key check
     */
    passbolt.login.onStep0Start = function() {
        // Display a informations about the state of login
        // e.g. that we're going to check for the server key first
        passbolt.login.render('stage0', passbolt.login.onStep0CheckServerKey);
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

                passbolt.login.onStep1MasterKey();
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

    passbolt.login.onStep1MasterKey = function () {

        // Inject the master password dialog iframe into the web page DOM.
        var $iframe = $('<iframe/>', {
            id: 'passbolt-iframe-login-form',
            src: 'about:blank?passbolt=passbolt-iframe-login-form',
            frameBorder: 0
        });
        $('.login.form').empty().append($iframe);

        // See passboltAuthPagemod and login-form for the logic
        // inside the iframe
    };

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
