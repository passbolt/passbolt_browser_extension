/**
 * Background script
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

window.storage = require('./sdk/storage').storage;
var storage = window.storage;

var main = function() {

  // Config and user models
  var Config = require('./model/config');
  var User = require('./model/user').User;

  /* ==================================================================================
   *  Openpgp init
   *  Init web worker
   * ==================================================================================
   */
  openpgp.initWorker({
    worker: new Worker(chrome.runtime.getURL('/vendors/openpgp.worker.js'))
  });

  /* ==================================================================================
   *  Interface changes
   *  Where we affect the look and feel of the firefox instance
   * ==================================================================================
   */
  var ToolbarController = require('./controller/toolbarController').ToolbarController;
  new ToolbarController();

  /* ==================================================================================
   *  Page mods init
   *  Run scripts in the context of web pages whose URL matches a given pattern.
   *  see. https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/page-mod
   * ==================================================================================
   */
  var pageMods = require('./app').pageMods;

  pageMods.Bootstrap.init();

  // // If the user is valid we enable the login pagemod
  var user = new User();
  if (user.isValid()) {
    // Auth pagemod init can also be triggered
    // by debug, setup and user events (e.g. when config change)
    pageMods.PassboltAuth.init();

    // App pagemod init is generally triggered after a successful login
    // We only initialize it here for the cases where the user is already logged in
    user.isLoggedIn()
      .then(function() {
        pageMods.PassboltApp.init();
      }, function() {
        // The user is not logged-in, do nothing.
      });
  }

  // Setup pagemods
  pageMods.SetupBootstrap.init();
  pageMods.Setup.init();

  // Other pagemods active all the time
  // but triggered by App or Auth
  pageMods.File.init();
  pageMods.Clipboard.init();
  pageMods.PassboltAuthForm.init();
  pageMods.MasterPasswordDialog.init();
  pageMods.ProgressDialog.init();
  pageMods.SecretEditDialog.init();
  pageMods.ShareDialog.init();
  pageMods.ShareAutocompleteDialog.init();
  pageMods.GroupEditDialog.init();
  pageMods.GroupEditAutocompleteDialog.init();

  // Debug pagemod
  if (Config.isDebug()) {
    pageMods.Debug.init();
  }
};

/* ==================================================================================
 *  Data migration
 * ==================================================================================
 */
var migration = new Promise(function (resolve, reject) {
  // Browser is a firefox only variable
  if (typeof browser !== 'undefined') {
    // Firefox simpleStorage migration
    // get data from legacy addon
    var port = browser.runtime.connect({name: "passbolt-legacy-port"});
    port.onMessage.addListener(function(data) {
      if (typeof data !== undefined) {
        console.log('Migrating firefox simpleStorage.');
        storage.migrate(data);
      } else {
        console.log('No migration needed (firefox).');
      }
      resolve();
    });
  } else {
    // Chrome localStage migration
    if (storage.migrationNeeded()) {
      console.log('Migrating chrome localStorage.');
      storage.migrate();
    } else {
      console.log('No migration needed (chrome).');
    }
    resolve();
  }
});

// Init storage and get going
migration
  .then(storage.init())
  .then(main)
  .catch(function(error) {
    console.error(error.message);
  });
