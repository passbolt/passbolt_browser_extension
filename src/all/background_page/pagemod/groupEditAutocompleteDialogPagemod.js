/**
 * Edit group autocomplete dialog pagemod.
 *
 * This pagemod drives the iframe used when the user adds users to a group
 * and he is looking for new users to add.
 *
 * This pagemod works jointly with the editGroup Pagemod.
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 *
 */
var app = require('../app');
const {PageMod} = require('../sdk/page-mod');
var Worker = require('../model/worker');

var GroupEditAutocompleteDialog = function () {};
GroupEditAutocompleteDialog._pageMod = undefined;

GroupEditAutocompleteDialog.init = function () {

    if (typeof GroupEditAutocompleteDialog._pageMod !== 'undefined') {
        GroupEditAutocompleteDialog._pageMod.destroy();
        GroupEditAutocompleteDialog._pageMod = undefined;
    }

    GroupEditAutocompleteDialog._pageMod = new PageMod({
        name: 'GroupEditAutocomplete',
        include: 'about:blank?passbolt=passbolt-iframe-group-edit-autocomplete',

        contentScriptFile: [
					// Warning: Iframe script and styles need to be modified in
					// chrome/data/passbolt-iframe-group-edit-autocomplete.html
        ],
        contentScriptWhen: 'ready',
        onAttach: function (worker) {
            Worker.add('GroupEditAutocomplete', worker);
            app.events.config.listen(worker);
            app.events.passboltPage.listen(worker);
            app.events.group.listen(worker);
            app.events.groupAutocomplete.listen(worker);
        }
    });
};
exports.GroupEditAutocompleteDialog = GroupEditAutocompleteDialog;
