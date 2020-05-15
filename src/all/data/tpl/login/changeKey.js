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
  , __lines = "<h3>The server key has changed!</h3>\n<p>\n    For\n    <a href=\"https://help.passbolt.com/start/key-change\" target=\"_blank\" target=\"_blank\" rel=\"noopener noreferrer\">\n    security reasons</a>, please confirm with your IT administrator that this is\n    a change they initiated.\n</p>\n<div class=\"input checkbox required\">\n    <input type=\"checkbox\" id=\"js_server_key_change_confirm\" value=\"legit\"/>\n    <label for=\"js_server_key_change_confirm\">I have checked, all is fine.</label>\n</div><br>\n<div class=\"actions-wrapper center\">\n    <a id=\"js_server_key_change_submit\" class=\"button primary big disabled\" href=\"#\" role=\"button\">Accept new key</a>\n</div>\n"
  , __filename = "src/all/data/ejs/login/changeKey.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<h3>The server key has changed!</h3>\n<p>\n    For\n    <a href=\"https://help.passbolt.com/start/key-change\" target=\"_blank\" target=\"_blank\" rel=\"noopener noreferrer\">\n    security reasons</a>, please confirm with your IT administrator that this is\n    a change they initiated.\n</p>\n<div class=\"input checkbox required\">\n    <input type=\"checkbox\" id=\"js_server_key_change_confirm\" value=\"legit\"/>\n    <label for=\"js_server_key_change_confirm\">I have checked, all is fine.</label>\n</div><br>\n<div class=\"actions-wrapper center\">\n    <a id=\"js_server_key_change_submit\" class=\"button primary big disabled\" href=\"#\" role=\"button\">Accept new key</a>\n</div>\n")
    ; __line = 15
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/login/changeKey.ejs

}