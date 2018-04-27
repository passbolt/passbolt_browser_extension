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
  , __lines = "<?\nvar success = true;\nif(this.errorsList.length > 0) {\n    success = false;\n}\n?>\n<div class=\"dialog-wrapper\">\n    <div class=\"dialog report\">\n        <div class=\"dialog-header\">\n            <? if (success) { ?>\n            <h2>Success!</h2>\n            <? } else { ?>\n            <h2>Something went wrong!</h2>\n            <? } ?>\n            <a class=\"dialog-close\" role=\"button\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <form class=\"tab-content ready selected\" id=\"js_rs_import_report\">\n                <div class=\"form-content\">\n                    <? if (success) { ?>\n                    <p><strong><?= this.successList.length ?> passwords have been imported successfully.</strong></p>\n                    <? } else { ?>\n                    <p class=\"error inline-error\">There was an issue when importing the passwords:</p>\n                    <? } ?>\n                    <? if (!success) { ?>\n                    <p>\n                        <strong><?= this.successList.length ?> out of <?= this.resources.length ?></strong> passwords have been imported.\n                    </p>\n                    <? } ?>\n                    <? if(this.tagsIntegration === true) { ?>\n                    <p>You can find the newly imported passwords under the tag: '<?= this.importTag ?>'.</p>\n                    <? } ?>\n                    <? if (!success) { ?>\n                    <div class=\"accordion error-details closed\">\n                        <div class=\"accordion-header\">\n                            <a role=\"link\">Errors details</a>\n                        </div>\n                        <div class=\"accordion-content hidden\" style=\"display: none;\">\n                            <div class=\"input text\">\n                                <label for=\"js_field_debug\" class=\"visuallyhidden\">Errors details</label>\n                                <textarea id=\"js_field_debug\"><?= JSON.stringify(this.errorsList, null, 4); ?></textarea>\n                            </div>\n                        </div>\n                    </div>\n                    <? } ?>\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Ok\" type=\"submit\">\n                </div>\n            </form>\n        </div>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/import/importPasswordsReportDialog.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; 
var success = true;
if(this.errorsList.length > 0) {
    success = false;
}

    ; __line = 6
    ; __append("\n<div class=\"dialog-wrapper\">\n    <div class=\"dialog report\">\n        <div class=\"dialog-header\">\n            ")
    ; __line = 10
    ;  if (success) { 
    ; __append("\n            <h2>Success!</h2>\n            ")
    ; __line = 12
    ;  } else { 
    ; __append("\n            <h2>Something went wrong!</h2>\n            ")
    ; __line = 14
    ;  } 
    ; __append("\n            <a class=\"dialog-close\" role=\"button\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <form class=\"tab-content ready selected\" id=\"js_rs_import_report\">\n                <div class=\"form-content\">\n                    ")
    ; __line = 24
    ;  if (success) { 
    ; __append("\n                    <p><strong>")
    ; __line = 25
    ; __append(escapeFn( this.successList.length ))
    ; __append(" passwords have been imported successfully.</strong></p>\n                    ")
    ; __line = 26
    ;  } else { 
    ; __append("\n                    <p class=\"error inline-error\">There was an issue when importing the passwords:</p>\n                    ")
    ; __line = 28
    ;  } 
    ; __append("\n                    ")
    ; __line = 29
    ;  if (!success) { 
    ; __append("\n                    <p>\n                        <strong>")
    ; __line = 31
    ; __append(escapeFn( this.successList.length ))
    ; __append(" out of ")
    ; __append(escapeFn( this.resources.length ))
    ; __append("</strong> passwords have been imported.\n                    </p>\n                    ")
    ; __line = 33
    ;  } 
    ; __append("\n                    ")
    ; __line = 34
    ;  if(this.tagsIntegration === true) { 
    ; __append("\n                    <p>You can find the newly imported passwords under the tag: '")
    ; __line = 35
    ; __append(escapeFn( this.importTag ))
    ; __append("'.</p>\n                    ")
    ; __line = 36
    ;  } 
    ; __append("\n                    ")
    ; __line = 37
    ;  if (!success) { 
    ; __append("\n                    <div class=\"accordion error-details closed\">\n                        <div class=\"accordion-header\">\n                            <a role=\"link\">Errors details</a>\n                        </div>\n                        <div class=\"accordion-content hidden\" style=\"display: none;\">\n                            <div class=\"input text\">\n                                <label for=\"js_field_debug\" class=\"visuallyhidden\">Errors details</label>\n                                <textarea id=\"js_field_debug\">")
    ; __line = 45
    ; __append(escapeFn( JSON.stringify(this.errorsList, null, 4) ))
    ; __append("</textarea>\n                            </div>\n                        </div>\n                    </div>\n                    ")
    ; __line = 49
    ;  } 
    ; __append("\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Ok\" type=\"submit\">\n                </div>\n            </form>\n        </div>\n    </div>\n</div>")
    ; __line = 57
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}