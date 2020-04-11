/**
 * Dialog controller for import passwords report Dialog.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

/**
 * Controller.
 * @param object results
 * @constructor
 */
const ImportPasswordsReportDialog = function(results) {
  this.resources = results.resources;
  this.folders = results.folders;
  this.responses = results.responses;
  this.importTag = results.importTag;
  this.tagsIntegration = results.tagsIntegration;
  this.foldersIntegration = results.foldersIntegration;

  // elements.
  this.$html = null;
  this.$closeButton = null;
  this.$okButton = null;
  this.$accordionHeader = null;
};

/**
 * Initialize dialog elements.
 * @private
 */
ImportPasswordsReportDialog.prototype._initElements = function() {
  this.$closeButton = $('.dialog-close', this.$html);
  this.$okButton = $(':submit', this.$html);
  this.$accordionHeader = $('.accordion-header', this.$html);
};

/**
 * Initialize dialog events.
 * @private
 */
ImportPasswordsReportDialog.prototype._initEvents = function() {
  const self = this;

  this.$accordionHeader.click(function (e) {
    const $content = $(this).next();
    if ($content.is(':hidden')) {
      $content.slideDown(50);
    } else {
      $content.slideUp(25);
    }
    $content.parent().toggleClass('closed');
    return false;
  });

  this.$closeButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.destroy();
    return false;
  });

  this.$okButton.on('click', function(ev) {
    ev.stopImmediatePropagation();
    self.destroy();
    return false;
  });
};

/**
 * Show dialog and initialize elements and events.
 */
ImportPasswordsReportDialog.prototype.show = function() {
  const self = this;

  passbolt.html.getTemplate('import/importPasswordsReportDialog.ejs').then(function(tpl) {
    self.$html = $(tpl.call(self));
    $('body').append(self.$html);
    self._initElements();
    self._initEvents();
  });
};

/**
 * Close dialog.
 */
ImportPasswordsReportDialog.prototype.close = function() {
  this.$html.remove();
};

/**
 * Destroy dialog.
 * This includes closing and destroying the parent iframe.
 */
ImportPasswordsReportDialog.prototype.destroy = function() {
  this.close();
  passbolt.request('passbolt.import-passwords.close-dialog');
};
