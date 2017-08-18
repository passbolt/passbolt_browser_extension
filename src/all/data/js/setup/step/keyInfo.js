/**
 * Passbolt key info setup step.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */
var passbolt = passbolt || {};
passbolt.setup = passbolt.setup || {};
passbolt.setup.steps = passbolt.setup.steps || {};

$(function () {

  /*
   * Step settings.
   */
  var step = {
    id: 'key_info',
    keyinfo: {},
    data: {},
    status: ''
  };

  /**
   * Implements init().
   * @returns {promise}
   */
  step.init = function () {
    // Get private key from keyring.
    return passbolt.setup.get('key.privateKeyArmored')
      // Retrieve key info from private key.
      .then(step._getKeyInfo)
      .then(function (keyInfo) {

        // Pass the key info to the view.
        step.viewData.keyInfo = step.data.keyinfo = keyInfo;

        // Get user from setup data.
        passbolt.setup.get('user')
          .then(function (user) {
            step.data.user = user;

            var status = 'success';

            keyInfo = step._keyInfoFormat(keyInfo);

            var fieldsDetails = step._initCheckKeyInfoStatus(keyInfo, user);
            if (Object.keys(fieldsDetails).length) {
              status = 'warning';
            }

            // Key expired.
            // @todo key expired in key info page

            // Pass the fields details to the view.
            step.viewData.fieldsDetails = fieldsDetails;

            // Pass the status to the view.
            step.viewData.status = step.data.status = status;
          })
          .then(null, function () {
            passbolt.setup.fatalError('could not retrieve user');
          });
      })
      .then(null, function () {
        passbolt.setup.fatalError('could not retrieve private key');
      });
  };

  /**
   * Implements start().
   */
  step.start = function () {
    if (step.data.status == 'error') {
      passbolt.setup.setActionState('submit', 'disabled');
    }
  };

  /**
   * Implements submit().
   * @returns Promise
   */
  step.submit = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('submit', 'processing');
      resolve();
    });
  };

  /**
   * Implements cancel().
   * @returns Promise
   */
  step.cancel = function () {
    return new Promise(function(resolve, reject) {
      passbolt.setup.setActionState('cancel', 'processing');
      resolve();
    });
  };

  /* ==================================================================================
   *  Chainable functions.
   * ================================================================================== */

  step._getKeyInfo = function (privateKeyArmored) {
    return passbolt.request('passbolt.keyring.public.info', privateKeyArmored)
      .then(function (keyInfo) {
        return keyInfo;
      });
  };

  /* ==================================================================================
   *  Business functions
   * ================================================================================== */

  /**
   * Check whether the key contains similar information as user details.
   *
   * If not, build an array of differences and return it.
   * The aim is to display the differences on the page.
   *
   * @param keyInfo {object} The key settings
   * @param user {object} The user who follows the setup
   * @returns {array}
   * @private
   */
  step._initCheckKeyInfoStatus = function (keyInfo, user) {
    var fieldsDetails = {};

    // Check if name is different from the one defined by the administrator.
    if (user.firstname + ' ' + user.lastname != keyInfo.userIds[0].name) {
      fieldsDetails['name'] = {
        status: 'warning',
        rule: 'match',
        original: user.firstname + ' ' + user.lastname
      };
    }

    // Check if email different from the one defined by the administrator.
    if (user.username != keyInfo.userIds[0].email) {
      fieldsDetails['email'] = {
        status: 'warning',
        rule: 'match',
        original: user.username
      };
    }

    return fieldsDetails;
  };

  /**
   * Format key info object to match our needs.
   *
   * Our needs are basically to remove the comment from the name, so we can compare it
   * with the user name.
   *
   * @param keyInfo {object} The key settings
   * @returns {array}
   * @private
   */
  step._keyInfoFormat = function (keyInfo) {
    // Remove comment from owner name (by default key info returns name with key comment in bracket. we don't want it).
    var ownerName = keyInfo.userIds[0].name;
    ownerName = $.trim(ownerName.replace(/\(.+\)/, ''));
    keyInfo.userIds[0].name = ownerName;
    return keyInfo;
  };

  passbolt.setup.steps[step.id] = step;

});
