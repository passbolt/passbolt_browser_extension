var passbolt = passbolt || {};

$(function() {

  /**
   * Curren user information
   */
  var me = null;

  /**
   * Display the key information
   * @param keyInfo
   * @param keyId
   * @param keyType
   */
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

  /**
   * Helper to build feedback message
   * @param message
   * @param messageType
   * @returns {string}
   */
  var feedbackHtml = function(message, messageType) {
    return '<div class="message ' + messageType + '">' + message + '</div>';
  };

  /**
   * At startup read configuration and load baseurl
   */
  passbolt.request('passbolt.config.read', 'baseUrl')
      .then(function(baseUrl) {
        if(baseUrl) {
          $('#baseUrl').val(baseUrl);
        }
      }).fail(function(param){
        console.log('passbolt.config.read fail: no baseurl in config');
      });

  /**
   * Display key information
   * Triggered when the page is opened or when a new key is set
   */
  passbolt.request("passbolt.keyring.privateKeyInfo").then(function(info) {
    displayKeyInfo(info, 'privkeyinfo', 'client');
  }).fail(function(param){
    console.log('passbolt.keyring.privateKeyInfo fail: no private key set');
  });

  /**
   * Get the information about the current user if any
   */
  passbolt.request('passbolt.user.me')
      .then(function(user) {
        me = user;
        console.log('passbolt.user.me success');
        displayKeyInfo(user.Gpgkey, 'pubkeyinfo-server', 'server');

        passbolt.request('passbolt.keyring.findPublicKey', user.id)
            .then(function(publicKeyArmored) {
              if (publicKeyArmored) {
                passbolt.request('passbolt.keyring.publicKeyInfo', publicKeyArmored.key)
                    .then(function (info) {
                      displayKeyInfo(info, 'pubkeyinfo-plugin', 'client');
                    });
              }
            }).fail(function(param){
              console.log('passbolt.keyring.publicKeyInfo fail');
            });
      }).fail(function(param){
        console.log('passbolt.user.me fail: no current user');
      });

  /**
   * Event: When user press plugin configuration save button
   * Save the baseurl, user info, etc.
   */
  $('#js_save_conf').click(function() {
    var securityToken = {
        code : $('#securityTokenCode').val(),
        color : $('#securityTokenColor').val(),
        textcolor : $('#securityTokenTextColor').val()
    };
    passbolt.request('passbolt.user.settings.setSecurityToken', securityToken).then(
        function success() {
            // @todo display some feedback
            console.log('security token saved!');
        },
        function error(msg) {
            console.log('Error: ' + msg);
        }
    );

    //passbolt.request('passbolt.config.write', 'baseUrl', $('#baseUrl').val());
    //passbolt.request('passbolt.config.write', 'username', $('#UserUsername').val());
    ////passbolt.request('passbolt.config.write', 'firstname', $('#ProfileFirstName').val());
    ////passbolt.request('passbolt.config.write', 'lastname', $('#ProfileLastName').val());
  });

  /**
   * Event: When user press browse button
   * The user requests a private key import from file.
   */
  $('#keyFilepicker').click(function(){
    passbolt.file.prompt()
        .then(function(data) {
          $('#keyAscii').val(data);
        });
  });

  /**
   * Event: When the user pres the key settings save
   * Save the private key and deduce public key
   */
  $('#saveKey').click(function() {
    var key = $('#keyAscii').val();
    if (key) {
      passbolt.keyring.importPrivate(key)
          .then(function() {
            // Display info.
            passbolt.request("passbolt.keyring.privateKeyInfo").then(function(info) {
              displayKeyInfo(info, 'privkeyinfo', 'client');
            });
            //
            //// retrieve public key and import it.
            //passbolt.request('passbolt.keyring.extractPublicKey', key)
            //    .then(function(publicKeyArmored) {
            //      //var meta = passbolt.keyring.getKeyMeta(publicKeyArmored, me.id);
            //      passbolt.keyring.importPublic(publicKeyArmored, me.id)
            //          .then(function() {
            //            passbolt.request('passbolt.keyring.publicKeyInfo', publicKeyArmored)
            //                .then(function (info) {
            //                  displayKeyInfo(info, 'pubkeyinfo-plugin', 'client');
            //                });
            //          });
            //    });
            $('.key-import.feedback').html(feedbackHtml("The key has been imported succesfully.", "success"));
          })
          .fail(function(params) {
            $('.key-import.feedback').html(feedbackHtml('something went wrong during the import: ' + params, 'error'));
          });
    }
  });
});
