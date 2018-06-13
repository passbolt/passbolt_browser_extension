var portname = 'config-debug';
var scripts = [
  'vendors/jquery.js',
  'vendors/sha.js',
  'vendors/xregexp-all.js',
  'js/lib/port.js'
];
loadScripts(scripts).then(function () {
  var scripts = [
    'js/lib/message.js',
    'js/lib/request.js',
    'data/js/lib/html.js',
    'js/file/file.js',
    'js/debug/common.js',
    'js/debug/profiles.js',
    'js/debug/debug.js'
  ];
  loadScripts(scripts).then(function () {
    // all done!
  });
});
