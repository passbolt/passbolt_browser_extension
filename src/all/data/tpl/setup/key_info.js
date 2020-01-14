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
  , __lines = "<!-- left column -->\n<div class=\"col7\">\n    <h3>Information for public and secret key</h3>\n    <table class=\"table-info\">\n        <tr class=\"owner_name\">\n            <td>Owner Name</td>\n            <td  class=\"<?= typeof fieldsDetails['name'] != 'undefined' ? fieldsDetails['name'].status : '' ?>\">\n                <?= keyInfo.userIds[0].name ?>\n                <?= typeof fieldsDetails['name'] != 'undefined' ? ' (' + fieldsDetails['name'].original + ')' : '' ?>\n            </td>\n        </tr>\n        <tr class=\"owner_email\">\n            <td>Owner Email</td>\n            <td class=\"<?= typeof fieldsDetails['email'] != 'undefined' ? fieldsDetails['email'].status : '' ?>\">\n                <?= keyInfo.userIds[0].email ?>\n                <?= typeof fieldsDetails['email'] != 'undefined' ? ' (' + fieldsDetails['email'].original + ')' : '' ?>\n            </td>\n        </tr>\n        <tr class=\"keyid\">\n            <td>Key Id</td>\n            <td><?= keyInfo.keyId.toUpperCase() ?></td>\n        </tr>\n        <tr class=\"fingerprint\">\n            <td>Fingerprint</td>\n            <td><?= keyInfo.fingerprint.toUpperCase() ?></td>\n        </tr>\n        <tr class=\"created\">\n            <td>Created</td>\n            <td><?= keyInfo.created ?></td>\n        </tr>\n        <tr class=\"expires\">\n            <td>Expires</td>\n            <td><?= keyInfo.expires ?></td>\n        </tr>\n        <tr class=\"length\">\n            <td>Key Length</td>\n            <td><?= keyInfo.length ?></td>\n        </tr>\n        <tr class=\"algorithm\">\n            <td>Algorithm</td>\n            <td><?= keyInfo.algorithm.toUpperCase() ?></td>\n        </tr>\n    </table>\n</div>\n\n<!-- right column -->\n<div class=\"col5 last\">\n    <div class=\"message <?= status ?> side-message\">\n        <?\n        if (status == 'warning') {\n          var fieldsStr = '';\n          for (var fieldName in fieldsDetails) {\n            fieldsStr += ((fieldsStr == '') ? fieldName : ' and ' + fieldName);\n          }\n        ?>\n        <p>\n            <strong>Warning:</strong> the <?= fieldsStr ?> selected by your administrator does not match\n            the name and email of your key. Passbolt will use the information provided by the administrator to identify yourself.\n        </p>\n        <p>\n            While this is not a deal breaker this may lead to some confusion.\n        </p>\n        <p class=\"small\">\n            Note: Passbolt does not support multiple user identities at the moment.\n        </p>\n        <?\n        } else {\n        ?>\n          <p>\n              <strong>Success!</strong>\n              Nice one, it looks like a valid key with your key information matching the name and email provided by your passbolt administrator.\n              <br><br>\n              You are good to go!\n          </p>\n        <?\n        }\n        ?>\n    </div>\n</div>"
  , __filename = "src/all/data/ejs/setup/key_info.ejs";
try {
  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  with (locals || {}) {
    ; __append("<!-- left column -->\n<div class=\"col7\">\n    <h3>Information for public and secret key</h3>\n    <table class=\"table-info\">\n        <tr class=\"owner_name\">\n            <td>Owner Name</td>\n            <td  class=\"")
    ; __line = 7
    ; __append(escapeFn( typeof fieldsDetails['name'] != 'undefined' ? fieldsDetails['name'].status : '' ))
    ; __append("\">\n                ")
    ; __line = 8
    ; __append(escapeFn( keyInfo.userIds[0].name ))
    ; __append("\n                ")
    ; __line = 9
    ; __append(escapeFn( typeof fieldsDetails['name'] != 'undefined' ? ' (' + fieldsDetails['name'].original + ')' : '' ))
    ; __append("\n            </td>\n        </tr>\n        <tr class=\"owner_email\">\n            <td>Owner Email</td>\n            <td class=\"")
    ; __line = 14
    ; __append(escapeFn( typeof fieldsDetails['email'] != 'undefined' ? fieldsDetails['email'].status : '' ))
    ; __append("\">\n                ")
    ; __line = 15
    ; __append(escapeFn( keyInfo.userIds[0].email ))
    ; __append("\n                ")
    ; __line = 16
    ; __append(escapeFn( typeof fieldsDetails['email'] != 'undefined' ? ' (' + fieldsDetails['email'].original + ')' : '' ))
    ; __append("\n            </td>\n        </tr>\n        <tr class=\"keyid\">\n            <td>Key Id</td>\n            <td>")
    ; __line = 21
    ; __append(escapeFn( keyInfo.keyId.toUpperCase() ))
    ; __append("</td>\n        </tr>\n        <tr class=\"fingerprint\">\n            <td>Fingerprint</td>\n            <td>")
    ; __line = 25
    ; __append(escapeFn( keyInfo.fingerprint.toUpperCase() ))
    ; __append("</td>\n        </tr>\n        <tr class=\"created\">\n            <td>Created</td>\n            <td>")
    ; __line = 29
    ; __append(escapeFn( keyInfo.created ))
    ; __append("</td>\n        </tr>\n        <tr class=\"expires\">\n            <td>Expires</td>\n            <td>")
    ; __line = 33
    ; __append(escapeFn( keyInfo.expires ))
    ; __append("</td>\n        </tr>\n        <tr class=\"length\">\n            <td>Key Length</td>\n            <td>")
    ; __line = 37
    ; __append(escapeFn( keyInfo.length ))
    ; __append("</td>\n        </tr>\n        <tr class=\"algorithm\">\n            <td>Algorithm</td>\n            <td>")
    ; __line = 41
    ; __append(escapeFn( keyInfo.algorithm.toUpperCase() ))
    ; __append("</td>\n        </tr>\n    </table>\n</div>\n\n<!-- right column -->\n<div class=\"col5 last\">\n    <div class=\"message ")
    ; __line = 48
    ; __append(escapeFn( status ))
    ; __append(" side-message\">\n        ")
    ; __line = 49
    ; 
        if (status == 'warning') {
          var fieldsStr = '';
          for (var fieldName in fieldsDetails) {
            fieldsStr += ((fieldsStr == '') ? fieldName : ' and ' + fieldName);
          }
        
    ; __line = 55
    ; __append("\n        <p>\n            <strong>Warning:</strong> the ")
    ; __line = 57
    ; __append(escapeFn( fieldsStr ))
    ; __append(" selected by your administrator does not match\n            the name and email of your key. Passbolt will use the information provided by the administrator to identify yourself.\n        </p>\n        <p>\n            While this is not a deal breaker this may lead to some confusion.\n        </p>\n        <p class=\"small\">\n            Note: Passbolt does not support multiple user identities at the moment.\n        </p>\n        ")
    ; __line = 66
    ; 
        } else {
        
    ; __line = 68
    ; __append("\n          <p>\n              <strong>Success!</strong>\n              Nice one, it looks like a valid key with your key information matching the name and email provided by your passbolt administrator.\n              <br><br>\n              You are good to go!\n          </p>\n        ")
    ; __line = 75
    ; 
        }
        
    ; __line = 77
    ; __append("\n    </div>\n</div>")
    ; __line = 79
  }
  return __output;
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

//# sourceURL=src/all/data/ejs/setup/key_info.ejs

}