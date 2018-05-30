var portname = 'setup';
var scripts = [
  'vendors/jquery.js',
  'vendors/sha.js',
  'vendors/xregexp-all.js',
  'vendors/farbtastic.js',
  'js/lib/port.js',
  'tpl/setup.js',
  'tpl/secret.js'
];
loadScripts(scripts).then(function () {
  var scripts = [
    'js/lib/message.js',
    'js/lib/request.js',
    'js/lib/html.js',
    'js/lib/pwnedpasswords.js',
    'js/lib/secretComplexity.js',
    'js/file/file.js',
    'js/setup/workflow/installSetup.workflow.js',
    'js/setup/workflow/recoverSetup.workflow.js',
    'js/setup/step/domainCheck.js',
    'js/setup/step/defineKey.js',
    'js/setup/step/importKey.js',
    'js/setup/step/secret.js',
    'js/setup/step/generateKey.js',
    'js/setup/step/backupKey.js',
    'js/setup/step/keyInfo.js',
    'js/setup/step/securityToken.js',
    'js/setup/step/loginRedirection.js',
    'js/setup/setup.js'
  ];
  loadScripts(scripts).then(function () {
    // all done!
  });
});
