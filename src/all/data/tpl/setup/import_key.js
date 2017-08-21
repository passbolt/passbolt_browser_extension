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
  , __lines = "<!-- left column -->\n<div class=\"col6 import-key-wrapper\">\n    <h3>Copy paste your private key below</h3>\n    <div class=\"input textarea gpgkey\">\n        <textarea name=\"data[Key][ascii]\" class=\"fluid code\" id=\"js_setup_import_key_text\"></textarea>\n    </div>\n    <div class=\"message error hidden\" id=\"KeyErrorMessage\"></div>\n    <div class=\"input file\">\n        <div class=\"input-wrapper\">\n            <div class=\"input-wrapper-2\">\n                <input name=\"data[Key][file]\" value=\"Browse...\" id=\"js_setup_import_key_browse\" type=\"submit\">\n                <span class=\"help-text\">Or select a file from your computer</span>\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"col4 last sideInfo\"></div>\n\n"
  , __filename = "src/all/data/ejs/setup/import_key.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<!-- left column -->\n<div class=\"col6 import-key-wrapper\">\n    <h3>Copy paste your private key below</h3>\n    <div class=\"input textarea gpgkey\">\n        <textarea name=\"data[Key][ascii]\" class=\"fluid code\" id=\"js_setup_import_key_text\"></textarea>\n    </div>\n    <div class=\"message error hidden\" id=\"KeyErrorMessage\"></div>\n    <div class=\"input file\">\n        <div class=\"input-wrapper\">\n            <div class=\"input-wrapper-2\">\n                <input name=\"data[Key][file]\" value=\"Browse...\" id=\"js_setup_import_key_browse\" type=\"submit\">\n                <span class=\"help-text\">Or select a file from your computer</span>\n            </div>\n        </div>\n    </div>\n</div>\n<div class=\"col4 last sideInfo\"></div>\n\n")
    ; __line = 19
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}