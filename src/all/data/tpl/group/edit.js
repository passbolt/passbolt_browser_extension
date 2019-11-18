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
  , __lines = "<div class=\"form-content user-add permission-add\">\n    <div class=\"input text autocomplete\">\n        <label for=\"js_group_edit_form_auto_cplt\">Add people</label>\n        <input maxlength=\"255\" id=\"js_group_edit_form_auto_cplt\" placeholder=\"start typing a person name\" autocomplete=\"off\" type=\"text\">\n        <div class=\"security-token\"></div>\n    </div>\n    <div class=\"input blank\">\n        <div id=\"js_group_edit_form_feedback\" class=\"message\"></div>\n    </div>\n</div>\n"
  , __filename = "src/all/data/ejs/group/edit.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<div class=\"form-content user-add permission-add\">\n    <div class=\"input text autocomplete\">\n        <label for=\"js_group_edit_form_auto_cplt\">Add people</label>\n        <input maxlength=\"255\" id=\"js_group_edit_form_auto_cplt\" placeholder=\"start typing a person name\" autocomplete=\"off\" type=\"text\">\n        <div class=\"security-token\"></div>\n    </div>\n    <div class=\"input blank\">\n        <div id=\"js_group_edit_form_feedback\" class=\"message\"></div>\n    </div>\n</div>\n")
    ; __line = 11
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/group/edit.ejs

}