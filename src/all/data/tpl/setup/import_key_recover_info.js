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
  , __lines = "<h3>What is this private key?</h3>\n<p>\n    The key you need here is the key that was generated (or that you imported) during your first setup.\n    Remember, during the initial setup, there was a step where you were asked to make a backup.\n    You need this file now.\n</p>\n<h3>What if I don't have it?</h3>\n<p>\n    If you don't have a backup of your key, you will not be able to recover your account.\n<p>"
  , __filename = "src/all/data/ejs/setup/import_key_recover_info.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<h3>What is this private key?</h3>\n<p>\n    The key you need here is the key that was generated (or that you imported) during your first setup.\n    Remember, during the initial setup, there was a step where you were asked to make a backup.\n    You need this file now.\n</p>\n<h3>What if I don't have it?</h3>\n<p>\n    If you don't have a backup of your key, you will not be able to recover your account.\n<p>")
    ; __line = 10
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}