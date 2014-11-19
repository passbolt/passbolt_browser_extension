var {Cc, Ci} = require("chrome");

function promptForFile() {
  var window = require("sdk/window/utils").getMostRecentBrowserWindow();
  const nsIFilePicker = Ci.nsIFilePicker;

  var fp = Cc["@mozilla.org/filepicker;1"]
           .createInstance(nsIFilePicker);
  fp.init(window, "Select a file", nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);

  var rv = fp.show();
  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
    var file = fp.file;
    // Get the path as string. Note that you usually won't
    // need to work with the string paths.
    var path = fp.file.path;
    // work with returned nsILocalFile...
  }
  return path;
}

exports.promptForFile = promptForFile;
