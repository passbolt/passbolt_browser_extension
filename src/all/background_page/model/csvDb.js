/**
 * CsvDb model.
 * Provides high level tools to work with a password csv file.
 */
var Resource = require('./resource').Resource;

/**
 * Constructor.
 * @constructor
 */
var CsvDb = function() {
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
    "tags": "Group"
  },
  "lastpass": {
    "name": "name",
    "username": "username",
    "uri": "url",
    "secretClear": "password",
    "description": "extra",
    "tags": "grouping"
  },
  "1password": {
    "name": "Title",
    "username": "Username",
    "uri": "URL",
    "secretClear": "Password",
    "description": "Notes",
    "tags": "Type"
  }
};

/**
 * load a db from file.
 * @param File kdbxFile file object as returned by the file field.
 * @returns {Promise}
 */
CsvDb.prototype.loadDb = function(csvFile) {
  var self = this;
  return new Promise(function(resolve, reject) {
    PapaParse.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: function(results, file) {
        self.db = results;
        resolve(results);
      }
    });
  });
};

/**
 * Transform a csv database into a list of Resources.
 * @param Array csvDb
 * @returns {Promise}
 */
CsvDb.prototype.toResources = function(csvDb) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var resources = [];
    for (var i in csvDb['data']) {
      var csvEntry = csvDb['data'][i];
      var formatName = self.getCsvFormat(csvEntry);
      if (formatName == false) {
        reject('CSV format is not recognized');
      }

      var resource = new Resource();
      var mapping = CsvDb.formats[formatName];
      resource.fromCsvEntry(csvEntry, mapping);
      resources.push(resource);
    }
    resolve(resources);
  });
};

/**
 * Transform a list of resources into a CSV file content.
 * @param array resources
 * @param string format csv format
 * @returns {Promise} a promise containing the content of the csv file.
 */
CsvDb.prototype.fromResources = function(resources, format) {
  return new Promise(function(resolve, reject) {
    var resource = new Resource(),
      csvEntries = [],
      csvContent = null;

    if(CsvDb.formats[format] == undefined) {
      return reject('This csv format is not supported');
    }

    try {
      for (var i in resources) {
        var csvEntry = resource.toCsvEntry(resources[i], CsvDb.formats[format]);
        csvEntries.push(csvEntry);
      }
      csvContent = PapaParse.unparse(csvEntries, {header: true, quotes: true});
      resolve(csvContent);
    } catch(e) {
      reject(e);
    }
  });
};

/**
 * Get CSV format name from a csv entry.
 * @param csvEntry
 * @returns {*}
 */
CsvDb.prototype.getCsvFormat = function(csvEntry) {
  var formats = CsvDb.formats;
  for (var formatName in formats) {
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
  var match = true;
  for (var i in format) {
    if (csvEntry[format[i]] == undefined) {
      match = false;
      break;
    }
  }
  return match;
};

exports.CsvDb = CsvDb;
