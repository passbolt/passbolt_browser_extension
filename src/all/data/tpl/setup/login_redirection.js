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
  , __lines = "<!-- left collumn -->\n<div class=\"col7\">\n    <h3>Setup is complete</h3>\n    <div class=\"message success\">\n        <strong>\n            <i class=\"fa fa-check-circle\"></i>\n            Success!\n        </strong>\n        You have successfully completed the setup, thank you!\n        You will soon be redirected to the login page.\n    </div>\n    <div class=\"input-wrapper\">\n        <a id=\"js_spinner\" class=\"button primary next big processing\">login!</a>\n        <a>Click here if you can't wait</a>.\n    </div>\n    <p>\n    </p>\n</div>\n\n<!-- right collumn -->\n<div class=\"col4 last\">\n\n</div>\n"
  , __filename = "src/all/data/ejs/setup/login_redirection.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<!-- left collumn -->\n<div class=\"col7\">\n    <h3>Setup is complete</h3>\n    <div class=\"message success\">\n        <strong>\n            <i class=\"fa fa-check-circle\"></i>\n            Success!\n        </strong>\n        You have successfully completed the setup, thank you!\n        You will soon be redirected to the login page.\n    </div>\n    <div class=\"input-wrapper\">\n        <a id=\"js_spinner\" class=\"button primary next big processing\">login!</a>\n        <a>Click here if you can't wait</a>.\n    </div>\n    <p>\n    </p>\n</div>\n\n<!-- right collumn -->\n<div class=\"col4 last\">\n\n</div>\n")
    ; __line = 24
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}