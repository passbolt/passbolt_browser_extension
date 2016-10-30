/**
 * File picker controller.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * !! Warning.
 * The API used to gain Chrome access is currently an experimental feature of the SDK, and may change in future releases.
 * @see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Chrome_Authority
 */
var {Cc, Ci} = require('chrome');
const {Cu} = require('chrome');
const {TextDecoder, TextEncoder, OS} = Cu.import('resource://gre/modules/osfile.jsm', {});

var __ = require('sdk/l10n').get;
var fileIO = require('sdk/io/file');
const defer = require('sdk/core/promise').defer;
var preferences = require("sdk/preferences/service");
var data = require('sdk/self').data;

/**
 * Open a dialog box for selecting a file to open.
 *
 * @returns {string} The path of the file to open
 */
function _openFilePrompt() {
  const nsIFilePicker = Ci.nsIFilePicker;

  var window = require('sdk/window/utils').getMostRecentBrowserWindow(),
    path = null,
    fp = Cc['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);

  fp.init(window, 'Select a file', nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    path = fp.file.path;
  }

  return path;
}

/**
 * Open a file and return the content
 *
 * @return {promise}
 */
function openFile() {
  var deferred = defer();
  var path = _openFilePrompt();
  if (fileIO.isFile(path)) {
    var fileContent = fileIO.read(path);
    deferred.resolve(fileContent);
  } else {
    deferred.reject(new Error(__('The selected file does not exist.')));
  }
  return deferred.promise;
}
exports.openFile = openFile;

/**
 * Get the prefered download directory path
 *
 * @return {promise}
 */
function getPreferredDownloadsDirectory() {
  Cu.import('resource://gre/modules/Downloads.jsm');
  return Downloads.getPreferredDownloadsDirectory();
}
exports.getPreferredDownloadsDirectory = getPreferredDownloadsDirectory;

/**
 * Open a dialog box for selecting a file to save
 *
 * @param filename Name of the file
 * @returns {string} The path of the file to save
 */
function _saveFilePrompt(filename) {
  const nsIFilePicker = Ci.nsIFilePicker;

  var window = require('sdk/window/utils').getMostRecentBrowserWindow(),
    path = null,
    fp = Cc['@mozilla.org/filepicker;1']
      .createInstance(nsIFilePicker);

  fp.init(window, 'Select a file', nsIFilePicker.modeSave);
  fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
  fp.defaultString = filename;

  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    path = fp.file.path;
  }

  return path;
}

/**
 * Save file on disk using file prompt
 *
 * @param filename
 * @param content
 */
function saveFile(filename, content) {
  var deferred = defer();
  let encoder = new TextEncoder();
  let array = encoder.encode(content);

  getPreferredDownloadsDirectory()
  .then(function (preferredDownloadsDir) {
    // In case we are running selenium tests, path is taken from preferences,
    // we don't open file selector.
    var folderList = preferences.get("browser.download.folderList");
    var downloadDir = preferences.get("browser.download.dir") || preferredDownloadsDir;
    var showFolderList = (folderList == undefined || folderList != 2);
    var path;

    if (showFolderList) {
      path = _saveFilePrompt(filename);
    } else {
      path = downloadDir + '/' + filename;
    }
    return OS.File.writeAtomic(path, array);
  })
  .then(function (result) {
    return deferred.resolve();
  }, function (error) {
    return deferred.reject(error);
  });

  return deferred.promise;
}
exports.saveFile = saveFile;

/**
 * Load file content.
 * @param path {string} Path of the file to load
 * @return {promise}
 */
function loadFile (path) {
  var deferred = defer();
  deferred.resolve(data.load(path));
  return deferred.promise;
}
exports.loadFile = loadFile;