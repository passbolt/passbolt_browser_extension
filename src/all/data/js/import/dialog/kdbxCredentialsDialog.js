/**
 * Controller for kdbxCredentials Dialog.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var KdbxCredentialsDialog = function(settings) {
  this.$html = null;
  this.$password = null;
  this.$keyFile = null;
  this.onSubmit = settings.onSubmit;
};

KdbxCredentialsDialog.prototype.show = function() {
  var self = this;
  passbolt.html.getTemplate('import/kdbxCredentials.ejs').then(function(tpl) {
    self.$html = $(tpl.call(self));
    self.$password = $('#js_field_passphrase', self.$html);
    self.$keyFile = $('#js_field_key_file', self.$html);

    self._initFileChooser();
    self._initEvents();

    $('body').append(self.$html);
  });
};

KdbxCredentialsDialog.prototype.close = function() {
  // var id = this.$html.attr('id');
  // $('#' + id).remove();
  this.$html.remove();
};

KdbxCredentialsDialog.prototype._initEvents = function() {
  var self = this;
  $('.dialog-close, .cancel', this.$html).on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.close();
  });

  $(':submit', this.$html).on('click', function(ev) {
    ev.stopImmediatePropagation();
    var password = self.$password.val();
    var keyFile = self.$keyFile.val();
    self.onSubmit(password, keyFile);
    self.close();
    return false;
  });

};

KdbxCredentialsDialog.prototype._initFileChooser = function() {
  this.$keyFile.jfilestyle({
    text: this.$keyFile.data('text'),
    placeholder: this.$keyFile.data('placeholder')
  });
};