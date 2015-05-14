var passbolt = passbolt || {};

$(function() {
  var displayKeyInfo = function(keyInfo, keyId, keyType) {
    var container = $('#' + keyId);
    var info = {
      "uid" : (keyType == 'server' ? keyInfo.uid.replace("<", '&lt;').replace('>', '&gt;') : keyInfo.userIds[0].name + ' &lt;' + keyInfo.userIds[0].email + '&gt;'),
      "fingerprint" : keyInfo.fingerprint,
      "algorithm" : keyType == 'server' ? keyInfo.type : keyInfo.algorithm,
      "created" : keyType == 'server' ? keyInfo.key_created : keyInfo.created,
      "expires" : keyInfo.expires
    };

    if(keyInfo) {
      if (keyType == 'client') {
        var uids = "";
        for (var i in keyInfo.userIds) {
          var uid = keyInfo.userIds[i].name + ' &lt;' + keyInfo.userIds[i].email + '&gt;';
          uids += "<li>" + uid + "</li>";
        }
        info.uid = uids;
      }
      $('.uid', container).html(info.uid);
      $('.fingerprint', container).html(info.fingerprint);
      $('.algorithm', container).html(info.algorithm);
      $('.created', container).html(info.created);
      $('.expires', container).html(info.expires);
    }
    else {
      $('.feedback', container).html(feedbackHtml("There is no private key available please upload one.", "error"));
    }
  };

  var feedbackHtml = function(message, messageType) {
    return '<div class="message ' + messageType + '">' + message + '</div>';
  };

  passbolt.request('passbolt.config.read', 'baseUrl')
    .then(function(baseUrl) {
      if(baseUrl) {
        $('#baseUrl').val(baseUrl);
      }
    });

  // Listen to the keyinfo event, fired when the page is opened or
  // a new key has been set.
  passbolt.request("passbolt.keyring.privateKeyInfo").then(function(info) {
    displayKeyInfo(info, 'privkeyinfo', 'client');
  });

  var me = null;
  passbolt.request('passbolt.user.me')
    .then(function(user) {
      me = user;
      displayKeyInfo(user.Gpgkey, 'pubkeyinfo-server', 'server');

      passbolt.request('passbolt.keyring.findPublicKey', user.id)
        .then(function(publicKeyArmored) {
          if (publicKeyArmored) {
            passbolt.request('passbolt.keyring.publicKeyInfo', publicKeyArmored.key)
              .then(function (info) {
                displayKeyInfo(info, 'pubkeyinfo-plugin', 'client');
              });
          }
        });
    });


  $('#js_save_conf').click(function() {
    passbolt.request('passbolt.config.write', 'baseUrl', $('#baseUrl').val());
  });

  // The user requests a private key import from file.
  $('#keyFilepicker').click(function(){
    passbolt.file.prompt()
      .then(function(data) {
        $('#keyAscii').val(data);
      });
  });

  // Save a new key.
  $('#saveKey').click(function() {
    var key = $('#keyAscii').val();
    if (key) {
      passbolt.keyring.importPrivate(key)
        .then(function() {
          // Display info.
          passbolt.request("passbolt.keyring.privateKeyInfo").then(function(info) {
            displayKeyInfo(info, 'privkeyinfo', 'client');
          });

          // retrieve public key and import it.
          passbolt.request('passbolt.keyring.extractPublicKey', key)
            .then(function(publicKeyArmored) {
              var meta = passbolt.keyring.getKeyMeta(publicKeyArmored, me.id);
              passbolt.keyring.importPublic(publicKeyArmored, meta)
                .then(function() {
                  passbolt.request('passbolt.keyring.publicKeyInfo', publicKeyArmored)
                    .then(function (info) {
                      displayKeyInfo(info, 'pubkeyinfo-plugin', 'client');
                    });
                });
            });
          $('.key-import.feedback').html(feedbackHtml("The key has been imported succesfully.", "success"));
        })
        .fail(function(params) {
          $('.key-import.feedback').html(feedbackHtml('something went wrong during the import.', 'error'));
        });
    }
  });
});
