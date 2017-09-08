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
  , __lines = "<div class=\"dialog-wrapper\">\n    <div class=\"dialog medium key-info\" id=\"dialog-server-key-info\">\n        <div class=\"dialog-header\">\n            <h2>Please verify the server key</h2>\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n            <div class=\"form-content\">\n                <p>\n                    <strong>\n                        Check that the details of the GPG key below are valid. Do not hesitate to contact your support person in case of doubt!\n                    </strong>\n                </p>\n                <table>\n                    <tbody>\n                    <tr class=\"owner-name\">\n                        <td class=\"label\">Owner Name</td>\n                        <td class=\"value\"><?= userIds[0].name ?></td>\n                    </tr>\n                    <tr class=\"owner-email\">\n                        <td class=\"label\">Owner Email</td>\n                        <td class=\"value\"><?= userIds[0].email ?></td>\n                    </tr>\n                    <tr class=\"keyid\">\n                        <td class=\"label\">Key ID</td>\n                        <td class=\"value\">\n                            <? var kid = keyId.toUpperCase(); ?>\n                            <?= kid ?>\n                        </td>\n                    </tr>\n                    <tr class=\"fingerprint\">\n                        <td class=\"label\">Fingerprint</td>\n                        <td class=\"value\">\n                            <? var fgprt = fingerprint.toUpperCase(); ?>\n                            <?= fgprt ?>\n                        </td>\n                    </tr>\n                    <tr class=\"created\">\n                        <td class=\"label\">Created</td>\n                        <td class=\"value\">\n                            <?\n                            var dateCreated = new Date(created);\n                            dateCreated = dateCreated.toDateString() + ' ' + dateCreated.toLocaleTimeString();\n                            ?>\n                            <?= dateCreated ?>\n                        </td>\n                    </tr>\n                    <tr class=\"expires\">\n                        <td class=\"label\">Expires</td>\n                        <td class=\"value\">\n                            <?\n                            var dateExpires = new Date(expires);\n                            dateExpires = dateExpires.toDateString() + ' ' + dateExpires.toLocaleTimeString();\n                            ?>\n                            <?= dateExpires ?>\n                        </td>\n                    </tr>\n                    <tr class=\"length\">\n                        <td class=\"label\">Length</td>\n                        <td class=\"value\"><?= length ?></td>\n                    </tr>\n                    <tr class=\"algorithm\">\n                        <td class=\"label\">Algorithm</td>\n                        <td class=\"value\">\n                            <? var algo = algorithm.toUpperCase(); ?>\n                            <?= algo ?>\n                        </td>\n                    </tr>\n                    </tbody>\n                </table>\n            </div>\n\n            <div class=\"submit-wrapper clearfix\">\n                <input type=\"submit\" value=\"OK\" class=\"button primary\" id=\"key-info-ok\">\n                <!-- <a class=\"button\" id=\"js_keyinfo_help\">Help!</a> -->\n            </div>\n        </div>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/setup/dialog_key_info.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<div class=\"dialog-wrapper\">\n    <div class=\"dialog medium key-info\" id=\"dialog-server-key-info\">\n        <div class=\"dialog-header\">\n            <h2>Please verify the server key</h2>\n            <a class=\"dialog-close js-dialog-close\">\n                <i class=\"fa fa-close\"></i>\n                <span class=\"visuallyhidden\">close</span>\n            </a>\n        </div>\n        <div class=\"js_dialog_content dialog-content\">\n            <div class=\"form-content\">\n                <p>\n                    <strong>\n                        Check that the details of the GPG key below are valid. Do not hesitate to contact your support person in case of doubt!\n                    </strong>\n                </p>\n                <table>\n                    <tbody>\n                    <tr class=\"owner-name\">\n                        <td class=\"label\">Owner Name</td>\n                        <td class=\"value\">")
    ; __line = 21
    ; __append(escapeFn( userIds[0].name ))
    ; __append("</td>\n                    </tr>\n                    <tr class=\"owner-email\">\n                        <td class=\"label\">Owner Email</td>\n                        <td class=\"value\">")
    ; __line = 25
    ; __append(escapeFn( userIds[0].email ))
    ; __append("</td>\n                    </tr>\n                    <tr class=\"keyid\">\n                        <td class=\"label\">Key ID</td>\n                        <td class=\"value\">\n                            ")
    ; __line = 30
    ;  var kid = keyId.toUpperCase(); 
    ; __append("\n                            ")
    ; __line = 31
    ; __append(escapeFn( kid ))
    ; __append("\n                        </td>\n                    </tr>\n                    <tr class=\"fingerprint\">\n                        <td class=\"label\">Fingerprint</td>\n                        <td class=\"value\">\n                            ")
    ; __line = 37
    ;  var fgprt = fingerprint.toUpperCase(); 
    ; __append("\n                            ")
    ; __line = 38
    ; __append(escapeFn( fgprt ))
    ; __append("\n                        </td>\n                    </tr>\n                    <tr class=\"created\">\n                        <td class=\"label\">Created</td>\n                        <td class=\"value\">\n                            ")
    ; __line = 44
    ; 
                            var dateCreated = new Date(created);
                            dateCreated = dateCreated.toDateString() + ' ' + dateCreated.toLocaleTimeString();
                            
    ; __line = 47
    ; __append("\n                            ")
    ; __line = 48
    ; __append(escapeFn( dateCreated ))
    ; __append("\n                        </td>\n                    </tr>\n                    <tr class=\"expires\">\n                        <td class=\"label\">Expires</td>\n                        <td class=\"value\">\n                            ")
    ; __line = 54
    ; 
                            var dateExpires = new Date(expires);
                            dateExpires = dateExpires.toDateString() + ' ' + dateExpires.toLocaleTimeString();
                            
    ; __line = 57
    ; __append("\n                            ")
    ; __line = 58
    ; __append(escapeFn( dateExpires ))
    ; __append("\n                        </td>\n                    </tr>\n                    <tr class=\"length\">\n                        <td class=\"label\">Length</td>\n                        <td class=\"value\">")
    ; __line = 63
    ; __append(escapeFn( length ))
    ; __append("</td>\n                    </tr>\n                    <tr class=\"algorithm\">\n                        <td class=\"label\">Algorithm</td>\n                        <td class=\"value\">\n                            ")
    ; __line = 68
    ;  var algo = algorithm.toUpperCase(); 
    ; __append("\n                            ")
    ; __line = 69
    ; __append(escapeFn( algo ))
    ; __append("\n                        </td>\n                    </tr>\n                    </tbody>\n                </table>\n            </div>\n\n            <div class=\"submit-wrapper clearfix\">\n                <input type=\"submit\" value=\"OK\" class=\"button primary\" id=\"key-info-ok\">\n                <!-- <a class=\"button\" id=\"js_keyinfo_help\">Help!</a> -->\n            </div>\n        </div>\n    </div>\n</div>")
    ; __line = 82
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}