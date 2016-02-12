/**
 * Passbolt key info setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'key_info',
        'label': '3. Review key info',
        'title': 'Let\'s make sure you imported the right key',
        'parents': ['import_key'],
        'next': 'security_token',
        'viewData': {},
        'keyinfo': {},
        'data' : {},
        'status': ''
    };

    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    /**
     * Implements init().
     * @returns {*}
     */
    step.init = function () {
        // Get private key from keyring.
        return passbolt.request('passbolt.keyring.private.get')
            .then(function(keyInfo) {
                // Pass the key info to the view.
                step.viewData.keyInfo = step.data.keyinfo = keyInfo;

                // Get user from setup data.
                passbolt.setup.get('user')
                    .then(function(user) {
                        step.data.user = user;

                        var status = 'success';

                        keyInfo = step._keyInfoFormat(keyInfo);

                        var fieldsDetails = step._initCheckKeyInfoStatus(keyInfo, user);
                        if (Object.keys(fieldsDetails).length) {
                            status = 'warning';
                        }

                        // Key expired.
                        // @todo key expired in key info page

                        // Pass the fields details to the view.
                        step.viewData.fieldsDetails = fieldsDetails;

                        // Pass the status to the view.
                        step.viewData.status = step.data.status = status;
                    })
                    .fail(function() {
                        passbolt.setup.fatalError('could not retrieve user');
                    });
            })
            .fail(function() {
                passbolt.setup.fatalError('could not retrieve private key');
            });
    };

    /**
     * Implements start().
     */
    step.start = function () {
        if (step.data.status == 'error') {
            passbolt.setup.setActionState('submit', 'disabled');
        }
    };

    /**
     * Implements submit().
     * @returns {*}
     */
    step.submit = function () {
        passbolt.setup.setActionState('submit', 'processing');
        var def = $.Deferred();
        def.resolve();
        return def;
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
     * Check whether the key contains similar information as user details.
     *
     * If not, build an array of differences and return it.
     * The aim is to display the differences on the page.
     *
     * @param keyInfo
     * @param user
     * @returns {{}}
     * @private
     */
    step._initCheckKeyInfoStatus = function(keyInfo, user) {
        var fieldsDetails = {};

        // Check if name is different from the one defined by the administrator.
        if (user.firstname + ' ' + user.lastname != keyInfo.userIds[0].name) {
            fieldsDetails['name'] = {
                status: 'warning',
                rule: 'match',
                original: user.firstname + ' ' + user.lastname
            };
        }

        // Check if email different from the one defined by the administrator.
        if (user.username != keyInfo.userIds[0].email) {
            fieldsDetails['email'] = {
                status: 'warning',
                rule: 'match',
                original: user.username
            };
        }

        return fieldsDetails;
    };

    /**
     * Format key info object to match our needs.
     *
     * Our needs are basically to remove the comment from the name, so we can compare it
     * with the user name.
     *
     * @param keyInfo
     * @returns {*}
     * @private
     */
    step._keyInfoFormat = function(keyInfo) {
        // Remove comment from owner name (by default key info returns name with key comment in bracket. we don't want it).
        var ownerName = keyInfo.userIds[0].name;
        ownerName = $.trim(ownerName.replace(/\(.+\)/, ''));
        keyInfo.userIds[0].name = ownerName;
        return keyInfo;
    };

    passbolt.setup.steps[step.id] = step;

})(passbolt);
