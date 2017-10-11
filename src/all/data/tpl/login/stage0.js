module.exports = function(locals, escapeFn, include, rethrow
/*``*/) {
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
  , __lines = "<div class=\"col6 push1 information\">\n    <h2>Welcome back!</h2>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check <?= browserName ?> success\">\n            <p class=\"message\">\n                Nice one! The plugin is installed and configured. You are good to go!\n            </p>\n        </div>\n    </div>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check gpg notice\">\n            <p class=\"message\">\n                Server identity check in progress...\n                Checking key:\n                <a href=\"auth/verify\" target='_blank' id=\"serverkey_id\">\n                   <?= serverKeyId ?>\n                </a>\n            </p>\n        </div>\n    </div>\n</div>\n<div class=\"col4 push1 last\">\n    <div class=\"logo\">\n        <h1><span>Passbolt</span></h1>\n    </div>\n    <div class=\"users login form\">\n        <div class=\"feedback\">\n            <i class=\"fa fa-cog fa-spin huge\" ></i>\n            <p>Checking server key<br> please wait...</p>\n        </div>\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/login/stage0.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"col6 push1 information\">\n    <h2>Welcome back!</h2>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check ")
    ; __line = 4
    ; __append(escapeFn( browserName ))
    ; __append(" success\">\n            <p class=\"message\">\n                Nice one! The plugin is installed and configured. You are good to go!\n            </p>\n        </div>\n    </div>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check gpg notice\">\n            <p class=\"message\">\n                Server identity check in progress...\n                Checking key:\n                <a href=\"auth/verify\" target='_blank' id=\"serverkey_id\">\n                   ")
    ; __line = 16
    ; __append(escapeFn( serverKeyId ))
    ; __append("\n                </a>\n            </p>\n        </div>\n    </div>\n</div>\n<div class=\"col4 push1 last\">\n    <div class=\"logo\">\n        <h1><span>Passbolt</span></h1>\n    </div>\n    <div class=\"users login form\">\n        <div class=\"feedback\">\n            <i class=\"fa fa-cog fa-spin huge\" ></i>\n            <p>Checking server key<br> please wait...</p>\n        </div>\n    </div>\n</div>\n")
    ; __line = 33
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}