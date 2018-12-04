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
  , __lines = "<div class=\"col6 push1 information\">\n    <h2>Almost there, please register!</h2>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check <?= browserName ?> warning\">\n            <p class=\"message\">\n                The plugin is installed but not configured.\n                <? if(publicRegistration) { ?>\n                    <a href=\"<?= passboltDomain ?>/register\">Please register</a>,\n                <? } else { ?>\n                    Please contact your domain administrator to request an invitation,\n\t\t\t\t<? } ?>\n                or <a href=\"<?= passboltDomain ?>/recover\">recover your account if you already have one!</a>\n            </p>\n        </div>\n    </div>\n    <p>\n        If you already registered please check your mail inbox (and your spam folder).\n    </p>\n</div>\n<div class=\"col4 push1 last\">\n\t<div class=\"logo\">\n\t\t<h1><span>Passbolt</span></h1>\n\t</div>\n    <div class=\"users login form\">\n        <div class=\"feedback\">\n            <i class=\"fa huge fa-rocket\" ></i>\n            <p>You need an account to login.</p>\n        </div>\n        <div class=\"actions-wrapper center\">\n\t\t\t<? if(publicRegistration) { ?>\n                <a class=\"button primary\" href=\"<?= passboltDomain ?>/register\">Register</a>\n                <a href=\"<?= passboltDomain ?>/recover\">Have an account?</a>\n\t\t\t<? } else { ?>\n                Please contact your domain administrator to request an invitation.<br><br>\n                or <a href=\"<?= passboltDomain ?>/recover\">recover your existing account</a>\n\t\t\t<? } ?>\n        </div>\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/login/noconfig.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"col6 push1 information\">\n    <h2>Almost there, please register!</h2>\n    <div class=\"plugin-check-wrapper\">\n        <div class=\"plugin-check ")
    ; __line = 4
    ; __append(escapeFn( browserName ))
    ; __append(" warning\">\n            <p class=\"message\">\n                The plugin is installed but not configured.\n                ")
    ; __line = 7
    ;  if(publicRegistration) { 
    ; __append("\n                    <a href=\"")
    ; __line = 8
    ; __append(escapeFn( passboltDomain ))
    ; __append("/register\">Please register</a>,\n                ")
    ; __line = 9
    ;  } else { 
    ; __append("\n                    Please contact your domain administrator to request an invitation,\n				")
    ; __line = 11
    ;  } 
    ; __append("\n                or <a href=\"")
    ; __line = 12
    ; __append(escapeFn( passboltDomain ))
    ; __append("/recover\">recover your account if you already have one!</a>\n            </p>\n        </div>\n    </div>\n    <p>\n        If you already registered please check your mail inbox (and your spam folder).\n    </p>\n</div>\n<div class=\"col4 push1 last\">\n	<div class=\"logo\">\n		<h1><span>Passbolt</span></h1>\n	</div>\n    <div class=\"users login form\">\n        <div class=\"feedback\">\n            <i class=\"fa huge fa-rocket\" ></i>\n            <p>You need an account to login.</p>\n        </div>\n        <div class=\"actions-wrapper center\">\n			")
    ; __line = 30
    ;  if(publicRegistration) { 
    ; __append("\n                <a class=\"button primary\" href=\"")
    ; __line = 31
    ; __append(escapeFn( passboltDomain ))
    ; __append("/register\">Register</a>\n                <a href=\"")
    ; __line = 32
    ; __append(escapeFn( passboltDomain ))
    ; __append("/recover\">Have an account?</a>\n			")
    ; __line = 33
    ;  } else { 
    ; __append("\n                Please contact your domain administrator to request an invitation.<br><br>\n                or <a href=\"")
    ; __line = 35
    ; __append(escapeFn( passboltDomain ))
    ; __append("/recover\">recover your existing account</a>\n			")
    ; __line = 36
    ;  } 
    ; __append("\n        </div>\n    </div>\n</div>\n")
    ; __line = 40
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}