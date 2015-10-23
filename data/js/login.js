var passbolt = passbolt || {};
    passbolt.login = passbolt.login || {};

$(window).load(function() {

    /**
     * Update the login page with a server side rendered template
     * @param step
     */
    passbolt.login.render = function(step, callback) {
        console.log('render' + step);
        var context = $('.login.page .js_main-login-section');
        $.ajax({
            url: '/auth/partials/' + step,
            context: context
        }).done(function(data) {
            $( this ).html(data);
            callback();
        }).fail(function() {
            console.log('Server could not be reached...');
        });
    };

    /**
     * When the plugin configuration is missing
     */
    passbolt.login.onConfigurationMissing = function() {
        // Do not allow login, but explain you need to register
        // or contact the domain administrator based on server side config
        passbolt.login.render('noconfig');
        console.log('onConfigurationMissing');
    };

    /**
     * Starts with server key check
     */
    passbolt.login.onStep0Start = function() {
        // Display a informations about the state of login
        // e.g. that we're going to check for the server key first
        passbolt.login.render('stage0', passbolt.login.onStep0CheckServerKey);

    };
    passbolt.login.onStep0CheckServerKey = function () {
        console.log('onstep0 check server key');
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