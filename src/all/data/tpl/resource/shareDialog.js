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
  , __lines = "<div class=\"dialog-wrapper\">\n    <div class=\"dialog share-password-dialog\">\n        <div class=\"dialog-header\">\n<? if (bulk) { ?>\n            <h2>Share <?= resources.length ?> passwords <div class=\"more_details tooltip-alt\">\n                <i class=\"fa fa-info-circle\"></i>\n                <div class=\"tooltip-text right\">\n                    <?= resources.map(resource => resource.name).join(', '); ?>\n                </div>\n            </div></h2>\n<? } else { ?>\n            <h2>Share<span class=\"dialog-header-subtitle\"><?= resources[0].name ?></span></h2>\n<? } ?>\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js-dialog-content dialog-content\">\n\n<? if (!bulk) { ?>\n            <ul class=\"tabs-nav menu\">\n                <li id=\"js-share-go-to-edit\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a><span>Edit</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n                <li id=\"js-share-go-to-share\" class=\"\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a class=\"selected\"><span>Share</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n            </ul>\n\n            <div class=\"tab\">\n                <div class=\"tab-content\" style=\"display:block\">\n<? } ?>\n\n                    <div id=\"js-share-edit-list\" class=\"form-content permission-edit\">\n                        <ul class=\"permissions scroll\"></ul>\n                    </div>\n\n                    <div id=\"js-share-feedbacks\" class=\"feedbacks message hidden\"></div>\n\n<? if (isOwner) { ?>\n                    <div class=\"form-content permission-add\">\n                        <div class=\"input text autocomplete\">\n                            <label for=\"js-search-aros-input\">Share with people or groups</label>\n                            <input maxlength=\"255\" id=\"js-search-aros-input\" placeholder=\"enter one name or email\" autocomplete=\"off\" type=\"text\">\n                            <div class=\"security-token\"></div>\n                        </div>\n                        <div id=\"js-search-aro-autocomplete\" class=\"autocomplete-wrapper hidden\">\n                            <div class=\"autocomplete-content scroll\"></div>\n                        </div>\n                    </div>\n<? } ?>\n\n                    <div class=\"submit-wrapper clearfix\">\n                        <input id=\"js-share-save\" type=\"submit\" class=\"button disabled primary\" value=\"save\" disabled=\"disabled\"/>\n                        <a id=\"js-share-cancel\" class=\"cancel\">cancel</a>\n                    </div>\n                </div>\n\n<? if (!bulk) { ?>\n            </div>\n        </div>\n<? } ?>\n\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/resource/shareDialog.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"dialog-wrapper\">\n    <div class=\"dialog share-password-dialog\">\n        <div class=\"dialog-header\">\n")
    ; __line = 4
    ;  if (bulk) { 
    ; __append("\n            <h2>Share ")
    ; __line = 5
    ; __append(escapeFn( resources.length ))
    ; __append(" passwords <div class=\"more_details tooltip-alt\">\n                <i class=\"fa fa-info-circle\"></i>\n                <div class=\"tooltip-text right\">\n                    ")
    ; __line = 8
    ; __append(escapeFn( resources.map(resource => resource.name).join(', ') ))
    ; __append("\n                </div>\n            </div></h2>\n")
    ; __line = 11
    ;  } else { 
    ; __append("\n            <h2>Share<span class=\"dialog-header-subtitle\">")
    ; __line = 12
    ; __append(escapeFn( resources[0].name ))
    ; __append("</span></h2>\n")
    ; __line = 13
    ;  } 
    ; __append("\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js-dialog-content dialog-content\">\n\n")
    ; __line = 21
    ;  if (!bulk) { 
    ; __append("\n            <ul class=\"tabs-nav menu\">\n                <li id=\"js-share-go-to-edit\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a><span>Edit</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n                <li id=\"js-share-go-to-share\" class=\"\">\n                    <div class=\"row\">\n                        <div class=\"main-cell-wrapper\">\n                            <div class=\"main-cell\">\n                                <a class=\"selected\"><span>Share</span></a>\n                            </div>\n                        </div>\n                    </div>\n                </li>\n            </ul>\n\n            <div class=\"tab\">\n                <div class=\"tab-content\" style=\"display:block\">\n")
    ; __line = 45
    ;  } 
    ; __append("\n\n                    <div id=\"js-share-edit-list\" class=\"form-content permission-edit\">\n                        <ul class=\"permissions scroll\"></ul>\n                    </div>\n\n                    <div id=\"js-share-feedbacks\" class=\"feedbacks message hidden\"></div>\n\n")
    ; __line = 53
    ;  if (isOwner) { 
    ; __append("\n                    <div class=\"form-content permission-add\">\n                        <div class=\"input text autocomplete\">\n                            <label for=\"js-search-aros-input\">Share with people or groups</label>\n                            <input maxlength=\"255\" id=\"js-search-aros-input\" placeholder=\"enter one name or email\" autocomplete=\"off\" type=\"text\">\n                            <div class=\"security-token\"></div>\n                        </div>\n                        <div id=\"js-search-aro-autocomplete\" class=\"autocomplete-wrapper hidden\">\n                            <div class=\"autocomplete-content scroll\"></div>\n                        </div>\n                    </div>\n")
    ; __line = 64
    ;  } 
    ; __append("\n\n                    <div class=\"submit-wrapper clearfix\">\n                        <input id=\"js-share-save\" type=\"submit\" class=\"button disabled primary\" value=\"save\" disabled=\"disabled\"/>\n                        <a id=\"js-share-cancel\" class=\"cancel\">cancel</a>\n                    </div>\n                </div>\n\n")
    ; __line = 72
    ;  if (!bulk) { 
    ; __append("\n            </div>\n        </div>\n")
    ; __line = 75
    ;  } 
    ; __append("\n\n    </div>\n</div>\n")
    ; __line = 79
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}