var storage = new (require('node-localstorage').LocalStorage)();
var Request = require("sdk/request").Request;
const { defer } = require('sdk/core/promise');
var Config = require("model/config");

/**
 * The class that deals with users.
 */
var User = function() {

};

/**
 * Get current user from server.
 */
User.prototype.getCurrent = function() {
  var deferred = defer(),
    url = Config.read('baseUrl') + "/users/me.json";

  // Get the current user from passbolt.
  Request({
    url: url,
    onComplete: function (raw) {
      var response = JSON.parse(raw.text);
      if (response.header.status == "success") {
        //storage.setItem('me', JSON.stringify(response.header.body));
        // Resolve the defer with the user.
        deferred.resolve(response.body);
      }
      else {
        deferred.reject(response);
      }
    }
  }).get();
  return deferred.promise;
};

// Exports the Gpg Key object.
exports.User = User;