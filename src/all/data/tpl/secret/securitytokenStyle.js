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
  , __lines = "<style>\n    <%= id %>:focus,\n    <%= id %> ~ .security-token {\n        background: <%= color %>;\n        color: <%= textcolor %>;\n    }\n    <%= id %>:focus ~ .security-token {\n        background: <%= textcolor %>;\n        color: <%= color %>;\n    };\n</style>"
  , __filename = "src/all/data/ejs/secret/securitytokenStyle.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<style>\n    ")
    ; __line = 2
    ; __append(escapeFn( id ))
    ; __append(":focus,\n    ")
    ; __line = 3
    ; __append(escapeFn( id ))
    ; __append(" ~ .security-token {\n        background: ")
    ; __line = 4
    ; __append(escapeFn( color ))
    ; __append(";\n        color: ")
    ; __line = 5
    ; __append(escapeFn( textcolor ))
    ; __append(";\n    }\n    ")
    ; __line = 7
    ; __append(escapeFn( id ))
    ; __append(":focus ~ .security-token {\n        background: ")
    ; __line = 8
    ; __append(escapeFn( textcolor ))
    ; __append(";\n        color: ")
    ; __line = 9
    ; __append(escapeFn( color ))
    ; __append(";\n    };\n</style>")
    ; __line = 11
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}