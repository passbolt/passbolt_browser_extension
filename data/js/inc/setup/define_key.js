/**
 * Passbolt setup step.
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'define_key',
        'label': '2. Define your keys',
        'title': 'Create a new key or <a id="js_setup_goto_import_key" href="#" class="button primary">import</a> an existing one!',
        'parents': ['domain_check'],
        'next': 'secret',
        'favorite': true,
        'viewData': {}
    };

    /**
     * Set the user name in the plugin.
     *
     * @param firstName
     * @param lastName
     * @returns {*}
     */
    step.setName = function (firstName, lastName) {
        // TODO : validation
        return passbolt.request('passbolt.user.set.name', firstName, lastName)
            .then(function () {
                return {
                    first_name: firstName,
                    last_name: lastName
                };
            });
    };

    /**
     * Set the username in the plugin.
     *
     * @param username
     * @returns {*}
     */
    step.setUsername = function (username) {
        // TODO : validation
        return passbolt.request('passbolt.user.set.username', username)
            .then(function () {
                return username;
            });
    };


    step.init = function () {
        step.viewData.firstName = passbolt.setup.data.firstName || null;
        step.viewData.lastName = passbolt.setup.data.lastName || null;
        step.viewData.domain = passbolt.setup.data.domain || null;
        step.viewData.username = passbolt.setup.data.username || null;
    };

    step.start = function () {
        passbolt.setup.setActionState('submit', 'enabled');

        // Bind the go to import an existing key button.
        $('#js_setup_goto_import_key').click(function (ev) {
            ev.preventDefault();
            passbolt.setup.switchToStep('import_key');
        });
    };

    step.submit = function () {
        // Save value in data.
        // @todo validate data
        // @todo same new name / update on server

        var def = $.Deferred();

        // Process submit.
        passbolt.setup.setActionState('submit', 'processing');

        step.setName(passbolt.setup.data.firstName, passbolt.setup.data.lastName)
            .then(function () {
                step.setUsername(passbolt.setup.data.username).then(function() {
                    def.resolve();
                })
            });

        passbolt.setup.data.keyInfo = {};
        passbolt.setup.data.keyInfo.name = $("#OwnerName").val();
        passbolt.setup.data.keyInfo.email = passbolt.setup.data.username;
        passbolt.setup.data.keyInfo.comment = $("#KeyComment").val();
        passbolt.setup.data.keyInfo.lgth = $("#KeyLength").val();
        return def;
    };

    step.cancel = function () {
        passbolt.setup.setActionState('cancel', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
