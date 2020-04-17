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
  , __lines = "<?\nlet resourcesSuccess = true;\nlet foldersSuccess = true;\nif(this.resources.errors.length > 0) {\n    resourcesSuccess = false;\n}\nif(this.foldersIntegration === true && this.folders.errors.length > 0) {\n    foldersSuccess = false;\n}\n?>\n<div class=\"dialog-wrapper\">\n    <div class=\"dialog report\">\n        <div class=\"dialog-header\">\n            <? if (resourcesSuccess && foldersSuccess) { ?>\n            <h2>Success!</h2>\n            <? } else { ?>\n            <h2>Something went wrong!</h2>\n            <? } ?>\n            <a class=\"dialog-close\" role=\"button\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <form class=\"tab-content ready selected\" id=\"js_rs_import_report\">\n                <div class=\"form-content\">\n                    <? if (resourcesSuccess) { ?>\n                    <p><strong><?= this.resources.created.length ?> passwords have been imported successfully.</strong></p>\n                    <? } else { ?>\n                    <p class=\"error inline-error\">There was an issue while importing passwords:</p>\n                    <? } ?>\n                    <? if (!resourcesSuccess) { ?>\n                    <p>\n                        <strong><?= this.resources.created.length ?> out of <?= (this.resources.created.length + this.resources.errors.length) ?></strong> passwords have been imported.\n                    </p>\n                    <? } ?>\n                    <? if(this.foldersIntegration === true) { ?>\n                        <? if (foldersSuccess) { ?>\n                        <p><strong><?= this.folders.created.length ?> folders have been imported successfully.</strong></p>\n                        <p>You can find the newly imported passwords under the top folder: '<?= this.importTag ?>'.</p>\n                        <? } else { ?>\n                        <p class=\"error inline-error\">There was an issue while importing folders:</p>\n                        <? } ?>\n                    <? } ?>\n                    <? if (!foldersSuccess) { ?>\n                    <p>\n                        <strong><?= this.folders.created.length ?> out of <?= (this.folders.created.length + this.folders.errors.length) ?></strong> folders have been imported.\n                    </p>\n                    <? } ?>\n                    <? if (!resourcesSuccess || !foldersSuccess) { ?>\n                    <div class=\"accordion error-details closed\">\n                        <div class=\"accordion-header\">\n                            <a role=\"link\">Errors details</a>\n                        </div>\n                        <div class=\"accordion-content hidden\" style=\"display: none;\">\n                            <div class=\"input text\">\n                                <label for=\"js_field_debug\" class=\"visuallyhidden\">Errors details</label>\n                                <textarea id=\"js_field_debug\"><?= JSON.stringify(this.resources.errors, null, 4); ?><? if(this.foldersIntegration === true) { JSON.stringify(this.folders.errors, null, 4); } ?></textarea>\n                            </div>\n                        </div>\n                    </div>\n                    <? } ?>\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Ok\" type=\"submit\">\n                </div>\n            </form>\n        </div>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/import/importPasswordsReportDialog.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; 
let resourcesSuccess = true;
let foldersSuccess = true;
if(this.resources.errors.length > 0) {
    resourcesSuccess = false;
}
if(this.foldersIntegration === true && this.folders.errors.length > 0) {
    foldersSuccess = false;
}

    ; __line = 10
    ; __append("\n<div class=\"dialog-wrapper\">\n    <div class=\"dialog report\">\n        <div class=\"dialog-header\">\n            ")
    ; __line = 14
    ;  if (resourcesSuccess && foldersSuccess) { 
    ; __append("\n            <h2>Success!</h2>\n            ")
    ; __line = 16
    ;  } else { 
    ; __append("\n            <h2>Something went wrong!</h2>\n            ")
    ; __line = 18
    ;  } 
    ; __append("\n            <a class=\"dialog-close\" role=\"button\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <form class=\"tab-content ready selected\" id=\"js_rs_import_report\">\n                <div class=\"form-content\">\n                    ")
    ; __line = 28
    ;  if (resourcesSuccess) { 
    ; __append("\n                    <p><strong>")
    ; __line = 29
    ; __append(escapeFn( this.resources.created.length ))
    ; __append(" passwords have been imported successfully.</strong></p>\n                    ")
    ; __line = 30
    ;  } else { 
    ; __append("\n                    <p class=\"error inline-error\">There was an issue while importing passwords:</p>\n                    ")
    ; __line = 32
    ;  } 
    ; __append("\n                    ")
    ; __line = 33
    ;  if (!resourcesSuccess) { 
    ; __append("\n                    <p>\n                        <strong>")
    ; __line = 35
    ; __append(escapeFn( this.resources.created.length ))
    ; __append(" out of ")
    ; __append(escapeFn( (this.resources.created.length + this.resources.errors.length) ))
    ; __append("</strong> passwords have been imported.\n                    </p>\n                    ")
    ; __line = 37
    ;  } 
    ; __append("\n                    ")
    ; __line = 38
    ;  if(this.foldersIntegration === true) { 
    ; __append("\n                        ")
    ; __line = 39
    ;  if (foldersSuccess) { 
    ; __append("\n                        <p><strong>")
    ; __line = 40
    ; __append(escapeFn( this.folders.created.length ))
    ; __append(" folders have been imported successfully.</strong></p>\n                        <p>You can find the newly imported passwords under the top folder: '")
    ; __line = 41
    ; __append(escapeFn( this.importTag ))
    ; __append("'.</p>\n                        ")
    ; __line = 42
    ;  } else { 
    ; __append("\n                        <p class=\"error inline-error\">There was an issue while importing folders:</p>\n                        ")
    ; __line = 44
    ;  } 
    ; __append("\n                    ")
    ; __line = 45
    ;  } 
    ; __append("\n                    ")
    ; __line = 46
    ;  if (!foldersSuccess) { 
    ; __append("\n                    <p>\n                        <strong>")
    ; __line = 48
    ; __append(escapeFn( this.folders.created.length ))
    ; __append(" out of ")
    ; __append(escapeFn( (this.folders.created.length + this.folders.errors.length) ))
    ; __append("</strong> folders have been imported.\n                    </p>\n                    ")
    ; __line = 50
    ;  } 
    ; __append("\n                    ")
    ; __line = 51
    ;  if (!resourcesSuccess || !foldersSuccess) { 
    ; __append("\n                    <div class=\"accordion error-details closed\">\n                        <div class=\"accordion-header\">\n                            <a role=\"link\">Errors details</a>\n                        </div>\n                        <div class=\"accordion-content hidden\" style=\"display: none;\">\n                            <div class=\"input text\">\n                                <label for=\"js_field_debug\" class=\"visuallyhidden\">Errors details</label>\n                                <textarea id=\"js_field_debug\">")
    ; __line = 59
    ; __append(escapeFn( JSON.stringify(this.resources.errors, null, 4) ))
    ;  if(this.foldersIntegration === true) { JSON.stringify(this.folders.errors, null, 4); } 
    ; __append("</textarea>\n                            </div>\n                        </div>\n                    </div>\n                    ")
    ; __line = 63
    ;  } 
    ; __append("\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Ok\" type=\"submit\">\n                </div>\n            </form>\n        </div>\n    </div>\n</div>")
    ; __line = 71
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/import/importPasswordsReportDialog.ejs

}