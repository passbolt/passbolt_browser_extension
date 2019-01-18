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
  , __lines = "<?\nlet avatarPath = '';\nlet aroName = '';\nlet aroDetails = '';\n\nif (aroPermissions.aro.profile) {\n    avatarPath = `${domain}/${aroPermissions.aro.profile.avatar.url.small}`;\n    aroName = `${aroPermissions.aro.profile.first_name} ${aroPermissions.aro.profile.last_name}`;\n    aroDetails = aroPermissions.aro.username;\n} else {\n    avatarPath = `${domain}/img/avatar/group_default.png`;\n    aroName = aroPermissions.aro.name;\n    aroDetails = 'Group';\n}\n?>\n<li id=\"<?= aroPermissions.aro.id ?>\" class=\"row\">\n    <div class=\"avatar\">\n        <img src=\"<?= avatarPath ?>\"/>\n    </div>\n\n    <div class=\"group\"><!-- @todo NO BUENO -->\n        <span class=\"name\"><?= aroName ?></span>\n        <span class=\"details\"><a><?= aroDetails ?></a></span>\n    </div>\n\n    <div class=\"select rights\">\n        <select class=\"permission <?= !canEdit ? 'disabled' : '' ?>\" <?= !canEdit ? 'disabled=\"disabled\"' : '' ?>>\n            <option value=\"1\" <?= aroPermissions.type == 1 ? 'selected=\"selected\"' : ''?>>can read</option>\n            <option value=\"7\" <?= aroPermissions.type == 7 ? 'selected=\"selected\"' : ''?>>can update</option>\n            <option value=\"15\" <?= aroPermissions.type == 15 ? 'selected=\"selected\"' : ''?>>is owner</option>\n            <? if (aroPermissions.type == -1) { ?>\n            <option value=\"-1\" selected=\"selected\">varies</option>\n            <? } ?>\n        </select>\n<? if (aroPermissions.type == -1) { ?>\n        <div href=\"#\" class=\"more_details tooltip-alt\">\n            <i class=\"fa fa-info-circle\"></i>\n            <div class=\"tooltip-text right\">\n                <? if(aroPermissions.variesDetails[0].length) { ?>\n                <b>no access</b>: <?= aroPermissions.variesDetails[0].join(', ') ?><br/>\n                <? } ?>\n                <? if(aroPermissions.variesDetails[1].length) { ?>\n                <b>can read</b>: <?= aroPermissions.variesDetails[1].join(', ') ?><br/>\n                <? } ?>\n                <? if(aroPermissions.variesDetails[7].length) { ?>\n                <b>can update</b>: <?= aroPermissions.variesDetails[7].join(', ') ?><br/>\n                <? } ?>\n                <? if(aroPermissions.variesDetails[15].length) { ?>\n                <b>is owner</b>: <?= aroPermissions.variesDetails[15].join(', ') ?><br/>\n                <? } ?>\n            </div>\n        </div>\n<? } ?>\n    </div>\n\n    <div id=\"js_actions_rs_perm_<?= aroPermissions.aro.id ?>\" class=\"actions\">\n        <a class=\"js-share-delete-button close <?= !canEdit ? 'disabled' : '' ?>\" title=\"remove\">\n            <i class=\"fa fa-times-circle\"></i>\n            <span class=\"visuallyhidden\">remove</span>\n        </a>\n    </div>\n</li>\n"
  , __filename = "src/all/data/ejs/resource/shareAroPermissionsItem.ejs";
