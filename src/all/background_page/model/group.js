/**
 * Group model.
 *
 * @copyright (c) 2017-present Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var Config = require('./config');
var UserSettings = require('./userSettings').UserSettings;
var __ = require('../sdk/l10n').get;

/**
 * The class that deals with groups.
 */
var Group = function () {
    // see model/settings
    this.settings = new UserSettings();

    /**
     * Definition of group object.
     *
     * @type {{id: {}, name: {}, GroupUsers: {}}}
     * @private
     */
    this._group = {
        id: '',
        name: '',
        GroupUser: [],
    };
};


/**
 * Find a group by id on the server.
 *
 * @param groupId
 * @returns {*}
 */
Group.prototype.findById = function(groupId) {
  var _response = null,
    _this = this;

  return new Promise(function(resolve, reject) {
    fetch(
      _this.settings.getDomain() + '/groups/' + groupId + '.json' + '?api-version=v1', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(function(response) {
        _response = response;
        return response.json();
      })
      .then(function (json) {
        // Check response status.
        // Response is an error. We return the error.
        if (!_response.ok) {
          json.header.status_code = _response.status;
          reject(json);
        } else {
            // Response is ok.
            var group = json.body;
            resolve(group);
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

/**
 * Save / update a group.
 * @param object group
 *   the group to create / update in json format, as expected by the server.
 * @param uuid groupId
 *   the groupId, in case of an update. (id provided in group object will not be taken into account).
 * @param bool dryrun
 *   whether this call should be a dry-run or an actual call.
 * @returns {*}
 */
Group.prototype.save = function(group, groupId, dryrun) {
  var _response = null,
    url =  this.settings.getDomain() + '/groups.json' + '?api-version=v1',
    method = 'POST',
    groupParamStr = JSON.stringify(group),
    isDryRun = dryrun != undefined && dryrun == true;

  // If the group is updated.
  if (groupId != undefined && groupId != '') {
    url = this.settings.getDomain()
      + '/groups/'
      + groupId
      + (isDryRun ? '/dry-run' : '')
      + '.json' + '?api-version=v1';
    method = 'PUT';
  }

  return new Promise(function(resolve, reject) {
    fetch(
      url, {
        method: method,
        credentials: 'include',
        body: groupParamStr,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(function (response) {
        _response = response;
        return response.json();
      })
      .then(function (json) {
        // Check response status.
        // Response is an error. We return the error.
        if (!_response.ok) {
          json.header.status_code = _response.status;
          reject(json);
        } else {
            // Response is ok.
            var group = json.body;
            resolve(group);
        }
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

/**
 * Check if a userId exists in the groupUsers of a group.
 * @param group
 * @param userId
 * @returns {*}
 */
Group.checkGroupUserUserIdExists = function(group, userId) {
    for (var i in group.GroupUser) {
        if (group.GroupUser[i].user_id == userId) {
            return group.GroupUser[i];
        }
    }
    return false;
};


// Exports the Group object.
exports.Group = Group;
