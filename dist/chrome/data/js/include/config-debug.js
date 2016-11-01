var portname = 'config-debug';
var scripts = [
  'vendors/jquery.min.js',
  'vendors/sha.js',
  'vendors/xregexp.js',
  'js/lib/port.js'
];
loadScripts(scripts).then(function () {
  var scripts = [
    'js/lib/message.js',
    'js/lib/request.js',
    'js/lib/fileUpload.js',
    'js/debug.js'
  ];
  loadScripts(scripts).then(function () {
    // all done!
  });
});
