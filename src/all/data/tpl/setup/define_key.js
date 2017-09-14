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
  , __lines = "<div class=\"col10 last feedback\">\n    <p class=\"message error hidden\" id=\"js_main_error_feedback\"></p>\n</div>\n<!-- left collumn -->\n<div class=\"col6\">\n    <h3>Create a new key</h3>\n    <div class=\"input text required disabled\">\n        <label for=\"OwnerName\">Owner Name</label>\n        <input name=\"data[Owner][name]\" class=\"required fluid\" id=\"OwnerName\" required=\"required\" type=\"text\" disabled=\"disabled\" value=\"<?= firstName ?> <?= lastName ?>\">\n    </div>\n    <div class=\"input text required disabled\">\n        <label for=\"OwnerEmail\">Owner Email</label>\n        <input name=\"data[Owner][email]\" class=\"required fluid\" id=\"OwnerEmail\" required=\"required\" type=\"text\" disabled=\"disabled\" value=\"<?= username ?>\">\n    </div>\n    <div class=\"input text\">\n        <label for=\"KeyComment\">Comment</label>\n        <input name=\"data[Key][comment]\" class=\"required fluid\" id=\"KeyComment\" required=\"required\" type=\"text\" placeholder=\"add a comment (optional)\" value=\"<?= comment ?>\">\n    </div>\n</div>\n\n<!-- right collumn -->\n<div class=\"col4 last\">\n    <h3>Advanced settings</h3>\n    <div class=\"input select required\">\n        <label for=\"KeyType\">Key Type</label>\n        <select name=\"data[Key][type]\" id=\"KeyType\" disabled=\"disabled\" class=\"fluid\">\n            <option value=\"RSA-DSA\" >RSA and DSA (default)</option>\n            <option value=\"DSA-EL\" >DSA and Elgamal</option>\n        </select>\n    </div>\n    <div class=\"input select required\">\n        <label for=\"KeyLength\">Key Length</label>\n        <select name=\"data[Key][length]\" id=\"KeyLength\" disabled=\"disabled\" class=\"fluid\">\n            <option value=\"1024\" >1024</option>\n            <option value=\"2048\" >2048</option>\n            <option value=\"3076\" >3076</option>\n        </select>\n    </div>\n\n    <div class=\"input date\">\n        <label for=\"KeyExpire\">Key Expire</label>\n        <input name=\"data[Key][expire]\" class=\"required fluid\" id=\"KeyExpire\" disabled=\"disabled\" required=\"required\" placeholder=\"dd/mm/yyyy\" type=\"text\">\n        <span class=\"input-addon\"><i class=\"fa fa-calendar fa-fw\"></i></span>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/setup/define_key.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"col10 last feedback\">\n    <p class=\"message error hidden\" id=\"js_main_error_feedback\"></p>\n</div>\n<!-- left collumn -->\n<div class=\"col6\">\n    <h3>Create a new key</h3>\n    <div class=\"input text required disabled\">\n        <label for=\"OwnerName\">Owner Name</label>\n        <input name=\"data[Owner][name]\" class=\"required fluid\" id=\"OwnerName\" required=\"required\" type=\"text\" disabled=\"disabled\" value=\"")
    ; __line = 9
    ; __append(escapeFn( firstName ))
    ; __append(" ")
    ; __append(escapeFn( lastName ))
    ; __append("\">\n    </div>\n    <div class=\"input text required disabled\">\n        <label for=\"OwnerEmail\">Owner Email</label>\n        <input name=\"data[Owner][email]\" class=\"required fluid\" id=\"OwnerEmail\" required=\"required\" type=\"text\" disabled=\"disabled\" value=\"")
    ; __line = 13
    ; __append(escapeFn( username ))
    ; __append("\">\n    </div>\n    <div class=\"input text\">\n        <label for=\"KeyComment\">Comment</label>\n        <input name=\"data[Key][comment]\" class=\"required fluid\" id=\"KeyComment\" required=\"required\" type=\"text\" placeholder=\"add a comment (optional)\" value=\"")
    ; __line = 17
    ; __append(escapeFn( comment ))
    ; __append("\">\n    </div>\n</div>\n\n<!-- right collumn -->\n<div class=\"col4 last\">\n    <h3>Advanced settings</h3>\n    <div class=\"input select required\">\n        <label for=\"KeyType\">Key Type</label>\n        <select name=\"data[Key][type]\" id=\"KeyType\" disabled=\"disabled\" class=\"fluid\">\n            <option value=\"RSA-DSA\" >RSA and DSA (default)</option>\n            <option value=\"DSA-EL\" >DSA and Elgamal</option>\n        </select>\n    </div>\n    <div class=\"input select required\">\n        <label for=\"KeyLength\">Key Length</label>\n        <select name=\"data[Key][length]\" id=\"KeyLength\" disabled=\"disabled\" class=\"fluid\">\n            <option value=\"1024\" >1024</option>\n            <option value=\"2048\" >2048</option>\n            <option value=\"3076\" >3076</option>\n        </select>\n    </div>\n\n    <div class=\"input date\">\n        <label for=\"KeyExpire\">Key Expire</label>\n        <input name=\"data[Key][expire]\" class=\"required fluid\" id=\"KeyExpire\" disabled=\"disabled\" required=\"required\" placeholder=\"dd/mm/yyyy\" type=\"text\">\n        <span class=\"input-addon\"><i class=\"fa fa-calendar fa-fw\"></i></span>\n    </div>\n</div>")
    ; __line = 45
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}