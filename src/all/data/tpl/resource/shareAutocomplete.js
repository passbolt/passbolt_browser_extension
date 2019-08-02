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
  , __lines = "<ul>\n<? if (!aros.length) { ?>\n    <li>\n        <div class=\"row\">\n            <div class=\"main-cell-wrapper\">\n                <div class=\"main-cell\" style=\"font-size:16px;\">\n                    No user or group found\n                </div>\n            </div>\n        </div>\n    </li>\n<? } ?>\n<? for(let i in aros) {\n    const aro = aros[i];\n    let aroAvatarPath, aroName, aroDetails, cssClass;\n    if (aro.profile) {\n        if (aro.profile.avatar.url.small.startsWith('https://')) {\n            aroAvatarPath = `${aro.profile.avatar.url.small}`;\n        } else {\n            aroAvatarPath = `${domain}/${aro.profile.avatar.url.small}`;\n        }\n        aroName = `${aro.profile.first_name} ${aro.profile.last_name} (${aro.gpgkey.key_id})`;\n        aroDetails = aro.username;\n        cssClass = 'user';\n    } else {\n        aroAvatarPath = `${domain}/img/avatar/group_default.png`;\n        aroName = aro.name;\n        aroDetails = `${aro.user_count} Member(s)`;\n        cssClass = 'group';\n    }\n?>\n    <li id=\"<?= aro.id ?>\">\n        <div class=\"row\">\n            <div class=\"main-cell-wrapper\">\n                <div class=\"main-cell\">\n                    <a>\n                        <div class=\"avatar\">\n                            <img src=\"<?= aroAvatarPath ?>\"/>\n                        </div>\n                        <div class=\"<?= cssClass ?>\">\n                            <span class=\"name\"><?= aroName ?></span>\n                            <span class=\"details\" title=\"<?= aroDetails ?>\"><?= aroDetails ?></span>\n                        </div>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </li>\n<? } ?>\n</ul>\n"
  , __filename = "src/all/data/ejs/resource/shareAutocomplete.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; __append("<ul>\n")
    ; __line = 2
    ;  if (!aros.length) { 
    ; __append("\n    <li>\n        <div class=\"row\">\n            <div class=\"main-cell-wrapper\">\n                <div class=\"main-cell\" style=\"font-size:16px;\">\n                    No user or group found\n                </div>\n            </div>\n        </div>\n    </li>\n")
    ; __line = 12
    ;  } 
    ; __append("\n")
    ; __line = 13
    ;  for(let i in aros) {
    const aro = aros[i];
    let aroAvatarPath, aroName, aroDetails, cssClass;
    if (aro.profile) {
        if (aro.profile.avatar.url.small.startsWith('https://')) {
            aroAvatarPath = `${aro.profile.avatar.url.small}`;
        } else {
            aroAvatarPath = `${domain}/${aro.profile.avatar.url.small}`;
        }
        aroName = `${aro.profile.first_name} ${aro.profile.last_name} (${aro.gpgkey.key_id})`;
        aroDetails = aro.username;
        cssClass = 'user';
    } else {
        aroAvatarPath = `${domain}/img/avatar/group_default.png`;
        aroName = aro.name;
        aroDetails = `${aro.user_count} Member(s)`;
        cssClass = 'group';
    }

    ; __line = 31
    ; __append("\n    <li id=\"")
    ; __line = 32
    ; __append(escapeFn( aro.id ))
    ; __append("\">\n        <div class=\"row\">\n            <div class=\"main-cell-wrapper\">\n                <div class=\"main-cell\">\n                    <a>\n                        <div class=\"avatar\">\n                            <img src=\"")
    ; __line = 38
    ; __append(escapeFn( aroAvatarPath ))
    ; __append("\"/>\n                        </div>\n                        <div class=\"")
    ; __line = 40
    ; __append(escapeFn( cssClass ))
    ; __append("\">\n                            <span class=\"name\">")
    ; __line = 41
    ; __append(escapeFn( aroName ))
    ; __append("</span>\n                            <span class=\"details\" title=\"")
    ; __line = 42
    ; __append(escapeFn( aroDetails ))
    ; __append("\">")
    ; __append(escapeFn( aroDetails ))
    ; __append("</span>\n                        </div>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </li>\n")
    ; __line = 49
    ;  } 
    ; __append("\n</ul>\n")
    ; __line = 51
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}