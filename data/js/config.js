$(function() {

  // Listen to the keyinfo event, fired when the page is opened or
  // a new key has been set.
  self.port.on("passbolt.keyring.privateKeyInfo", function(info) {
    if(info) {
      for (var i in info.userIds) {
        $('<li>').appendTo('#privkeyinfo .user-ids').text(info.userIds[i]);
      }
      $('#privkeyinfo .fingerprint').html(info.fingerprint);
      $('#privkeyinfo .algorithm').html(info.algorithm);
      $('#privkeyinfo .created').html(info.created);
      $('#privkeyinfo .expires').html(info.expires);
    }
  });

  // The user requests a private key import from file.
  $('#keyFilepicker').click(function(){
    passbolt.file.prompt()
      .then(function(data) {
        $('#keyAscii').val(data);
      });
  });

  // Save a new key.
  $('#saveKey').click(function(){
    var key = $('#keyAscii').val();
    passbolt.keyring.importPrivate(key)
      .then(function() {
        console.log('The private key has been imported with success.');
      })
      .fail(function(params) {
        console.log('Something went wrong during the import of the private key.');
        console.log(params);
      });
  });

  // Save a new visual code.
  $('#js_save_code').click(function(){
    var color = $('#js_code_color').val(),
      label = $('#js_code_label').val();

    passbolt.settings.saveVisualCode(color, label)
      .then(function() {
        console.log('The visual code has been saved with success.');
      })
      .fail(function() {
        console.log('Something went wrong during the save of the visual code.');
      });
  });

});
