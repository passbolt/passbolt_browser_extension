var portname = 'quickaccess';
var scripts = [
  'vendors/react.production.min.js',
  'vendors/react-dom.production.min.js',
  'vendors/simplebar.js',
  'js/lib/port.js',
  'js/lib/message.js',
  'js/lib/request.js'
];
loadScripts(scripts).then(function () {
  var scripts = [
    'js/quickaccess/popup.js'
  ];
  loadScripts(scripts).then(function () {
    // all done!
  });
});
