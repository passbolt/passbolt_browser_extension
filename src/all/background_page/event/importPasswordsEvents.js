/**
 * Import passwords Listeners
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');
var KeepassDb = require('../model/keepassDb').KeepassDb;
var Keyring = require('../model/keyring').Keyring;
var User = require('../model/user').User;
var Crypto = require('../model/crypto').Crypto;
var FileHelper = require('../helper/fileHelper').FileHelper;
var TabStorage = require('../model/tabStorage').TabStorage;
var progressDialogController = require('../controller/progressDialogController');

var listen = function (worker) {
  worker.port.on('passbolt.import-passwords.import-kdbx', function (requestId, b64FileContent, credentials) {
      var keyring = new Keyring(),
        crypto = new Crypto(),
        user = new User(),
        progress = 0,
        objective = 0;

      var kdbxFile = FileHelper.b64toBlob(b64FileContent);
      var keyFile = null;
      if (credentials.keyFile != null) {
        keyFile = FileHelper.b64toBlob(credentials.keyFile);
      }
      var appWorker = Worker.get('App', worker.tab.id);

      let keepassDb = new KeepassDb();
      keepassDb.loadDb(kdbxFile, credentials.password, keyFile)
      .then(function(db) {
        return keepassDb.toResources(db);
      })
      .then(function(resources) {
        objective = resources.length * 2;
        progressDialogController.open(worker, 'Encrypting ...', objective);

        var currentUser = user.get();
        var userId = currentUser.id;

        // 1) Encrypt secret for each resource.
        // Sync the keyring with the server.
        keyring.sync()

        // Once the keyring is synced, encrypt the secret for each user.
        .then(function () {
          // Prepare the data for encryption.
          var encryptAllData = resources.map(function(resource) {
            resource.userId = userId;
            resource.message = resource.secretClear;
            return resource;
          });
          console.log(encryptAllData);

          // Encrypt all the messages.
          return crypto.encryptAll(encryptAllData, function () {
            progressDialogController.update(appWorker, progress++);
            console.log('complete encryption - progress', progress);
          }, function (position) {
            console.log('start encryption - progress', progress);
            progressDialogController.update(appWorker, progress, 'Encrypting ' + position + '/' + objective);
          });
        })
        // Once the secret is encrypted for all users notify the application and
        // close the progress dialog.
        .then(function (data) {
          console.log('encrypted', data);
          for (var i in data) {
            resources[i].secretArmored = data[i];
            // Remove clear password from resource.
            resources[i].secretClear = null;
            resources[i].message = null;
          }
          console.log('resourcesEncrypted', resources);
          // worker.port.emit(requestId, 'SUCCESS', armoreds);
          progressDialogController.update(appWorker, 2, 'Importing ' + 1 + '/' + objective);
          progressDialogController.close(appWorker);
          worker.port.emit(requestId, 'SUCCESS');
        });

        // 2) send to server and save.
        // 3) inform content code about result.



      })
      .catch(function(e) {
        console.log('error', e);
        worker.port.emit(requestId, 'ERROR', e);
      });
  });
}

exports.listen = listen;