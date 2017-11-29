module.exports = function(locals, escapeFn, include, rethrow
/**/) {
rethrow = rethrow || function rethrow(err, str, flnm, lineno, esc){
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  var filename = esc(flnm); // eslint-disable-line
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
};
escapeFn = escapeFn || function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
        .replace(_MATCH_HTML, encode_char);
};
var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
;
var __line = 1
  , __lines = "<div class=\"col7\">\n    <div class=\"plugin-check-wrapper\">\n        <h3>Let's make a backup</h3>\n        <p>All good! The secret key is stored in your add-on and ready to use.</p>\n        <div class=\"success message backup-prompt\">\n            <a id=\"js_backup_key_download\" class=\"button primary next big\">\n                <i class=\"fa fa-fw fa-download\"></i>\n                <span>download</span>\n            </a>\n            <span class=\"help-text\">Take some time to make a backup of your key (and store it in a safe location).</span>\n        </div>\n        <p>\n            You should always make a backup. If you lose this key (by breaking or losing your computer\n            and not having a backup for example), your encrypted data will be lost even if you remember\n            your passphrase.\n        </p>\n    </div>\n</div>\n<div class=\"col4 last\">\n    <h3>Pro tips</h3>\n    <p>\n        The secret key is itself encrypted, so it is only usable if one knows the passphrase.<br><br>\n        It is a good practice to store a backup in a different location.\n        You can, for example, print it and mail it to a family member (along with a nice postcard!) and ask them to keep it somewhere safe.\n        <br><br>\n        Or, even better, you can store it in a safe if you have one!\n    </p>\n</div>"
  , __filename = "src/all/data/ejs/setup/backup_key.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"col7\">\n    <div class=\"plugin-check-wrapper\">\n        <h3>Let's make a backup</h3>\n        <p>All good! The secret key is stored in your add-on and ready to use.</p>\n        <div class=\"success message backup-prompt\">\n            <a id=\"js_backup_key_download\" class=\"button primary next big\">\n                <i class=\"fa fa-fw fa-download\"></i>\n                <span>download</span>\n            </a>\n            <span class=\"help-text\">Take some time to make a backup of your key (and store it in a safe location).</span>\n        </div>\n        <p>\n            You should always make a backup. If you lose this key (by breaking or losing your computer\n            and not having a backup for example), your encrypted data will be lost even if you remember\n            your passphrase.\n        </p>\n    </div>\n</div>\n<div class=\"col4 last\">\n    <h3>Pro tips</h3>\n    <p>\n        The secret key is itself encrypted, so it is only usable if one knows the passphrase.<br><br>\n        It is a good practice to store a backup in a different location.\n        You can, for example, print it and mail it to a family member (along with a nice postcard!) and ask them to keep it somewhere safe.\n        <br><br>\n        Or, even better, you can store it in a safe if you have one!\n    </p>\n</div>")
    ; __line = 28
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}