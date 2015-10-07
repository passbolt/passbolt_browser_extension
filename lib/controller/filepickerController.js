/**
 * !! Warning.
 * The API used to gain Chrome access is currently an experimental feature of the SDK, and may change in future releases.
 * @see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Chrome_Authority
 */
var {Cc, Ci} = require("chrome");

function openFilePrompt() {
  const nsIFilePicker = Ci.nsIFilePicker;

  var window = require("sdk/window/utils").getMostRecentBrowserWindow(),
    path = null,
    fp = Cc["@mozilla.org/filepicker;1"]
      .createInstance(nsIFilePicker);

  fp.init(window, "Select a file", nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    path = fp.file.path;
  }

  return path;
}
exports.openFilePrompt = openFilePrompt;

function saveFilePrompt(filename) {
  const nsIFilePicker = Ci.nsIFilePicker;

  var window = require("sdk/window/utils").getMostRecentBrowserWindow(),
    path = null,
    fp = Cc["@mozilla.org/filepicker;1"]
      .createInstance(nsIFilePicker);

  fp.init(window, "Select a file", nsIFilePicker.modeSave);
  fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
  fp.defaultString = filename;

  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    path = fp.file.path;
  }

  return path;
}
exports.saveFilePrompt = saveFilePrompt;
