/**
 * !! Warning.
 * The API used to gain Chrome access is currently an experimental feature of the SDK, and may change in future releases.
 * @see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Chrome_Authority
 */
var {Cc, Ci} = require('chrome');

var copy = function(worker, txt) {
  const gClipboardHelper = Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper);
  gClipboardHelper.copyString(txt);
};
exports.copy = copy;
