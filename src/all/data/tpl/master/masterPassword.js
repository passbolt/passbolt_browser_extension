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
  , __lines = "<div class=\"dialog-wrapper\">\n    <div class=\"dialog master-password\">\n        <div class=\"dialog-header\">\n            <h2>Please enter your passphrase</h2>\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <div class=\"form-content\">\n\n                <div class=\"input text required\">\n                    <label for=\"js_master_password\">You need your passphrase to continue.</label>\n                    <input type=\"password\" id=\"js_master_password\" placeholder=\"password\"/>\n                    <input type=\"text\" id=\"js_master_password_focus_first\" class=\"focus_first\">\n                    <span class=\"security-token\"></span>\n                </div>\n\n                <div class=\"input checkbox\">\n                    <input type=\"checkbox\" id=\"js_remember_master_password\"/>\n                    <label for=\"js_remember_master_password\">Remember it for 5 minutes</label>\n                </div>\n            </div>\n\n            <div class=\"submit-wrapper clearfix\">\n                <a id=\"master-password-submit\" class=\"button primary\">OK</a>\n                <a class=\"js-dialog-close cancel\">cancel</a>\n            </div>\n        </div>\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/master/masterPassword.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"dialog-wrapper\">\n    <div class=\"dialog master-password\">\n        <div class=\"dialog-header\">\n            <h2>Please enter your passphrase</h2>\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <div class=\"form-content\">\n\n                <div class=\"input text required\">\n                    <label for=\"js_master_password\">You need your passphrase to continue.</label>\n                    <input type=\"password\" id=\"js_master_password\" placeholder=\"password\"/>\n                    <input type=\"text\" id=\"js_master_password_focus_first\" class=\"focus_first\">\n                    <span class=\"security-token\"></span>\n                </div>\n\n                <div class=\"input checkbox\">\n                    <input type=\"checkbox\" id=\"js_remember_master_password\"/>\n                    <label for=\"js_remember_master_password\">Remember it for 5 minutes</label>\n                </div>\n            </div>\n\n            <div class=\"submit-wrapper clearfix\">\n                <a id=\"master-password-submit\" class=\"button primary\">OK</a>\n                <a class=\"js-dialog-close cancel\">cancel</a>\n            </div>\n        </div>\n    </div>\n</div>\n")
    ; __line = 34
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}