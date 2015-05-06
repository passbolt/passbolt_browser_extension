/**
 * The passbolt keys preferences management screen.
 */
var passbolt = passbolt || {};

passbolt.message('passbolt.context.set')
  .subscribe(function(token, status) {
    passbolt.request('passbolt.keyring.findPublicKey', passbolt.context['userId']).then(function(publicKey) {
      $('#publicKeyUnarmored').val(publicKey.key);
    });
  });

// When the page has been initialized.
$(document).bind('template-ready', function() {
  var userId = $('input[name=userId]').val();
  passbolt.request('passbolt.keyring.privateKeyInfo').then(function(info) {
    if(info) {
      for (var i in info.userIds) {
        $('<li>').appendTo('#privkeyinfo .user-ids').text(info.userIds[i]);
      }
      if (info.userIds.length > 0) {
        $('#privkeyinfo .name').html(info.userIds[0].name);
        $('#privkeyinfo .email').html(info.userIds[0].email);
      }
      $('#privkeyinfo .keyId').html(info.keyId);
      $('#privkeyinfo .fingerprint').html(info.fingerprint);
      $('#privkeyinfo .algorithm').html(info.algorithm);
      $('#privkeyinfo .created').html(info.created);
      $('#privkeyinfo .expires').html(info.expires);
      $('#privkeyinfo .length').html(info.length);
      $('#privateKeyUnarmored').val(info.key);
    }
  });
});
initPageTpl();