/**
 * KeepassDb model
 * Provides high level tools to work with a kdbx file and object.
 */
var Resource = require('./resource').Resource;
var fileController = require('../controller/fileController');

/**
 * Constructor.
 * @constructor
 */
var KeepassDb = function() {
  this.db = null;
};

/**
 * Create a Kdbx database.
 * @param string password
 * @param Blob keyFile
 * @returns {Promise} promise with newly created db
 */
KeepassDb.prototype.createDb = function(password, keyFile) {
  var self = this;
  return this._prepareKeyFile(keyFile)
  .then(function(keyFile) {
    return new Promise(function(resolve, reject) {
      // If password is empty, we consider that there is no password.
      // We don't handle the case where there is a password and it is an empty string. Why? It makes no sense.
      let protectedPassword = password === '' ? null : kdbxweb.ProtectedValue.fromString(password);
      let credentials = new kdbxweb.Credentials(protectedPassword, keyFile);
      let newDb = kdbxweb.Kdbx.create(credentials, 'passbolt export');
      self.db = newDb;
      resolve(this.db);
    });
  })
};

/**
 * load a db from file.
 * @param Blob kdbxFile file object as returned by the file field.
 * @param string pass the password of the db
 * @param Blob keyFile (optional) the keyFile if there is one. null otherwise.
 * @returns {Promise}
 */
KeepassDb.prototype.loadDb = function(kdbxFile, pass, keyFile) {
  var self = this;

  return this._prepareKeyFile(keyFile)
  .then(function(keyFile) {
    return new Promise(function(resolve, reject) {
      var reader;
      reader = new FileReader();
      reader.onload = function(e) {
        try {
          // protectedPass remains null if there is no password.
          var protectedPass = null;
          if (pass != null) {
            protectedPass = kdbxweb.ProtectedValue.fromString(pass);
          }
          var credentials = new kdbxweb.Credentials(protectedPass, keyFile);
          kdbxweb.Kdbx.load(e.target.result, credentials)
          .then(function(db) {
            self.db = db;
            resolve(db);
          })
          .catch(function(err) {
            reject(err);
          });
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsArrayBuffer(kdbxFile);
    });
  });
};

/**
 * Prepare a keyFile in order to be used by loadDb.
 * If keyFile is not null, transform it into an arrayBuffer.
 * @param keyFile
 * @private
 */
KeepassDb.prototype._prepareKeyFile = function(keyFile) {
  return new Promise(function(resolve, reject) {
    if (keyFile !== null && keyFile !== undefined) {
      fileController.blobToArrayBuffer(keyFile)
      .then(function(arrayBuffer) {
        resolve(arrayBuffer);
      })
      .catch(function(e) {
        reject(e);
      });
      return;
    }
    resolve(keyFile);
  });
};

/**
 * Flatten the parent groups of an entry from a tree into a single level array.
 * @param KdbxEntry entry
 * @returns {Array}
 */
KeepassDb.prototype.flattenParentGroups = function(entry) {
  function getParent(group, flattenedGroups) {
    if (group.parentGroup != undefined) {
      flattenedGroups = getParent(group.parentGroup, flattenedGroups);
    }
    flattenedGroups.push(group);
    return flattenedGroups;
  }

  var flattenedGroups = [];
  flattenedGroups = getParent(entry.parentGroup, flattenedGroups);
  return flattenedGroups;
};

/**
 * Calculate a resource tag name from a list of flattened groups.
 * @param Array flattenedGroups
 * @returns {string}
 */
KeepassDb.prototype.getTagNameFromFlattenedGroups = function(flattenedGroups) {
  var tag = "";
  flattenedGroups.forEach((group) => {
    tag += ( "/" + group.name );
});
  return tag;
};

/**
 * Transform a kdbx database into a list of Resources.
 * @param Kdbx kdbxDb
 * @returns {Promise}
 */
KeepassDb.prototype.toResources = function(kdbxDb) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var entries = [];
    try {
      kdbxDb.groups[0].forEach(function(entry, group) {
        if (entry != undefined) {
          var resource = new Resource().fromKdbxEntry(entry);
          var groups = self.flattenParentGroups(entry);
          var tag = self.getTagNameFromFlattenedGroups(groups);
          resource.tags = [];
          resource.tags.push(tag);
          entries.push(resource);
        }
      });
    }
    catch(e) {
      reject(e);
    }
    resolve(entries);
  });
};

/**
 * Create an entry in the db from a Resource.
 * @param Resouce resource
 * @param KdbxGroup group
 * @param Kdbx db
 * @returns {KdbxEntry}
 */
KeepassDb.prototype.createEntry = function(resource, group, db) {
  if (db == undefined || db == null) {
    db = this.db;
  }
  if (group == undefined || group == null) {
    group = db.getDefaultGroup();
  }
  var entry = db.createEntry(group);
  entry.fields.Title = resource.name;
  entry.fields.UserName = resource.username;
  entry.fields.Password = kdbxweb.ProtectedValue.fromString(resource.secretClear);
  entry.fields.URL = resource.uri;
  entry.fields.Notes = resource.description;
  return entry;
};

/**
 * Build a Kdbx database from a list of Resources.
 * @param Array resources array of Resources
 * @param string password the password to encrypt the db
 * @param keyFile the keyfile to encrypt the db
 * @returns {Promise.<ArrayBuffer>|*}
 */
KeepassDb.prototype.fromResources = function(resources, password, keyFile) {
  if (keyFile == undefined) {
    keyFile = null;
  }
  var self = this;

  return this.createDb(password, keyFile)
  .then(function(db) {
    for(let i=0; i < resources.length; i++) {
      self.createEntry(resources[i], null);
    }
    return self.db.save();
  });
};

exports.KeepassDb = KeepassDb;
