/**
 * Dialog controller for export passwords / choose format and options main Dialog.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Constructor
 * @param settings the settings
 *   onSubmit (compulsory): the action to execute on a onSubmit.
 * @constructor
 */
var ExportPasswordsDialog = function(settings) {
  this.selectedFormat = null;

  this.$html = null;
  this.$submit = null;
  this.$formatSelect = null;
  this.$closeButton = null;
  this.$cancelButton = null;

  if (settings != undefined && settings.onSubmit != undefined) {
    this.onSubmit = settings.onSubmit;
  }
};

/**
 * Show dialog and initialize elements and events.
 */
ExportPasswordsDialog.prototype.show = function() {
  var self = this;

  // Get details related to the export. (number of passwords to be exported),
  // so we can display it to the user.
  passbolt.request('passbolt.export-passwords.get-details').then(function(details) {
    passbolt.html.getTemplate('export/exportPasswordsMainDialog.ejs').then(function(tpl) {
      self.$html = $(tpl.call(self, details));
      $('body').append(self.$html);
      self._initElements();
      self._initEvents();
    });
  });
};

/**
 * Close dialog.
 */
ExportPasswordsDialog.prototype.close = function() {
  this.$html.remove();
};

/**
 * Destroy dialog.
 * This includes closing and destroying the parent iframe.
 */
ExportPasswordsDialog.prototype.destroy = function() {
  this.close();
  passbolt.request('passbolt.export-passwords.close-dialog');
};

/**
 * Initialize dialog elements.
 * @private
 */
ExportPasswordsDialog.prototype._initElements = function() {
  this.$formatSelect = $('#export-format', this.$html);
  this.$submit = $(':submit', this.$html);
  this.$closeButton = $('.dialog-close', this.$html);
  this.$cancelButton = $('.cancel', this.$html);
  this.selectedFormat = this.$formatSelect.val();
};

/**
 * Initialize dialog events.
 * @private
 */
ExportPasswordsDialog.prototype._initEvents = function() {
  var self = this;

  this.$submit.on('click', function(evt) {
    evt.stopImmediatePropagation();
    self.onSubmit(self.selectedFormat);
    return false;
  });

  this.$closeButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.destroy();
  });

  this.$cancelButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.destroy();
  });

  this.$formatSelect.on('change', function(ev) {
    ev.stopImmediatePropagation();
    self.selectedFormat = self.$formatSelect.val();
  });
};