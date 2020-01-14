/**
 * Group model.
 *
 * @copyright (c) 2019 Passbolt SA
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

const GroupService = require("../service/group").GroupService;
const PassboltApiFetchError = require('../error/passboltApiFetchError').PassboltApiFetchError;
const Request = require('./request').Request;
const User = require('./user').User;
const UserSettings = require('./userSettings/userSettings').UserSettings;

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
Group.prototype.save = async function(group, groupId, dryrun) {
    let url =  this.settings.getDomain() + '/groups.json' + '?api-version=v1';
    let method = 'POST';
    const groupParamStr = JSON.stringify(group);
    const isDryRun = dryrun != undefined && dryrun == true;
    let response, responseJson;

  // If the group is updated.
  if (groupId != undefined && groupId != '') {
    url = this.settings.getDomain()
      + '/groups/'
      + groupId
      + (isDryRun ? '/dry-run' : '')
      + '.json' + '?api-version=v1';
    method = 'PUT';
  }

  const fetchOptions = {
    method: method,
    credentials: 'include',
    body: groupParamStr,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  Request.setCsrfHeader(fetchOptions, User.getInstance());

  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    // Catch Network error such as connection lost.
    throw new PassboltApiFetchError(error.message);
  }

  try {
    responseJson = await response.json();
  } catch (error) {
    // If the response cannot be parsed, it's not a Passbolt API response. It can be a nginx error (504).
    throw new PassboltApiFetchError(response.statusText, {code: response.status});
  }

  if (!response.ok) {
    const message = responseJson.header.message;
    throw new PassboltApiFetchError(message, {
      code: response.status,
      body: responseJson.body
    });
  }

  return responseJson.body;
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

/**
 * Find all groups
 * @param {object} options Options to apply to the find request
 * @return {Promise}
 */
Group.findAll = async function(options) {
  return await GroupService.findAll(options);
}

// Exports the Group object.
exports.Group = Group;
