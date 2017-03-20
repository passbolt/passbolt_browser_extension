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
var self = require('sdk/self');
var app = require('../app');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');

var GroupEditAutocompleteDialog = function () {};
GroupEditAutocompleteDialog._pageMod = undefined;

GroupEditAutocompleteDialog.init = function () {

    if (typeof GroupEditAutocompleteDialog._pageMod !== 'undefined') {
        GroupEditAutocompleteDialog._pageMod.destroy();
        GroupEditAutocompleteDialog._pageMod = undefined;
    }

    GroupEditAutocompleteDialog._pageMod = pageMod.PageMod({
        name: 'GroupEditAutocomplete',
        include: 'about:blank?passbolt=passbolt-iframe-group-edit-autocomplete',
        // Warning:
        // If you modify the following script and styles don't forget to also modify then in
        // chrome/data/passbolt-iframe-group-edit-autocomplete.html
        contentStyleFile: [
            self.data.url('css/main_ff.min.css')
        ],
        contentScriptFile: [
            self.data.url('vendors/jquery.min.js'),
            self.data.url('vendors/ejs_production.js'),
            self.data.url('js/lib/message.js'),
            self.data.url('js/lib/request.js'),
            self.data.url('js/lib/html.js'),
            self.data.url('js/group/editAutocomplete.js')
        ],
        contentScriptWhen: 'ready',
        onAttach: function (worker) {
            Worker.add('GroupEditAutocomplete', worker);
            app.events.config.listen(worker);
            app.events.passboltPage.listen(worker);
            app.events.group.listen(worker);
            app.events.groupAutocomplete.listen(worker);
            app.events.template.listen(worker);
        }
    });
}
exports.GroupEditAutocompleteDialog = GroupEditAutocompleteDialog;
