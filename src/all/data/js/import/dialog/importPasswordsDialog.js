/**
 * Dialog controller for import passwords / choose file main Dialog.
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
var ImportPasswordsDialog = function(settings) {
  this.selectedFile = null;

  this.$html = null;
  this.$file = null;
  this.$fileFeedback = null;
  this.supportedExtensions = ['csv', 'kdbx'];
  this.$submit = null;
  this.$closeButton = null;
  this.$cancelButton = null;

  if (settings != undefined && settings.onSubmit != undefined) {
    this.onSubmit = settings.onSubmit;
  }
};

/**
 * Show dialog and initialize elements and events.
 */
ImportPasswordsDialog.prototype.show = function() {
  var self = this;

  passbolt.html.getTemplate('import/importPasswordsMainDialog.ejs').then(function(tpl) {
    self.$html = $(tpl.call(self));
    $('body').append(self.$html);
    self._initElements();
    self._initEvents();
  });
};

/**
 * Close dialog.
 */
ImportPasswordsDialog.prototype.close = function() {
  this.$html.remove();
};

/**
 * Destroy dialog.
 * This includes closing and destroying the parent iframe.
 */
ImportPasswordsDialog.prototype.destroy = function() {
  this.close();
  passbolt.request('passbolt.import-passwords.close-dialog');
};

/**
 * Initialize dialog elements.
 * @private
 */
ImportPasswordsDialog.prototype._initElements = function() {
  this.$file = $(":file", this.$html);
  this.$fileFeedback = $('#js_field_file_feedback', this.$html);
  this.$submit = $(':submit', this.$html);
  this.$closeButton = $('.dialog-close', this.$html);
  this.$cancelButton = $('.cancel', this.$html);

  this._initFileChooser();

  this.$submit
  .addClass('disabled')
  .attr('disabled', 'disabled');
};

/**
 * Initialize dialog events.
 * @private
 */
ImportPasswordsDialog.prototype._initEvents = function() {
  var self = this;

  this.$file.on('change', function(evt) {
    self.onFileSelect(evt);
  });

  this.$submit.on('click', function(evt) {
    evt.stopImmediatePropagation();
    self.onSubmit(self.selectedFile);
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
};

/**
 * Initialize file chooser.
 * @private
 */
ImportPasswordsDialog.prototype._initFileChooser = function() {
  this.$file.jfilestyle({
    text: this.$file.data('text'),
    placeholder: this.$file.data('placeholder')
  });
  $('.jfilestyle label', this.$html).addClass('primary');
};

/**
 * File selection handler.
 * @param evt
 */
ImportPasswordsDialog.prototype.onFileSelect = function(evt) {
  this.selectedFile = evt.target.files[0];
  if (this.validateFileExtension(this.selectedFile.name)) {
    $('.jfilestyle label', this.$html).removeClass('primary');
    this.$submit
    .removeClass('disabled')
    .removeAttr('disabled');
  }
};

/**
 * Validate a file extension, and show an error if the extension is not supported.
 * @param string fileName
 * @returns {boolean}
 */
ImportPasswordsDialog.prototype.validateFileExtension = function(fileName) {
  let ext = ImportPasswordsDialog.getFileExtension(fileName);
  if (this.supportedExtensions.indexOf(ext) == -1) {
    this.showError('The file extension is invalid. Supported extensions are .csv and .kdbx');
    return false;
  }
  this.clearError();
  return true;
};

/**
 * Get a file extension from a file name.
 * @param fileName
 * @returns String
 */
ImportPasswordsDialog.getFileExtension = function(fileName) {
  return fileName.split('.').pop();
};

/**
 * Show error.
 * @param string error
 */
ImportPasswordsDialog.prototype.showError = function(error) {
  this.$file.parent().addClass('error');
  this.$fileFeedback.addClass('error').text(error);
};

/**
 * Clear error (if any).
 */
ImportPasswordsDialog.prototype.clearError = function() {
  this.$file.parent().removeClass('error');
  this.$fileFeedback.removeClass('error').text('');
};