/**
 * Passbolt backup key setup step.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

(function (passbolt) {

    var step = {
        'id': 'backup_key',
        'elts' : {
            downloadButton : '#js_backup_key_download'
        }
    };

    /* ==================================================================================
     *  Content code events
     * ================================================================================== */

    step.onClickDownload = function() {
        passbolt.request('passbolt.keyring.key.backup', passbolt.setup.data.key, 'passbolt_private.asc')
            .then(function () {
                // The key has been saved.
            });
    };

    /* ==================================================================================
     *  Core functions (Implements()).
     * ================================================================================== */

    step.init = function () {
        var def = $.Deferred();
        def.resolve();
        return def;
    };

    step.start = function () {
        step.elts.$downloadButton.on('click', function (ev) {
            step.onClickDownload();
        });
    };

    step.submit = function () {
        passbolt.setup.setActionState('submit', 'processing');

        var def = $.Deferred();
        def.resolve();
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
