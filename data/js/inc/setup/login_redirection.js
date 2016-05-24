/**
 * Passbolt login redirection setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'login_redirection',
        'title': 'Alright sparky, it\'s time to log in!',
        'label': '5. Login !',
        'parents': ['security_token'],
        'defaultActions': {
            'submit': 'hidden',
            'cancel': 'hidden'
        },
        'viewData': {}
    };


    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
     */
    step.init = function () {
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    /**
     * Implements start().
     */
    step.start = function () {
        step.submit();
    };


    /**
     * Implements submit().
     * @returns {*}
     */
    step.submit = function () {
        return passbolt.setup.get()
            .then(step._validateAccount)
            .then(step._flushSetup)
            .then(function () {
                // Autologin.
                step._goToLogin();
            });
    };

    /**
     * Implements cancel().
     * @returns {*}
     */
    step.cancel = function () {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    /* ==================================================================================
     *  Business functions
     * ================================================================================== */

    /**
     * Flush setup.
     *
     * If setup went fine, we don't need to keep the data as they are already stored
     * in user object.
     *
     * @private
     */
    step._flushSetup = function() {
        return passbolt.request('passbolt.setup.flush')
            .fail(function (error) {
                //@todo PASSBOLT-1471
                //console.log('error while flushing setup', error);
            });
    };

    /**
     * Go to login at the end of the setup.
     * @private
     */
    step._goToLogin = function () {
        // Get domain from settings.
        return passbolt.request('passbolt.user.settings.get.domain')
            .then(function(domain) {
                var loginUrl = domain + "/auth/login";
                // Set timeout so the user has time to read the redirection message before actually being redirected.
                setTimeout(
                    function () {
                        window.location.href = loginUrl;
                    },
                    2000);
            });
    };

    /**
     * Validate account of the user on the server with data collected during the setup.
     *
     * @param setupData
     * @private
     */
    step._validateAccount = function(setupData) {
        return passbolt.request('passbolt.setup.save', setupData)
            .fail(function (error) {
                // Throw fatal error.
                passbolt.setup.fatalError(error.message, error.data);
            });
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
