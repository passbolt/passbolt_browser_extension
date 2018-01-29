/**
 * Import controller.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var Worker = require('../model/worker');
var FileHelper = require('../helper/fileHelper').FileHelper;
var KeepassDb = require('../model/keepassDb').KeepassDb;
var Keyring = require('../model/keyring').Keyring;
var Resource = require('../model/resource').Resource;
var Crypto = require('../model/crypto').Crypto;
var progressDialogController = require('../controller/progressDialogController');
var User = require('../model/user').User;

var ImportController = function(tabid) {
  this.tabid = tabid;
  this.progressObjective = 0;
  this.progressStatus = 0;
  this.resources = [];
};

ImportController.prototype.initFromKdbx = function(b64FileContent, credentials) {
  var kdbxFile = FileHelper.b64toBlob(b64FileContent);
  var keyFile = null;
  if (credentials.keyFile != null) {
    keyFile = FileHelper.b64toBlob(credentials.keyFile);
  }

  let keepassDb = new KeepassDb();
  return keepassDb.loadDb(kdbxFile, credentials.password, keyFile)
  .then(function(db) {
    return keepassDb.toResources(db);
  });
};


ImportController.prototype.encryptSecrets = function(resources) {
  var keyring = new Keyring(),
    appWorker = Worker.get('App', this.tabid),
    user = new User(),
    self=this;

  this.resources = resources;
  this.progressObjective = this.resources.length * 2;

  progressDialogController.open(appWorker, 'Encrypting ...', this.progressObjective);

  var currentUser = user.get();
  var userId = currentUser.id;

  // Sync the keyring with the server.
  return keyring.sync()
  // Once the keyring is synced, encrypt the secret for each resource
  .then(function () {
    return self._encryptSecrets(userId);
  })
  .then(function(armoredSecrets) {
    return self._addArmoredSecretsToResources(armoredSecrets);
  });
};

ImportController.prototype.saveResources = function(resources) {
  var appWorker = Worker.get('App', this.tabid);
  var savePromises = [];
  var self = this;

  for (var i in resources) {
    var p = Resource.save(resources[i]);
    savePromises.push(p);
    p.then(function() {
      progressDialogController.update(appWorker, self.progressStatus++, 'Imported ' + i + '/' + self.resources.length);
    });
  }

  return new Promise(function(resolve, reject) {
    Promise.all(savePromises)
    .then(function(values) {
      progressDialogController.close(appWorker);
      resolve(values);
    })
    .catch(function(e) {
      reject(e);
    });
  });
};

ImportController.prototype._encryptSecrets = function(userId) {
  var self = this,
    crypto = new Crypto(),
    appWorker = Worker.get('App', this.tabid);
  self.resources = ImportController._prepareResources(this.resources, userId);
  console.log('prepares resources', this.resources);

  // Encrypt all the messages.
  return crypto.encryptAll(this.resources, function () {
    progressDialogController.update(appWorker, self.progressStatus++);
    console.log('complete encryption - progress', self.progressStatus);
  }, function (position) {
    console.log('start encryption - progress', self.progressStatus);
    progressDialogController.update(appWorker, self.progressStatus, 'Encrypting ' + position + '/' + self.resources.length);
  });
};

ImportController.prototype._addArmoredSecretsToResources = function(armoredSecrets) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (armoredSecrets.length != self.resources.length) {
      reject('There was a problem while encrypting the secrets');
    }
    for (var i in armoredSecrets) {
      self.resources[i].secrets = [
        {
          data : armoredSecrets[i],
        }
      ];
      // Remove clear password from resource.
      self.resources[i].message = null;
    }
    console.log("encrypted resources", self.resources);
    resolve(self.resources);
  });
};

ImportController._prepareResources = function(resources, userId) {
  var resourcesToEncrypt = resources.map(function(resource) {
    resource.userId = userId;
    resource.message = resource.secretClear;
    resource.secretClear = null;
    return resource;
  });
  return resourcesToEncrypt;
};



exports.ImportController = ImportController;