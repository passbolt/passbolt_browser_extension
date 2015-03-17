self.port.on("passbolt.cipher.encryptSuccess", function(data) {
  console.log(data);
  self.port.emit("passbolt.cipher.decrypt", data.msg);
});

self.port.on("passbolt.cipher.decryptSuccess", function(data) {
  self.port.emit("passbolt.clipboard.copy", data.msg);
});

$('body').on('click', '.password',  function() {
  var pgpMessage = $('pre', this).html();
  console.log(pgpMessage);
  self.port.emit("passbolt.cipher.decrypt", pgpMessage);
});
window.addEventListener("request_resource_edition", function(event) {
  //$('#js_field_secret').replaceWith('<textarea>test</textarea>');
  //console.log($('#js_field_secret'));
  //$('#js_field_secret').on('change', function() {
  //  console.log('change', $('#js_field_secret').val());
  //});
  //$('#js_field_secret').val('test');
}, false);

//function init() {
//  console.log('init plugin code');
//  $('body').bind('request_resource_edition', function() {
//    console.log('edition');
//  });
//}
//
//var interval = setInterval(function(){
//  var $bus = $('.mad_event_event_bus');
//  console.log($bus.length);
//  if ($bus.length) {
//    console.log('ouaich');
//    init();
//    clearInterval(interval);
//  }
//}, 1000);

//$(document.body).on('app_ready', function(){
//  console.log('ready');
//});
//console.log(document);
//console.log(jQuery);
//document.body.innerHTML = "<script type='text/javascript'>console.log('injected script');</script>";
//console.log(window);
//
//(function($, w, d) {
//
//  console.log('loaded ogog');
//  var _passboltPlugin = $.passboltPlugin || {};
//
//  _passboltPlugin.ready = function() {
//    console.log('the application is ready');
//  };
//
//  _passboltPlugin.config = {
//    callbacks: {
//      ready: function(){
//        console.log('plugin callback');
//        $.passboltPlugin.ready()
//      }
//    }
//  };
//
//  $.passboltPlugin = _passboltPlugin;
//
//  //console.log($('.mad_event_event_bus'));
//  //$('.mad_event_event_bus').live('request_resource_edition', function() {
//  //  console.log('oh yeah');
//  //});
//
//	//console.log( "passbolt_ff/app ready!" );
//	/*// can parse html
//	var secret = $('#secret').val();
//
//	//console.log('opengpg');
//	var openpgp = window.openpgp;
//	var key = $('#public').val();
//	key = 'bad key';
//	var publicKey = openpgp.key.readArmored(key);
//
//	if (publicKey.keys.length != 0) {
//		console.log('valid public key');
//		var secret2 = openpgp.encryptMessage(publicKey.keys, 'this is a super secret!');
//		$('#secret2').val(secret2);
//	} else {
//		console.log('invalid publicKey');
//	}*/
//
//}(jQuery, this, document));
