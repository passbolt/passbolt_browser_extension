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
  , __lines = "<?\nconst hasFolders = this.options.hasFoldersPlugin && this.options.importFolders;\nconst hasTags = this.options.hasTagsPlugin && this.options.importTags;\nconst resourcesHasErrors = this.resources && this.resources.errors && this.resources.errors.length > 0;\nconst foldersHasErrors = hasFolders && this.folders && this.folders.errors && this.folders.errors.length > 0;\nconst hasErrors = resourcesHasErrors || foldersHasErrors;\n?>\n<div class=\"dialog-wrapper\">\n    <div class=\"dialog report\">\n        <div class=\"dialog-header\">\n            <? if (!hasErrors) { ?>\n            <h2>Success!</h2>\n            <? } else { ?>\n            <h2>Something went wrong!</h2>\n            <? } ?>\n            <a class=\"dialog-close\" role=\"button\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <form class=\"tab-content ready selected\" id=\"js_rs_import_report\">\n                <div class=\"form-content\">\n                    <? if (!resourcesHasErrors) { ?>\n                    <p><strong><?= this.resources && this.resources.created ? this.resources.created.length : 'No'  ?> passwords have been imported successfully.</strong></p>\n                    <? } else { ?>\n                    <p class=\"error inline-error\">There was an issue while importing passwords:</p>\n                    <p>\n                        <strong><?= this.resources.created.length ?> out of <?= (this.resources.created.length + this.resources.errors.length) ?></strong> passwords have been imported.\n                    </p>\n                    <? } ?>\n                    <? if(hasFolders) { ?>\n                        <? if (!foldersHasErrors) { ?>\n                        <p><strong><?= this.folders && this.folders.created ? this.folders.created.length : 'No' ?> folders have been imported successfully.</strong></p>\n                        <p>You can find the newly imported passwords under the top folder: '<?= this.importTag ?>'.</p>\n                        <? } else { ?>\n                        <p class=\"error inline-error\">There was an issue while importing folders:</p>\n                        <p>\n                            <strong><?= this.folders.created.length ?> out of <?= (this.folders.created.length + this.folders.errors.length) ?></strong> folders have been imported.\n                        </p>\n                        <? } ?>\n                    <? } ?>\n                    <? if (hasErrors) { ?>\n                    <div class=\"accordion error-details closed\">\n                        <div class=\"accordion-header\">\n                            <a role=\"link\">Errors details</a>\n                        </div>\n                        <div class=\"accordion-content hidden\" style=\"display: none;\">\n                            <div class=\"input text\">\n                                <label for=\"js_field_debug\" class=\"visuallyhidden\">Errors details</label>\n                                <textarea id=\"js_field_debug\"><?= JSON.stringify(this.resources.errors, null, 4); ?><? if(this.hasFoldersPlugin && this.foldersImport) { JSON.stringify(this.folders.errors, null, 4); } ?></textarea>\n                            </div>\n                        </div>\n                    </div>\n                    <? } ?>\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Ok\" type=\"submit\">\n                </div>\n            </form>\n        </div>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/import/importPasswordsReportDialog.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; 
const hasFolders = this.options.hasFoldersPlugin && this.options.importFolders;
const hasTags = this.options.hasTagsPlugin && this.options.importTags;
const resourcesHasErrors = this.resources && this.resources.errors && this.resources.errors.length > 0;
const foldersHasErrors = hasFolders && this.folders && this.folders.errors && this.folders.errors.length > 0;
const hasErrors = resourcesHasErrors || foldersHasErrors;

    ; __line = 7
    ; __append("\n<div class=\"dialog-wrapper\">\n    <div class=\"dialog report\">\n        <div class=\"dialog-header\">\n            ")
    ; __line = 11
    ;  if (!hasErrors) { 
    ; __append("\n            <h2>Success!</h2>\n            ")
    ; __line = 13
    ;  } else { 
    ; __append("\n            <h2>Something went wrong!</h2>\n            ")
    ; __line = 15
    ;  } 
    ; __append("\n            <a class=\"dialog-close\" role=\"button\">\n                <i class=\"fa fa-close\"></i><span class=\"visuallyhidden\">close</span>\n            </a>\n\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n\n            <form class=\"tab-content ready selected\" id=\"js_rs_import_report\">\n                <div class=\"form-content\">\n                    ")
    ; __line = 25
    ;  if (!resourcesHasErrors) { 
    ; __append("\n                    <p><strong>")
    ; __line = 26
    ; __append(escapeFn( this.resources && this.resources.created ? this.resources.created.length : 'No'  ))
    ; __append(" passwords have been imported successfully.</strong></p>\n                    ")
    ; __line = 27
    ;  } else { 
    ; __append("\n                    <p class=\"error inline-error\">There was an issue while importing passwords:</p>\n                    <p>\n                        <strong>")
    ; __line = 30
    ; __append(escapeFn( this.resources.created.length ))
    ; __append(" out of ")
    ; __append(escapeFn( (this.resources.created.length + this.resources.errors.length) ))
    ; __append("</strong> passwords have been imported.\n                    </p>\n                    ")
    ; __line = 32
    ;  } 
    ; __append("\n                    ")
    ; __line = 33
    ;  if(hasFolders) { 
    ; __append("\n                        ")
    ; __line = 34
    ;  if (!foldersHasErrors) { 
    ; __append("\n                        <p><strong>")
    ; __line = 35
    ; __append(escapeFn( this.folders && this.folders.created ? this.folders.created.length : 'No' ))
    ; __append(" folders have been imported successfully.</strong></p>\n                        <p>You can find the newly imported passwords under the top folder: '")
    ; __line = 36
    ; __append(escapeFn( this.importTag ))
    ; __append("'.</p>\n                        ")
    ; __line = 37
    ;  } else { 
    ; __append("\n                        <p class=\"error inline-error\">There was an issue while importing folders:</p>\n                        <p>\n                            <strong>")
    ; __line = 40
    ; __append(escapeFn( this.folders.created.length ))
    ; __append(" out of ")
    ; __append(escapeFn( (this.folders.created.length + this.folders.errors.length) ))
    ; __append("</strong> folders have been imported.\n                        </p>\n                        ")
    ; __line = 42
    ;  } 
    ; __append("\n                    ")
    ; __line = 43
    ;  } 
    ; __append("\n                    ")
    ; __line = 44
    ;  if (hasErrors) { 
    ; __append("\n                    <div class=\"accordion error-details closed\">\n                        <div class=\"accordion-header\">\n                            <a role=\"link\">Errors details</a>\n                        </div>\n                        <div class=\"accordion-content hidden\" style=\"display: none;\">\n                            <div class=\"input text\">\n                                <label for=\"js_field_debug\" class=\"visuallyhidden\">Errors details</label>\n                                <textarea id=\"js_field_debug\">")
    ; __line = 52
    ; __append(escapeFn( JSON.stringify(this.resources.errors, null, 4) ))
    ;  if(this.hasFoldersPlugin && this.foldersImport) { JSON.stringify(this.folders.errors, null, 4); } 
    ; __append("</textarea>\n                            </div>\n                        </div>\n                    </div>\n                    ")
    ; __line = 56
    ;  } 
    ; __append("\n                </div>\n                <div class=\"submit-wrapper clearfix\">\n                    <input class=\"button primary\" value=\"Ok\" type=\"submit\">\n                </div>\n            </form>\n        </div>\n    </div>\n</div>")
    ; __line = 64
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/import/importPasswordsReportDialog.ejs

}