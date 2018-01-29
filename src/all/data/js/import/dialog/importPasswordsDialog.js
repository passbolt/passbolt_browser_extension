/**
 * Controller for import passwords / choose file Dialog.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var ImportPasswordsDialog = function(settings) {
  this.$html = null;
  this.$file = null;
  this.$fileFeedback = null;
  this.supportedExtensions = ['csv', 'kdbx'];
  this.$submit = null;
  this.selectedFile = null;

  if (settings != undefined && settings.onSubmit != undefined) {
    this.onSubmit = settings.onSubmit;
  }
};

ImportPasswordsDialog.prototype.show = function() {
  var self = this;

  passbolt.html.getTemplate('import/importPasswordsChooseFile.ejs').then(function(tpl) {
    self.$html = $(tpl.call(self));
    $('body').append(self.$html);
    self._initElements();
    self._initEvents();
  });
};

ImportPasswordsDialog.prototype._initElements = function() {
  this.$file = $(":file", this.$html);
  this.$fileFeedback = $('#js_field_file_feedback', this.$html);
  this.$submit = $(':submit', this.$html);

  this._initFileChooser();

  this.$submit
  .addClass('disabled')
  .attr('disabled', 'disabled');
};

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
};

ImportPasswordsDialog.prototype._initFileChooser = function() {
  this.$file.jfilestyle({
    text: this.$file.data('text'),
    placeholder: this.$file.data('placeholder')
  });
  $('.jfilestyle label', this.$html).addClass('primary');
};

ImportPasswordsDialog.prototype.onFileSelect = function(evt) {
  this.selectedFile = evt.target.files[0];
  if (this.validateFileExtension(this.selectedFile.name)) {
    $('.jfilestyle label', this.$html).removeClass('primary');
    this.$submit
    .removeClass('disabled')
    .removeAttr('disabled');
  }
};

ImportPasswordsDialog.prototype.validateFileExtension = function(fileName) {
  let ext = ImportPasswordsDialog.getFileExtension(fileName);
  if (this.supportedExtensions.indexOf(ext) == -1) {
    this.showError('The file extension is invalid. Supported extensions are .csv and .kdbx');
    return false;
  }
  this.clearError();
  return true;
};

ImportPasswordsDialog.getFileExtension = function(fileName) {
  return fileName.split('.').pop();
};

ImportPasswordsDialog.prototype.showError = function(error) {
  this.$file.parent().addClass('error');
  this.$fileFeedback.addClass('error').text(error);
};

ImportPasswordsDialog.prototype.clearError = function() {
  this.$file.parent().removeClass('error');
  this.$fileFeedback.removeClass('error').text('');
};