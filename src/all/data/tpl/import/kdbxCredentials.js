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
  , __lines = "<div class=\"dialog-wrapper\" id=\"kdbx-credentials\">\n    <div class=\"dialog import\">\n        <div class=\"dialog-header\">\n            <h2><?= this.title ?></h2>\n            <a role=\"button\" class=\"dialog-close\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n            <form id=\"js_rs_import\">\n                <div class=\"form-content\">\n                    <div class=\"input-password-wrapper\">\n                        <div class=\"input password\">\n                            <label>Keepass password</label>\n                            <input name=\"passbolt.model.Resource.passphrase\" maxlength=\"50\" id=\"js_field_passphrase\" placeholder=\"password\" type=\"password\">\n                            <input class=\"required hidden\" maxlength=\"50\" type=\"text\" id=\"js_field_password_clear\" >\n                        </div>\n                        <ul class=\"actions inline\">\n                            <li>\n                                <a role=\"button\" id=\"js_secret_view\" class=\"button toggle\">\n                                    <i class=\"fa fa-eye fa-fw fa-lg\"></i>\n                                    <span class=\"visuallyhidden\">view</span>\n                                </a>\n                            </li>\n                        </ul>\n                    </div>\n                    <div class=\"input text\">\n                        <label for=\"js_field_key_file\">Keepass key file (optional)</label>\n                        <input class=\"jfilestyle\" name=\"passbolt.model.Resource.uri\" id=\"js_field_key_file\" type=\"file\" data-text=\"Choose a file\" data-placeholder=\"No key file selected\">\n                        <div id=\"js_field_key_file_feedback\" class=\"message\"></div>\n                    </div>\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"<?= this.ctaLabel ?>\" type=\"submit\">\n                    <a role=\"link\" class=\"js-dialog-cancel cancel\">cancel</a>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/import/kdbxCredentials.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"dialog-wrapper\" id=\"kdbx-credentials\">\n    <div class=\"dialog import\">\n        <div class=\"dialog-header\">\n            <h2>")
    ; __line = 4
    ; __append(escapeFn( this.title ))
    ; __append("</h2>\n            <a role=\"button\" class=\"dialog-close\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n            <form id=\"js_rs_import\">\n                <div class=\"form-content\">\n                    <div class=\"input-password-wrapper\">\n                        <div class=\"input password\">\n                            <label>Keepass password</label>\n                            <input name=\"passbolt.model.Resource.passphrase\" maxlength=\"50\" id=\"js_field_passphrase\" placeholder=\"password\" type=\"password\">\n                            <input class=\"required hidden\" maxlength=\"50\" type=\"text\" id=\"js_field_password_clear\" >\n                        </div>\n                        <ul class=\"actions inline\">\n                            <li>\n                                <a role=\"button\" id=\"js_secret_view\" class=\"button toggle\">\n                                    <i class=\"fa fa-eye fa-fw fa-lg\"></i>\n                                    <span class=\"visuallyhidden\">view</span>\n                                </a>\n                            </li>\n                        </ul>\n                    </div>\n                    <div class=\"input text\">\n                        <label for=\"js_field_key_file\">Keepass key file (optional)</label>\n                        <input class=\"jfilestyle\" name=\"passbolt.model.Resource.uri\" id=\"js_field_key_file\" type=\"file\" data-text=\"Choose a file\" data-placeholder=\"No key file selected\">\n                        <div id=\"js_field_key_file_feedback\" class=\"message\"></div>\n                    </div>\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"")
    ; __line = 34
    ; __append(escapeFn( this.ctaLabel ))
    ; __append("\" type=\"submit\">\n                    <a role=\"link\" class=\"js-dialog-cancel cancel\">cancel</a>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>")
    ; __line = 40
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}