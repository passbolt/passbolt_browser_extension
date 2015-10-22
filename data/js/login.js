var passbolt = passbolt || {};
    passbolt.login = passbolt.login || {};

$(window).load(function() {

    passbolt.login.onConfigurationMissing = function() {
        var context = $('.login.page .js_main-login-section');
        $.ajax({
            url: '/auth/partials/register',
            context: context
        }).done(function(data) {
            $( this ).html(data);
        }).fail(function() {
            console.log('Server could not be reached...');
        });
    };

    if (self.options.ready === true) {
        console.log('login possible!');
    } else {
        passbolt.login.onConfigurationMissing();
    }

});