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
  , __lines = "<strong>Warning:</strong> The plugin is already configured for <%= firstname %> <%= lastname %> (<%= username %>), on domain <%= domain %>.\nCompleting this setup again will prevent <%= firstname %> <%= lastname %> from accesssing their passbolt account with this browser.\n"
  , __filename = "src/all/data/ejs/setup/already_configured.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<strong>Warning:</strong> The plugin is already configured for ")
    ; __append(escapeFn( firstname ))
    ; __append(" ")
    ; __append(escapeFn( lastname ))
    ; __append(" (")
    ; __append(escapeFn( username ))
    ; __append("), on domain ")
    ; __append(escapeFn( domain ))
    ; __append(".\nCompleting this setup again will prevent ")
    ; __line = 2
    ; __append(escapeFn( firstname ))
    ; __append(" ")
    ; __append(escapeFn( lastname ))
    ; __append(" from accesssing their passbolt account with this browser.\n")
    ; __line = 3
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}