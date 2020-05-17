/**
 * KeepassDb model
 * Provides high level tools to work with a kdbx file and object.
 */
var Resource = require('../resource').Resource;
var fileController = require('../../controller/fileController');

/**
 * Constructor.
 * @constructor
 */
var KeepassDb = function() {
  this.db = null;
  // Contains folders organized by folder uuid : kdbx group
  this._groups = {};
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
 * Transform a group into a flat path by traversing the parents.
 * @param KdbxGroup group
 * @returns {String} path. Example: "/parent1/group"
 */
KeepassDb.prototype.getGroupPath = function(group) {
  function getParent(group, groups) {
    if (group.parentGroup) {
      groups = getParent(group.parentGroup, groups);
    }
    groups.push(group);
    return groups;
  }

  let groups = [];
  groups = getParent(group, groups);

  const groupNames = groups.map(group => {
    return group.name;
  });

  const path = groupNames.join('/');

  return path;
};

/**
 * Transform a kdbx database into a list of Resources.
 * @param Kdbx kdbxDb
 * @returns {Array}
 */
KeepassDb.prototype.toResources = function(kdbxDb) {
  const entries = [];
    kdbxDb.groups[0].forEach((entry, group) => {
      if (entry) {
        const resource = new Resource().fromKdbxEntry(entry);
        resource.folderParentPath = this.getGroupPath(entry.parentGroup);
        entries.push(resource);
      }
    });

    return entries;
};

/**
 * Handle a group recursively.
 * Add its path the paths, and explore recursively all its children.
 * @param group
 * @param paths
 * @return {*}
 */
KeepassDb.prototype._handleGroupRecursively = function(group, paths) {
  paths.push(this.getGroupPath(group));
  if (group.groups) {
    group.groups.forEach((subGroup) => {
      paths = this._handleGroupRecursively(subGroup, paths);
    });
  }

  return paths;
};

/**
 * Transform a kdbx database into a list of folders paths (that will later become folders).
 * @param Kdbx kdbxDb
 * @returns {Array}
 */
KeepassDb.prototype.toFoldersPaths = function(kdbxDb) {
    let foldersPaths = [];
    kdbxDb.groups[0].forEach((entry, group) => {
        if (group) {
          foldersPaths = this._handleGroupRecursively(group, foldersPaths);
        }
    });

    // Remove duplicates and order.
    foldersPaths = [...new Set(foldersPaths)].sort();
    return foldersPaths;
};

/**
 * Transform a kdbx database into a list of Resources.
 * @param Kdbx kdbxDb
 * @returns {Promise}
 */
KeepassDb.prototype.toItems = function(kdbxDb) {
  const items = {
    'resources': [],
    'foldersPaths': [],
  };

  items.resources = this.toResources(kdbxDb);
  items.foldersPaths = this.toFoldersPaths(kdbxDb);

  return items;
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
  const entry = db.createEntry(group);
  entry.fields.Title = resource.name;
  entry.fields.UserName = resource.username;
  entry.fields.Password = kdbxweb.ProtectedValue.fromString(resource.secretClear);
  entry.fields.URL = resource.uri;
  entry.fields.Notes = resource.description;
  return entry;
};

/**
 * Find a group in the current db for a given folder, or create it in a recursive way.
 * Each group created through this function will be stored in this._groups for reference.
 * @param folder the folder to lookup for
 * @param folders the list of folders from the same tree, in order to be able to retrieve the parents if needed.
 * @return {*}
 */
KeepassDb.prototype.findOrCreateGroupRecursive = function(folder, folders) {
  let parentGroup = null;

  if(folder.folder_parent_id) {
    if(!this._groups[folder.folder_parent_id]) {
      const parentFolder = folders.filter(f => f.id === folder.folder_parent_id);
      this.findOrCreateGroupRecursive(parentFolder, folders);
    }

    parentGroup = this._groups[folder.folder_parent_id];
  } else {
    parentGroup = this.db.getDefaultGroup();
  }

  if (!this._groups[folder.id]) {
    // Create it.
    this._groups[folder.id] = this.db.createGroup(parentGroup, folder.name);
  }

  return this._groups[folder.id];
}

/**
 * Build a Kdbx database from a list of Items.
 * @param object items items to export
 *   format: {
 *     resources: array or resources,
 *     folders: array of folders
 *   }
 * @param string password the password to encrypt the db
 * @param keyFile the keyfile to encrypt the db
 * @returns {Promise.<ArrayBuffer>|*}
 */
KeepassDb.prototype.fromItems = function(items, password, keyFile) {
  if (keyFile == undefined) {
    keyFile = null;
  }
  const self = this;

  return this.createDb(password, keyFile)
  .then(function() {

    // Folders, if they are provided.
    if (items.folders.length) {
      for(let i in items.folders) {
        self.findOrCreateGroupRecursive(items.folders[i], items.folders);
      }
    }

    // Resources.
    for(let i=0; i < items.resources.length; i++) {
      let parentGroup = null;
      if (items.resources[i].folder_parent_id) {
        const parentFolder = items.folders.find(f => f.id === items.resources[i].folder_parent_id);
        parentGroup = self.findOrCreateGroupRecursive(parentFolder, items.folders);
      }

      self.createEntry(items.resources[i], parentGroup);
    }
    return self.db.save();
  });
};

exports.KeepassDb = KeepassDb;
