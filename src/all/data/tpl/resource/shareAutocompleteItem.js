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
  , __lines = "<li id=\"<%= id %>\">\n    <div class=\"row\">\n        <div class=\"main-cell-wrapper\">\n            <div class=\"main-cell\">\n                <a>\n                    <div class=\"avatar\">\n                        <img src=\"<%= thumbnail_url %>\"/>\n                    </div>\n                    <div class=\"<%= cssClass %>\">\n                        <span class=\"name\"><%= label %></span>\n                        <span class=\"details\" title=\"<%= secondaryLabel %>\"><%= secondaryLabel %></span>\n                    </div>\n                </a>\n            </div>\n        </div>\n    </div>\n</li>\n"
  , __filename = "src/all/data/ejs/resource/shareAutocompleteItem.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<li id=\"")
    ; __append(escapeFn( id ))
    ; __append("\">\n    <div class=\"row\">\n        <div class=\"main-cell-wrapper\">\n            <div class=\"main-cell\">\n                <a>\n                    <div class=\"avatar\">\n                        <img src=\"")
    ; __line = 7
    ; __append(escapeFn( thumbnail_url ))
    ; __append("\"/>\n                    </div>\n                    <div class=\"")
    ; __line = 9
    ; __append(escapeFn( cssClass ))
    ; __append("\">\n                        <span class=\"name\">")
    ; __line = 10
    ; __append(escapeFn( label ))
    ; __append("</span>\n                        <span class=\"details\" title=\"")
    ; __line = 11
    ; __append(escapeFn( secondaryLabel ))
    ; __append("\">")
    ; __append(escapeFn( secondaryLabel ))
    ; __append("</span>\n                    </div>\n                </a>\n            </div>\n        </div>\n    </div>\n</li>\n")
    ; __line = 18
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}