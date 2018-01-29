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
  , __lines = "<ul>\n<? for (var i in menuSteps) { ?>\n    <?\n      var menuClass = 'disabled';\n      switch (menuSteps[i].state) {\n        case 'past':\n          menuClass = 'past';\n          break;\n        case 'current':\n          menuClass = 'selected';\n          break;\n      }\n    ?>\n    <li class=\"<?= menuClass ?>\">\n        <? if (menuClass == \"selected\" || menuClass == \"past\") { ?>\n        <a><?= steps[menuSteps[i].stepId].label ?></a>\n        <? } else { ?>\n        <?= steps[menuSteps[i].stepId].label ?>\n        <? } ?>\n    </li>\n<? } ?>\n</ul>\n"
  , __filename = "src/all/data/ejs/setup/menu.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<ul>\n")
    ; __line = 2
    ;  for (var i in menuSteps) { 
    ; __append("\n    ")
    ; __line = 3
    ; 
      var menuClass = 'disabled';
      switch (menuSteps[i].state) {
        case 'past':
          menuClass = 'past';
          break;
        case 'current':
          menuClass = 'selected';
          break;
      }
    
    ; __line = 13
    ; __append("\n    <li class=\"")
    ; __line = 14
    ; __append(escapeFn( menuClass ))
    ; __append("\">\n        ")
    ; __line = 15
    ;  if (menuClass == "selected" || menuClass == "past") { 
    ; __append("\n        <a>")
    ; __line = 16
    ; __append(escapeFn( steps[menuSteps[i].stepId].label ))
    ; __append("</a>\n        ")
    ; __line = 17
    ;  } else { 
    ; __append("\n        ")
    ; __line = 18
    ; __append(escapeFn( steps[menuSteps[i].stepId].label ))
    ; __append("\n        ")
    ; __line = 19
    ;  } 
    ; __append("\n    </li>\n")
    ; __line = 21
    ;  } 
    ; __append("\n</ul>\n")
    ; __line = 23
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}