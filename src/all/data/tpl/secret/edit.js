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
  , __lines = "\n<div class=\"form-content\">\n    <div class=\"input-password-wrapper\">\n        <input type=\"hidden\" id=\"js_field_secret_id\" />\n        <div class=\"input password required\">\n            <input maxlength=\"4096\" type=\"password\" id=\"js_secret\" placeholder=\"password\" value=\"\"/>\n            <input maxlength=\"4096\" type=\"text\" id=\"js_secret_clear\" placeholder=\"password\" class=\"hidden\"/>\n            <div class=\"security-token\"></div>\n        </div>\n        <ul class=\"actions inline\">\n            <li>\n                <a id=\"js_secret_view\" class=\"button toggle\">\n                    <i class=\"fa fa-eye fa-fw fa-lg\"></i>\n                    <span class=\"visuallyhidden\">view</span>\n                </a>\n            </li>\n            <li>\n                <a id=\"js_secret_generate\" class=\"button\">\n                    <i class=\"fa fa-magic fa-fw fa-lg\"></i>\n                    <span class=\"visuallyhidden\">generate</span>\n                </a>\n            </li>\n        </ul>\n\n        <div id=\"js_secret_strength\" class=\"password-complexity\">\n        </div>\n\n        <div class=\"input text\">\n            <div id=\"js_field_password_feedback\" class=\"message error\">\n            </div>\n        </div>\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/secret/edit.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("\n<div class=\"form-content\">\n    <div class=\"input-password-wrapper\">\n        <input type=\"hidden\" id=\"js_field_secret_id\" />\n        <div class=\"input password required\">\n            <input maxlength=\"4096\" type=\"password\" id=\"js_secret\" placeholder=\"password\" value=\"\"/>\n            <input maxlength=\"4096\" type=\"text\" id=\"js_secret_clear\" placeholder=\"password\" class=\"hidden\"/>\n            <div class=\"security-token\"></div>\n        </div>\n        <ul class=\"actions inline\">\n            <li>\n                <a id=\"js_secret_view\" class=\"button toggle\">\n                    <i class=\"fa fa-eye fa-fw fa-lg\"></i>\n                    <span class=\"visuallyhidden\">view</span>\n                </a>\n            </li>\n            <li>\n                <a id=\"js_secret_generate\" class=\"button\">\n                    <i class=\"fa fa-magic fa-fw fa-lg\"></i>\n                    <span class=\"visuallyhidden\">generate</span>\n                </a>\n            </li>\n        </ul>\n\n        <div id=\"js_secret_strength\" class=\"password-complexity\">\n        </div>\n\n        <div class=\"input text\">\n            <div id=\"js_field_password_feedback\" class=\"message error\">\n            </div>\n        </div>\n    </div>\n</div>\n")
    ; __line = 34
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}