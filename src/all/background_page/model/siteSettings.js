/**
 * Site Settings model.
 *
 * @copyright (c) 2018 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

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
SiteSettings.prototype.get = async function() {
  if (this._settings === null) {
    this._settings = await this.getRemote();
  }
  return this._settings
};

/**
 * Return remember me options
 * @returns {Promise}
 */
SiteSettings.prototype.getRememberMeOptions = function() {
  return new Promise( (resolve, reject) => {
    this.get().then(function (data) {
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
SiteSettings.prototype.getRemote = async function () {
  const url = this.domain + '/settings.json?api-version=v2';
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
          let response = { 'body' : {} };
          if (json !== null) {
            response = json.body;
          }
          resolve(response);
      })
      .catch(function (error) {
        reject(error);
      })
  });
};

exports.SiteSettings = SiteSettings;
