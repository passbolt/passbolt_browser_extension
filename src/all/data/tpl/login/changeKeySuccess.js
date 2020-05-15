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
  , __lines = "<h2>Success!</h2>\n<p>\n    The key was changed.\n    You are good to go. Click on the button bellow or refresh the page to retry.\n</p>\n<div class=\"actions-wrapper center\">\n    <a class=\"button primary big\" href=\"<?= domain ?>\" role=\"button\" target=\"_parent\" rel=\"noopener noreferrer\">\n        Retry login\n    </a>\n</div>\n"
  , __filename = "src/all/data/ejs/login/changeKeySuccess.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<h2>Success!</h2>\n<p>\n    The key was changed.\n    You are good to go. Click on the button bellow or refresh the page to retry.\n</p>\n<div class=\"actions-wrapper center\">\n    <a class=\"button primary big\" href=\"")
    ; __line = 7
    ; __append(escapeFn( domain ))
    ; __append("\" role=\"button\" target=\"_parent\" rel=\"noopener noreferrer\">\n        Retry login\n    </a>\n</div>\n")
    ; __line = 11
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/login/changeKeySuccess.ejs

}