try {
  var __output = [], __append = __output.push.bind(__output);
  with (locals || {}) {
    ; 
let avatarPath = '';
let aroName = '';
let aroDetails = '';

if (aroPermissions.aro.profile) {
    avatarPath = `${domain}/${aroPermissions.aro.profile.avatar.url.small}`;
    aroName = `${aroPermissions.aro.profile.first_name} ${aroPermissions.aro.profile.last_name}`;
    aroDetails = aroPermissions.aro.username;
} else {
    avatarPath = `${domain}/img/avatar/group_default.png`;
    aroName = aroPermissions.aro.name;
    aroDetails = 'Group';
}

    ; __line = 15
    ; __append("\n<li id=\"")
    ; __line = 16
    ; __append(escapeFn( aroPermissions.aro.id ))
    ; __append("\" class=\"row\">\n    <div class=\"avatar\">\n        <img src=\"")
    ; __line = 18
    ; __append(escapeFn( avatarPath ))
    ; __append("\"/>\n    </div>\n\n    <div class=\"group\"><!-- @todo NO BUENO -->\n        <span class=\"name\">")
    ; __line = 22
    ; __append(escapeFn( aroName ))
    ; __append("</span>\n        <span class=\"details\"><a>")
    ; __line = 23
    ; __append(escapeFn( aroDetails ))
    ; __append("</a></span>\n    </div>\n\n    <div class=\"select rights\">\n        <select class=\"permission ")
    ; __line = 27
    ; __append(escapeFn( !canEdit ? 'disabled' : '' ))
    ; __append("\" ")
    ; __append(escapeFn( !canEdit ? 'disabled="disabled"' : '' ))
    ; __append(">\n            <option value=\"1\" ")
    ; __line = 28
    ; __append(escapeFn( aroPermissions.type == 1 ? 'selected="selected"' : ''))
    ; __append(">can read</option>\n            <option value=\"7\" ")
    ; __line = 29
    ; __append(escapeFn( aroPermissions.type == 7 ? 'selected="selected"' : ''))
    ; __append(">can update</option>\n            <option value=\"15\" ")
    ; __line = 30
    ; __append(escapeFn( aroPermissions.type == 15 ? 'selected="selected"' : ''))
    ; __append(">is owner</option>\n            ")
    ; __line = 31
    ;  if (aroPermissions.type == -1) { 
    ; __append("\n            <option value=\"-1\" selected=\"selected\">varies</option>\n            ")
    ; __line = 33
    ;  } 
    ; __append("\n        </select>\n")
    ; __line = 35
    ;  if (aroPermissions.type == -1) { 
    ; __append("\n        <div href=\"#\" class=\"more_details tooltip-alt\">\n            <i class=\"fa fa-info-circle\"></i>\n            <div class=\"tooltip-text right\">\n                ")
    ; __line = 39
    ;  if(aroPermissions.variesDetails[0].length) { 
    ; __append("\n                <b>no access</b>: ")
    ; __line = 40
    ; __append(escapeFn( aroPermissions.variesDetails[0].join(', ') ))
    ; __append("<br/>\n                ")
    ; __line = 41
    ;  } 
    ; __append("\n                ")
    ; __line = 42
    ;  if(aroPermissions.variesDetails[1].length) { 
    ; __append("\n                <b>can read</b>: ")
    ; __line = 43
    ; __append(escapeFn( aroPermissions.variesDetails[1].join(', ') ))
    ; __append("<br/>\n                ")
    ; __line = 44
    ;  } 
    ; __append("\n                ")
    ; __line = 45
    ;  if(aroPermissions.variesDetails[7].length) { 
    ; __append("\n                <b>can update</b>: ")
    ; __line = 46
    ; __append(escapeFn( aroPermissions.variesDetails[7].join(', ') ))
    ; __append("<br/>\n                ")
    ; __line = 47
    ;  } 
    ; __append("\n                ")
    ; __line = 48
    ;  if(aroPermissions.variesDetails[15].length) { 
    ; __append("\n                <b>is owner</b>: ")
    ; __line = 49
    ; __append(escapeFn( aroPermissions.variesDetails[15].join(', ') ))
    ; __append("<br/>\n                ")
    ; __line = 50
    ;  } 
    ; __append("\n            </div>\n        </div>\n")
    ; __line = 53
    ;  } 
    ; __append("\n    </div>\n\n    <div id=\"js_actions_rs_perm_")
    ; __line = 56
    ; __append(escapeFn( aroPermissions.aro.id ))
    ; __append("\" class=\"actions\">\n        <a class=\"js-share-delete-button close ")
    ; __line = 57
    ; __append(escapeFn( !canEdit ? 'disabled' : '' ))
    ; __append("\" title=\"remove\">\n            <i class=\"fa fa-times-circle\"></i>\n            <span class=\"visuallyhidden\">remove</span>\n        </a>\n    </div>\n</li>\n")
    ; __line = 63
  }
  return __output.join("");
} catch (e) {
  rethrow(e, __lines, __filename, __line, escapeFn);
}

}