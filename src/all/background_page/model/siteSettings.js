/**
 * Site Settings model.
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var __ = require('../sdk/l10n').get;
var Config = require('../model/config');

/**
 * The class that deals with users settings
 */
var SiteSettings = function (domain) {
  this.domain = domain;
  this._settings = null;
};

/**
 * Try to get the site settings from object cache, config or remotely
 * @returns {Promise}
 */
SiteSettings.prototype.get = function() {
  var self = this;
  if (this._settings === null) {
    // get from remote
    return this.getRemote();
  } else {
    // already there in object
    return new Promise( function(resolve, reject) {
      resolve(self._settings);
    });
  }
};

/**
 * Return remember me options
 * @returns {Promise}
 */
SiteSettings.prototype.getRememberMeOptions = function() {
  var self = this;
  return new Promise( function(resolve, reject) {
    self.get().then(function (data) {
      if (data === undefined || data.passbolt === undefined || data.passbolt.plugins === undefined
        || data.passbolt.plugins.rememberMe === undefined || data.passbolt.plugins.rememberMe.options === undefined) {
        resolve(null);
      } else {
        resolve(data.passbolt.plugins.rememberMe.options);
      }
    })
  });
};

/**
 * Get remote settings
 * @return {Promise}
 */
SiteSettings.prototype.getRemote = function () {
  var url = this.domain + '/settings.json?api-version=v2';
  var self = this;
  return new Promise( function(resolve, reject) {
    fetch(
      url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          return null;
        }
      })
      .then(function (json) {
          var response = { 'body' : {} };
          if (json !== null) {
            response = json.body;
          }
          // Save temporarily and return remote version of current user
          self._settings = response;
          resolve(self._settings);
      })
      .catch(function (error) {
        reject(error);
      })
  });

};

exports.SiteSettings = SiteSettings;