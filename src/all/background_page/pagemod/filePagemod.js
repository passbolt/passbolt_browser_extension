/**
 * File iframe pagemod.
 * This pagemod drives the iframe used when the user want to handle files
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var app = require('../app');
const {PageMod} = require('../sdk/page-mod');
var Worker = require('../model/worker');

var File = function () {};
File._pageMod = undefined;

File.init = function () {

    if (typeof File._pageMod !== 'undefined') {
      File._pageMod.destroy();
      File._pageMod = undefined;
    }

    File._pageMod = new PageMod({
        name: 'File',
        include: 'about:blank?passbolt=passbolt-iframe-file',

        contentScriptFile: [
          // Warning: Iframe script and styles need to be modified in
          // chrome/data/passbolt-iframe-file.html
        ],
        contentScriptWhen: 'ready',
        onAttach: function (worker) {
          Worker.add('FileIframe', worker);
        }
    });
};
exports.File = File;
