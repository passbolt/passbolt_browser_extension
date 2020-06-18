/**
 * CsvDb model.
 * Provides high level tools to work with a password csv file.
 */
const Resource = require('./resource').Resource;

/**
 * Constructor.
 * @constructor
 */
const CsvDb = function() {
  this.db = null;
};

/**
 * Formats available to read a CSV entry.
 */
CsvDb.formats = {
  "kdbx": {
    "name": "Title",
    "username" : "Username",
    "uri": "URL",
    "secretClear": "Password",
    "description": "Notes",
    "tags": "Group",
    "folderParentPath":"Group"
  },
  "lastpass": {
    "name": "name",
    "username": "username",
    "uri": "url",
    "secretClear": "password",
    "description": "extra",
    "tags": "grouping",
    "folderParentPath":"grouping"
  },
  "1password": {
    "name": "Title",
    "username": "Username",
    "uri": "URL",
    "secretClear": "Password",
    "description": "Notes",
    "tags": "Type",
    "folderParentPath":"Type"
  }
};

/**
 * load a db from file.
 * @param {File} csvFile file object as returned by the file field.
 * @returns {Promise}
 */
CsvDb.prototype.loadDb = function(csvFile) {
  return new Promise((resolve) => {
    PapaParse.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        this.db = results;
        resolve(results);
      }
    });
  });
};

/**
 * Transform a csv file into a list of Resources and folders
 * @param {Array} csvDb
 * @returns {Promise<object>} with resources and foldersPaths
 */
CsvDb.prototype.toItems = async function(csvDb) {
  const resources = await this.toResources(csvDb);
  return {
    'resources': resources,
    'foldersPaths': this.toFoldersPaths(resources),
  };
};

/**
 * Transform a csv file into a list of folders paths (that will later become folders).
 * @param {Array} resources
 * @returns {Array}
 */
CsvDb.prototype.toFoldersPaths = function(resources) {
  let foldersPaths = [];

  resources.forEach((resource) => {
    if (resource.folderParentPath) {
      let paths = this.getGroupPath(resource.folderParentPath);
      foldersPaths = [...foldersPaths, ...paths];
    }
  });

  // Remove duplicates and order.
  foldersPaths = [...new Set(foldersPaths)].sort();
  return foldersPaths;
};

/**
 * Transform a group into a flat path by traversing the parents.
 * @param {string} path
 * @returns {array} path. Example: "/parent1/group"
 */
CsvDb.prototype.getGroupPath = function(path) {
  const results = [];
  const pathFragment = path.split('/');
  let previous = '';
  for (let i in pathFragment) {
    let insert = previous + pathFragment[i];
    results.push(insert);
    previous = insert + '/';
  }
  return results;
};

/**
 * Transform a csv database into a list of Resources.
 * @param {Array} csvDb
 * @returns {Promise}
 */
CsvDb.prototype.toResources = async function(csvDb) {
  return new Promise((resolve, reject) => {
    const resources = [];
    for (let i in csvDb['data']) {
      if (csvDb['data'].hasOwnProperty(i)) {
        const csvEntry = csvDb['data'][i];
        const formatName = this.getCsvFormat(csvEntry);
        if (formatName === false) {
          reject('CSV format is not recognized');
        }

        const resource = new Resource();
        const mapping = CsvDb.formats[formatName];
        resource.fromCsvEntry(csvEntry, mapping);
        resources.push(resource);
      }
    }
    resolve(resources);
  });
};

/**
 * Transform a list of resources into a CSV file content.
 * @param {array} resources
 * @param {string} format csv format
 * @returns {Promise} a promise containing the content of the csv file.
 */
CsvDb.prototype.fromResources = function(resources, format) {
  return new Promise((resolve, reject) => {
    const resource = new Resource();
    const csvEntries = [];
    let csvContent = null;

    if (CsvDb.formats[format] === undefined) {
      return reject('This csv format is not supported');
    }

    try {
      for (let i in resources) {
        const csvEntry = resource.toCsvEntry(resources[i], CsvDb.formats[format]);
        csvEntries.push(csvEntry);
      }
      csvContent = PapaParse.unparse(csvEntries, {header: true, quotes: true});
      resolve(csvContent);
    } catch(e) {
      reject(e);
    }s
  });
};

/**
 * Get CSV format name from a csv entry.
 * @param csvEntry
 * @returns {*}
 */
CsvDb.prototype.getCsvFormat = function(csvEntry) {
  const formats = CsvDb.formats;
  for (let formatName in formats) {
    if (CsvDb._checkFormat(csvEntry, formats[formatName])) {
      return formatName;
    }
  }
  return false;
};

/**
 * Check if a CSV entry matches the format provided.
 * @param csvEntry
 * @param format
 * @returns {boolean}
 * @private
 */
CsvDb._checkFormat = function(csvEntry, format) {
  let match = true;
  for (let i in format) {
    if (format.hasOwnProperty(i) && csvEntry[format[i]] === undefined) {
      match = false;
      break;
    }
  }
  return match;
};

exports.CsvDb = CsvDb;
