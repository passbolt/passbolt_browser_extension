/**
 * Dialog controller for kdbx credentials. Can be used for import and export.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Constructor.
 * @param object settings
 *   onSubmit (compulsory): on submit handler.
 *   title: dialog title
 *   ctaName: label of the submit button
 * @constructor
 */
var KdbxCredentialsDialog = function(settings) {
  this.$html = null;
  this.$password = null;
  this.$passwordClear = null;
  this.$viewPasswordButton = null;
  this.$keyFile = null;
  this.$closeButton = null;
  this.$cancelButton = null;
  this.$submitButton = null;
  this.onSubmit = settings.onSubmit;
  this.title = settings.title || "Enter the password and/or key file";
  this.ctaLabel = settings.ctaLabel || "Submit";
};

/**
 * Show dialog.
 */
KdbxCredentialsDialog.prototype.show = function() {
  var self = this;
  passbolt.html.getTemplate('import/kdbxCredentials.ejs').then(function(tpl) {
    self.$html = $(tpl.call(self));

    self._initElements();
    self._initEvents();
    self._initFileChooser();
    self._initPasswordField();

    $('body').append(self.$html);
  });
};

/**
 * Close dialog.
 */
KdbxCredentialsDialog.prototype.close = function() {
  this.$html.remove();
};

/**
 * Initialize elements.
 * @private
 */
KdbxCredentialsDialog.prototype._initElements = function() {
  this.$password = $('#js_field_passphrase', this.$html);
  this.$keyFile = $('#js_field_key_file', this.$html);
  this.$viewPasswordButton = $('#js_secret_view', this.$html);
  this.$passwordClear = $('#js_field_password_clear', this.$html);
  this.$closeButton = $('.dialog-close', this.$html);
  this.$cancelButton = $('.cancel', this.$html);
  this.$submitButton = $(':submit', this.$html);
};

/**
 * Initialize events.
 * @private
 */
KdbxCredentialsDialog.prototype._initEvents = function() {
  var self = this;
  this.$closeButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.close();
    return false;
  });

  this.$cancelButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.close();
    return false;
  });

  this.$submitButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    var password = self.$password.val();
    if (password === "") {
      password = null;
    }
    var keyFile = self.$keyFile.prop('files')[0];
    self.onSubmit(password, keyFile);
    self.close();
    return false;
  });
};

/**
 * On click event on the view button.
 */
KdbxCredentialsDialog.prototype.onViewPassword = function () {
  if (this.$password.hasClass('hidden')) {
    this.$password.removeClass('hidden');
    this.$passwordClear.addClass('hidden');
    this.$viewPasswordButton.removeClass('selected');
  } else {
    this.$password.addClass('hidden');
    this.$passwordClear.removeClass('hidden');
    this.$passwordClear.val(this.$password.val());
    this.$viewPasswordButton.addClass('selected');
  }
};

/**
 * Initialize file chooser.
 * @private
 */
KdbxCredentialsDialog.prototype._initFileChooser = function() {
  this.$keyFile.jfilestyle({
    text: this.$keyFile.data('text'),
    placeholder: this.$keyFile.data('placeholder')
  });
};

/**
 * Initialize password field.
 * @private
 */
KdbxCredentialsDialog.prototype._initPasswordField = function() {
  var self = this;
  this.$viewPasswordButton.on('click', function (ev) {
    ev.stopImmediatePropagation();
    self.onViewPassword();
    return false;
  });

  this.$passwordClear.on('input change', function(ev) {
    self.$password.val(self.$passwordClear.val());
  });
};