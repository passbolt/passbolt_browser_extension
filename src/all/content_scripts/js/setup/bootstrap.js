/**
 * Setup bootstrap.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

$(function () {
  // If the expected username field is not provided, do not launch the setup.
  if (!$('#js_setup_user_username').length) {
    return;
  }

  // Collect the setup information and redirect the user to the second step.
  var data = {
    domain: '',
    userId: '',
    token: '',
    username: '',
    firstName: '',
    lastName: '',
    workflow: ''
  };

  // If this script is loaded, that means the current page is targeting the first step of
  // the setup. The step which is provided by the backend of passbolt.
  // Retrieve all the information we need from the url.
  const uuidRegex = "[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[0-5][a-fA-F0-9]{3}-[089aAbB][a-fA-F0-9]{3}-[a-fA-F0-9]{12}";
  const setupBootstrapRegex = `(.*)\/setup\/(install|recover)\/(${uuidRegex})\/(${uuidRegex})`;
  var regex = new RegExp(setupBootstrapRegex),
    matches = regex.exec(window.location.href);

  if (matches != null) {
    data.domain = matches[1];
    data.workflow = (matches[2] === 'recover') ? 'recover' : 'install';
    data.userId = matches[3];
    data.token = matches[4];

    // Retrieve the user information given on the page.
    data.username = $('#js_setup_user_username').val();
    data.lastName = $('#js_setup_user_last_name').val();
    data.firstName = $('#js_setup_user_first_name').val();

    // Notify the add-on that the user perform a plugin check operation, either by clicking
    // on the retry button after he installed the plugin, or loading the server setup bootstrap
    // with the plugin already installed.
    // What will redirect him onto the second step of the wizard.
    self.port.emit('passbolt.setup.plugin_check', data);
  }
});
