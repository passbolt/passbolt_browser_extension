/**
 * EditGroup dialog pagemod.
 *
 * This pagemod drives the iframe used when the user shares a password.
 * It is used when sharing a new password.
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var self = require('sdk/self');
var app = require('../app');
var pageMod = require('sdk/page-mod');
var Worker = require('../model/worker');
var TabStorage = require('../model/tabStorage').TabStorage;

var GroupEditDialog = function () {};
GroupEditDialog._pageMod = undefined;

GroupEditDialog.init = function () {

    if (typeof GroupEditDialog._pageMod !== 'undefined') {
        GroupEditDialog._pageMod.destroy();
        GroupEditDialog._pageMod = undefined;
    }

    GroupEditDialog._pageMod = pageMod.PageMod({
        name: 'GroupEdit',
        include: 'about:blank?passbolt=passbolt-iframe-group-edit',
        // Warning:
        // If you modify the following script and styles don't forget to also modify then in
        // chrome/data/passbolt-iframe-password-share.html
        contentStyleFile: [
            self.data.url('css/main_ff.min.css')
        ],
        contentScriptFile: [
            self.data.url('vendors/jquery.min.js'),
            self.data.url('vendors/ejs_production.js'),
            self.data.url('js/lib/message.js'),
            self.data.url('js/lib/request.js'),
            self.data.url('js/lib/html.js'),
            self.data.url('js/lib/securityToken.js'),
            self.data.url('js/group/edit.js')
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
            app.events.editPassword.listen(worker);
            app.events.passboltPage.listen(worker);
            app.events.secret.listen(worker);
            app.events.group.listen(worker);
            app.events.user.listen(worker);
            app.events.template.listen(worker);
        }
    });
}
exports.GroupEditDialog = GroupEditDialog;
