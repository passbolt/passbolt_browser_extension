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
  , __lines = "<div class=\"feedback\">\n    <i class=\"fa fa-meh-o huge\" ></i>\n    <p>The supplied account does not exist</p>\n</div>\n<div class=\"actions-wrapper center\">\n    <a class=\"button primary big\" href=\"<?= passboltDomain ?>/register\">register again</a><br><br>\n    <a href=\"<?= passboltDomain ?>/recover\">or recover an existing account</a>\n</div>\n"
  , __filename = "src/all/data/ejs/login/feedbackLoginNoUser.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"feedback\">\n    <i class=\"fa fa-meh-o huge\" ></i>\n    <p>The supplied account does not exist</p>\n</div>\n<div class=\"actions-wrapper center\">\n    <a class=\"button primary big\" href=\"")
    ; __line = 6
    ; __append(escapeFn( passboltDomain ))
    ; __append("/register\">register again</a><br><br>\n    <a href=\"")
    ; __line = 7
    ; __append(escapeFn( passboltDomain ))
    ; __append("/recover\">or recover an existing account</a>\n</div>\n")
    ; __line = 9
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}