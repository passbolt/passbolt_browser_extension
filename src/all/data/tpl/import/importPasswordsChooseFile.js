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
  , __lines = "<div class=\"dialog-wrapper\" id=\"choose-file\">\n    <div class=\"dialog import\">\n        <div class=\"dialog-header\">\n            <h2>Import passwords</h2>\n            <a href=\"../demo/LU_passwords.php\" class=\"dialog-close\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"dialog-content\">\n            <form id=\"js_rs_import\">\n                <div class=\"form-content\">\n                    <div class=\"input text required\">\n                        <label for=\"js_field_file\">Select a file to import (csv or kdbx)</label>\n                        <input name=\"passbolt.model.Import.file\"\n                               class=\"jfilestyle\"\n                               id=\"js_field_file\" placeholder=\"name\" type=\"file\"\n                               data-text=\"Choose a file\" data-placeholder=\"No file selected\">\n                        <div id=\"js_field_file_feedback\" class=\"message ready\"></div>\n                    </div>\n                    <div class=\"input text\">\n                        <input type=\"checkbox\" name=\"passbolt.model.Import.category_as_tags\"\n                               id=\"js_field_category_as_tags\" checked=\"checked\"> <label>Import categories as tags</label>\n                    </div>\n\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Import\" type=\"submit\">\n                    <a href=\"#\" class=\"js-dialog-cancel cancel\">cancel</a>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/import/importPasswordsChooseFile.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"dialog-wrapper\" id=\"choose-file\">\n    <div class=\"dialog import\">\n        <div class=\"dialog-header\">\n            <h2>Import passwords</h2>\n            <a href=\"../demo/LU_passwords.php\" class=\"dialog-close\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"dialog-content\">\n            <form id=\"js_rs_import\">\n                <div class=\"form-content\">\n                    <div class=\"input text required\">\n                        <label for=\"js_field_file\">Select a file to import (csv or kdbx)</label>\n                        <input name=\"passbolt.model.Import.file\"\n                               class=\"jfilestyle\"\n                               id=\"js_field_file\" placeholder=\"name\" type=\"file\"\n                               data-text=\"Choose a file\" data-placeholder=\"No file selected\">\n                        <div id=\"js_field_file_feedback\" class=\"message ready\"></div>\n                    </div>\n                    <div class=\"input text\">\n                        <input type=\"checkbox\" name=\"passbolt.model.Import.category_as_tags\"\n                               id=\"js_field_category_as_tags\" checked=\"checked\"> <label>Import categories as tags</label>\n                    </div>\n\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Import\" type=\"submit\">\n                    <a href=\"#\" class=\"js-dialog-cancel cancel\">cancel</a>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>")
    ; __line = 34
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}