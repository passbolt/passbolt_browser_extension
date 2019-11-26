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
  , __lines = "<div class=\"dialog-wrapper\">\n    <div class=\"dialog share-password-dialog\">\n        <div class=\"dialog-header\">\n<? if (resourcesCount > 1) { ?>\n            <h2><span>Share <?= resourcesCount ?> passwords </span></h2>\n<? } else { ?>\n            <h2>Share<span class=\"dialog-header-subtitle\"></span></h2>\n<? } ?>\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js-dialog-content dialog-content\">\n\n<? if (resourcesCount == 1) { ?>\n            <ul class=\"tabs-nav menu\">\n                <li id=\"js-share-go-to-edit\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a><span>Edit</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n                <li id=\"js-share-go-to-share\" class=\"\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a class=\"selected\"><span>Share</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n            </ul>\n\n            <div class=\"tab\">\n                <div class=\"tab-content\" style=\"display:block\">\n<? } ?>\n\n                    <div class=\"processing-wrapper\">\n                        <span class=\"processing-text\">Retrieving permissions</span>\n                    </div>\n\n                    <div id=\"js-share-edit-list\" class=\"form-content permission-edit\">\n                        <ul class=\"permissions scroll\"></ul>\n                    </div>\n\n                    <div id=\"js-share-feedbacks\" class=\"feedbacks message hidden\"></div>\n\n                    <div id=\"js-share-form-content-add\" class=\"form-content permission-add hidden\">\n                        <div class=\"input text autocomplete\">\n                            <label for=\"js-search-aros-input\">Share with people or groups</label>\n                            <input maxlength=\"255\" id=\"js-search-aros-input\" placeholder=\"enter one name or email\" autocomplete=\"off\" type=\"text\">\n                            <div class=\"security-token\"></div>\n                        </div>\n                        <div id=\"js-search-aro-autocomplete\" class=\"autocomplete-wrapper hidden\">\n                            <div class=\"autocomplete-content scroll\"></div>\n                        </div>\n                    </div>\n\n                    <div class=\"submit-wrapper clearfix\">\n                        <input id=\"js-share-save\" type=\"submit\" class=\"button disabled primary\" value=\"save\" disabled=\"disabled\"/>\n                        <a id=\"js-share-cancel\" class=\"cancel\">cancel</a>\n                    </div>\n                </div>\n\n<? if (resourcesCount == 1) { ?>\n            </div>\n        </div>\n<? } ?>\n\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/resource/shareDialog.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<div class=\"dialog-wrapper\">\n    <div class=\"dialog share-password-dialog\">\n        <div class=\"dialog-header\">\n")
    ; __line = 4
    ;  if (resourcesCount > 1) { 
    ; __append("\n            <h2><span>Share ")
    ; __line = 5
    ; __append(escapeFn( resourcesCount ))
    ; __append(" passwords </span></h2>\n")
    ; __line = 6
    ;  } else { 
    ; __append("\n            <h2>Share<span class=\"dialog-header-subtitle\"></span></h2>\n")
    ; __line = 8
    ;  } 
    ; __append("\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js-dialog-content dialog-content\">\n\n")
    ; __line = 16
    ;  if (resourcesCount == 1) { 
    ; __append("\n            <ul class=\"tabs-nav menu\">\n                <li id=\"js-share-go-to-edit\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a><span>Edit</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n                <li id=\"js-share-go-to-share\" class=\"\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a class=\"selected\"><span>Share</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n            </ul>\n\n            <div class=\"tab\">\n                <div class=\"tab-content\" style=\"display:block\">\n")
    ; __line = 40
    ;  } 
    ; __append("\n\n                    <div class=\"processing-wrapper\">\n                        <span class=\"processing-text\">Retrieving permissions</span>\n                    </div>\n\n                    <div id=\"js-share-edit-list\" class=\"form-content permission-edit\">\n                        <ul class=\"permissions scroll\"></ul>\n                    </div>\n\n                    <div id=\"js-share-feedbacks\" class=\"feedbacks message hidden\"></div>\n\n                    <div id=\"js-share-form-content-add\" class=\"form-content permission-add hidden\">\n                        <div class=\"input text autocomplete\">\n                            <label for=\"js-search-aros-input\">Share with people or groups</label>\n                            <input maxlength=\"255\" id=\"js-search-aros-input\" placeholder=\"enter one name or email\" autocomplete=\"off\" type=\"text\">\n                            <div class=\"security-token\"></div>\n                        </div>\n                        <div id=\"js-search-aro-autocomplete\" class=\"autocomplete-wrapper hidden\">\n                            <div class=\"autocomplete-content scroll\"></div>\n                        </div>\n                    </div>\n\n                    <div class=\"submit-wrapper clearfix\">\n                        <input id=\"js-share-save\" type=\"submit\" class=\"button disabled primary\" value=\"save\" disabled=\"disabled\"/>\n                        <a id=\"js-share-cancel\" class=\"cancel\">cancel</a>\n                    </div>\n                </div>\n\n")
    ; __line = 69
    ;  if (resourcesCount == 1) { 
    ; __append("\n            </div>\n        </div>\n")
    ; __line = 72
    ;  } 
    ; __append("\n\n    </div>\n</div>\n")
    ; __line = 76
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/resource/shareDialog.ejs

}