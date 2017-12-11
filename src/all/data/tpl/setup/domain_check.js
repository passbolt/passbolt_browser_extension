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
  , __lines = "<div class=\"col7\">\n    <div class=\"plugin-check-wrapper\">\n        <h3>Plugin check</h3>\n        <div class=\"plugin-check <?= browserName ?> success\">\n            <p class=\"message\">Nice one! The plugin is installed and up to date. You are good to go!</p>\n        </div>\n    </div>\n    <div class=\"why-plugin-wrapper\">\n        <h3>Url Check</h3>\n        <p>\n            You are about to register the plugin to work with the following domain.\n            Please confirm that this is a domain managed by an organisation you trust:\n        </p>\n        <div class=\"feedback\">\n            <p class=\"message error hidden\" id=\"js_main_error_feedback\"></p>\n        </div>\n        <form>\n            <div class=\"input text domain disabled\">\n                <label for=\"js_setup_domain\">Domain</label>\n                <input type=\"text\" value=\"<?= domain ?>\" id=\"js_setup_domain\" disabled=\"disabled\" />\n            </div>\n            <div class=\"input text key-fingerprint disabled\">\n                <label for=\"js_setup_key_fingerprint\">Server Key</label>\n                <input name=\"key_fingerprint\" id=\"js_setup_key_fingerprint\" value=\"\" placeholder=\"Retrieving server key. Please wait...\" type=\"text\" value=\"\" disabled=\"disabled\"/>\n                <a class=\"more\" id=\"js_server_key_info\">More</a>\n                <div class=\"message error\"></div>\n            </div>\n            <div class=\"input checkbox\">\n                <input type=\"checkbox\" id=\"js_setup_domain_check\" value=\"legit\"/>\n                <label for=\"js_setup_domain_check\">I've checked, this domain name and the server key look legitimate.</label>\n            </div>\n        </form>\n    </div>\n</div>\n<div class=\"col5 last\">\n    <!--<div class=\"video-wrapper\">-->\n        <!--<iframe width=\"400\" height=\"300\" src=\"https://www.youtube.com/embed/u-vDLf7cmf0\" frameborder=\"0\" allowfullscreen></iframe>-->\n    <!--</div>-->\n</div>\n\n"
  , __filename = "src/all/data/ejs/setup/domain_check.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"col7\">\n    <div class=\"plugin-check-wrapper\">\n        <h3>Plugin check</h3>\n        <div class=\"plugin-check ")
    ; __line = 4
    ; __append(escapeFn( browserName ))
    ; __append(" success\">\n            <p class=\"message\">Nice one! The plugin is installed and up to date. You are good to go!</p>\n        </div>\n    </div>\n    <div class=\"why-plugin-wrapper\">\n        <h3>Url Check</h3>\n        <p>\n            You are about to register the plugin to work with the following domain.\n            Please confirm that this is a domain managed by an organisation you trust:\n        </p>\n        <div class=\"feedback\">\n            <p class=\"message error hidden\" id=\"js_main_error_feedback\"></p>\n        </div>\n        <form>\n            <div class=\"input text domain disabled\">\n                <label for=\"js_setup_domain\">Domain</label>\n                <input type=\"text\" value=\"")
    ; __line = 20
    ; __append(escapeFn( domain ))
    ; __append("\" id=\"js_setup_domain\" disabled=\"disabled\" />\n            </div>\n            <div class=\"input text key-fingerprint disabled\">\n                <label for=\"js_setup_key_fingerprint\">Server Key</label>\n                <input name=\"key_fingerprint\" id=\"js_setup_key_fingerprint\" value=\"\" placeholder=\"Retrieving server key. Please wait...\" type=\"text\" value=\"\" disabled=\"disabled\"/>\n                <a class=\"more\" id=\"js_server_key_info\">More</a>\n                <div class=\"message error\"></div>\n            </div>\n            <div class=\"input checkbox\">\n                <input type=\"checkbox\" id=\"js_setup_domain_check\" value=\"legit\"/>\n                <label for=\"js_setup_domain_check\">I've checked, this domain name and the server key look legitimate.</label>\n            </div>\n        </form>\n    </div>\n</div>\n<div class=\"col5 last\">\n    <!--<div class=\"video-wrapper\">-->\n        <!--<iframe width=\"400\" height=\"300\" src=\"https://www.youtube.com/embed/u-vDLf7cmf0\" frameborder=\"0\" allowfullscreen></iframe>-->\n    <!--</div>-->\n</div>\n\n")
    ; __line = 41
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}