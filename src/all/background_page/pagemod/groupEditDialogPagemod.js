/**
 * EditGroup dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password.
 * It is used when sharing a new password.
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
const {PageMod} = require('../sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var GroupEditDialog = function () {};
GroupEditDialog._pageMod = undefined;

GroupEditDialog.init = function () {

    if (typeof GroupEditDialog._pageMod !== 'undefined') {
        GroupEditDialog._pageMod.destroy();
        GroupEditDialog._pageMod = undefined;
    }

    GroupEditDialog._pageMod = new PageMod({
        name: 'GroupEdit',
        include: 'about:blank?passbolt=passbolt-iframe-group-edit',
        contentScriptFile: [
					// Warning: script and styles need to be modified in
					// chrome/data/passbolt-iframe-group-edit.html
        ],
        contentScriptWhen: 'ready',
        onAttach: function (worker) {
            Worker.add('GroupEdit', worker, {
                onDestroy: function () {
                    TabStorage.remove(worker.tab.id, 'groupId');
                    TabStorage.remove(worker.tab.id, 'groupUsers');
                }
            });

            app.events.config.listen(worker);
            app.events.passboltPage.listen(worker);
            app.events.group.listen(worker);
            app.events.user.listen(worker);
        }
    });
};
exports.GroupEditDialog = GroupEditDialog;
