/**
 * Template helper.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

(function( exports ) {

  // The callbacks associated to each template retrieving request.
  var callbacks = {};

  /**
   * A template has been retrieved and sent back by the addon.
   */
  self.port.on('passbolt.template.send', function(tpl, t) {
    if (callbacks[t] && typeof callbacks[t] == 'function') {
      callbacks[t](tpl);
      delete callbacks[t];
    }
  });

  /**
   * Get a template and execute a callback while the template is retrieved.
   * @param tpl
   * @param callback
   */
  var getTpl = function(templatePath, callback) {
    var token = Math.round(Math.random() * Math.pow(2, 32));
    callbacks[token] = callback;
    self.port.emit('passbolt.template.get', templatePath, token);
  };
  exports.getTpl = getTpl;

  /**
   * Initialize page with a template.
   */
  var initPageTpl = function(options) {
    getTpl(self.options.templatePath, function(tpl) {
      // Additional data to pass to the template renderer.
      var ejsParams = {
        addonDataPath: self.options.addonDataPath
      };
      $.extend(ejsParams, options);

      // Render the page template.
      var html = new EJS({text: tpl}).render(ejsParams);
      $('body').html(html);

      // When ready trigger the template-ready event.
      $(document).trigger('template-ready');
    });
  };
  exports.initPageTpl = initPageTpl;

})(this);
