module.exports = function(locals, escapeFn, include, rethrow
) {
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
  , __lines = "<div class=\"col6 push1 information\">\n    <h2>This domain is not known!</h2>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check <?= browserName ?> warning\">\n            <p class=\"message\">\n                The plugin is installed but is already configured for another domain.<br>\n            </p>\n        </div>\n    </div>\n    <p>You can <a href=\"<?= passboltDomain ?>/register\">register again</a> for this domain\n        or <a href=\"<?= passboltDomain ?>/recover\"> recover an existing account</a>,\n        but you will lose your account on the existing domain. Proceed with caution.</p>\n</div>\n<div class=\"col4 push1 last\">\n    <div class=\"logo\">\n        <h1><a href=\"#\"><span>Passbolt</span></a></h1>\n    </div>\n    <div class=\"users login form\">\n        <div class=\"feedback\">\n            <i class=\"fa huge fa-globe\" ></i>\n            <p>The browser extension is not configured to work with this domain</p>\n        </div>\n        <div class=\"actions-wrapper center\">\n            <? if(publicRegistration) { ?>\n                <a class=\"button primary big\" href=\"<?= passboltDomain ?>/register\">Register for this domain</a><br><br>\n            <? } ?>\n            <a href=\"<?= passboltDomain ?>/recover\">or recover an existing account</a>\n        </div>\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/login/wrongDomain.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<div class=\"col6 push1 information\">\n    <h2>This domain is not known!</h2>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check ")
    ; __line = 4
    ; __append(escapeFn( browserName ))
    ; __append(" warning\">\n            <p class=\"message\">\n                The plugin is installed but is already configured for another domain.<br>\n            </p>\n        </div>\n    </div>\n    <p>You can <a href=\"")
    ; __line = 10
    ; __append(escapeFn( passboltDomain ))
    ; __append("/register\">register again</a> for this domain\n        or <a href=\"")
    ; __line = 11
    ; __append(escapeFn( passboltDomain ))
    ; __append("/recover\"> recover an existing account</a>,\n        but you will lose your account on the existing domain. Proceed with caution.</p>\n</div>\n<div class=\"col4 push1 last\">\n    <div class=\"logo\">\n        <h1><a href=\"#\"><span>Passbolt</span></a></h1>\n    </div>\n    <div class=\"users login form\">\n        <div class=\"feedback\">\n            <i class=\"fa huge fa-globe\" ></i>\n            <p>The browser extension is not configured to work with this domain</p>\n        </div>\n        <div class=\"actions-wrapper center\">\n            ")
    ; __line = 24
    ;  if(publicRegistration) { 
    ; __append("\n                <a class=\"button primary big\" href=\"")
    ; __line = 25
    ; __append(escapeFn( passboltDomain ))
    ; __append("/register\">Register for this domain</a><br><br>\n            ")
    ; __line = 26
    ;  } 
    ; __append("\n            <a href=\"")
    ; __line = 27
    ; __append(escapeFn( passboltDomain ))
    ; __append("/recover\">or recover an existing account</a>\n        </div>\n    </div>\n</div>\n")
    ; __line = 31
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/login/wrongDomain.ejs

}