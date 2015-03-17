var {Cc, Ci} = require("chrome");

var copy = function(worker, txt) {
  const gClipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  gClipboardHelper.copyString(txt);
  console.log('copy to cliboard');
  console.log(txt);
};
exports.copy = copy;
