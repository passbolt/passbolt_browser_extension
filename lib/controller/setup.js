var openpgp = require("openpgp");
var storage = new (require('node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
const { defer } = require('sdk/core/promise');
var Config = require("model/config");

/**
 * Sync the local keyring with the passbolt back end.
 * Retrieve the latest updated Public Keys.
 */
var save = function(data) {
  console.log(data);
  var deferred = defer(),
    // Get the latest keys changes from the backend.
    url = Config.read('baseUrl') + '/users/validateAccount/' + data.userId + '.json';
console.log(data);
  // Save the new password.
  Request({
    url: url,
    content: {
      'AuthenticationToken': {
        'token': data.token
      },
      'User': {
        'password': data.password
      }
    },
    onComplete: function (raw) {
      console.log(raw);
      return;
      var response = JSON.parse(raw.text);
      if (response.body) {
        // Store all the new keys in the keyring.
        for (var i in response.body) {
          var meta = response.body[i];
          gpgkey.importPublic(meta.Gpgkey.key, meta.Gpgkey);
        }
        gpgkey.store();
      }
      // Update the latest synced time.
      storage.setItem('latestSync', Math.floor(new Date().getTime() / 1000));
      // Resolve the defer with the number of updated keys.
      deferred.resolve(response.body.length);
    }
  }).put();


  //$.ajax({
  //  'type': "PUT",
  //  'url': passbolt.setup.data.domain + '/users/validateAccount/' + passbolt.setup.data.userId,
  //  'dataType': 'json',
  //  'data': JSON.stringify({
  //    'token': passbolt.setup.data.token,
  //    'password': password
  //  })
  //}).then(function(){
  //  def.resolve();
  //});

  // If a sync has already been performed.
  if (latestSync) {
    url += '?modified_after=' + latestSync;
  }



  return deferred.promise;
};
exports.save = save;
