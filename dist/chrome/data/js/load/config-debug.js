
setTimeout(load, 1000);

function load() {
  var scripts = [
    'vendors/jquery.min.js',
    'vendors/sha.js',
    'vendors/xregexp.js',
    'js/lib/port.js',
    'js/lib/message.js',
    'js/lib/request.js',
    'js/debug.js'
  ];
  loadScripts(scripts).then(function () {
    console.log('config-debug ready!');
  });
}
