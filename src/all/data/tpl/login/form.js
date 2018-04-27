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
  , __lines = "<div class=\"page login-form master-password \">\n    <div class=\"input text required\">\n        <label for=\"UserUsername\">Username</label>\n        <input name=\"data[User][username]\" class=\"required fluid\" maxlength=\"50\" type=\"text\" id=\"UserUsername\"\n               required=\"required\"\n               value=\"\" disabled=\"disabled\"/>\n    </div>\n    <div class=\"input text required\">\n        <label for=\"js_master_password\">Master password</label>\n        <input type=\"password\" placeholder=\"password\" id=\"js_master_password\">\n        <span class=\"security-token\"></span>\n        <div id='loginMessage' class=\"message helptext\">Please enter your secret key passphrase</div>\n    </div>\n    <div class=\"input checkbox hidden\">\n        <input type=\"checkbox\" name=\"remember-me\" id=\"rememberMe\">\n        <label for=\"remember_me\">Remember passphrase until I log out</label>\n    </div>\n    <div class=\"submit-wrapper clearfix\">\n        <a id='loginSubmit' class=\"button primary big\">login</a>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/login/form.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"page login-form master-password \">\n    <div class=\"input text required\">\n        <label for=\"UserUsername\">Username</label>\n        <input name=\"data[User][username]\" class=\"required fluid\" maxlength=\"50\" type=\"text\" id=\"UserUsername\"\n               required=\"required\"\n               value=\"\" disabled=\"disabled\"/>\n    </div>\n    <div class=\"input text required\">\n        <label for=\"js_master_password\">Master password</label>\n        <input type=\"password\" placeholder=\"password\" id=\"js_master_password\">\n        <span class=\"security-token\"></span>\n        <div id='loginMessage' class=\"message helptext\">Please enter your secret key passphrase</div>\n    </div>\n    <div class=\"input checkbox hidden\">\n        <input type=\"checkbox\" name=\"remember-me\" id=\"rememberMe\">\n        <label for=\"remember_me\">Remember passphrase until I log out</label>\n    </div>\n    <div class=\"submit-wrapper clearfix\">\n        <a id='loginSubmit' class=\"button primary big\">login</a>\n    </div>\n</div>")
    ; __line = 21
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}