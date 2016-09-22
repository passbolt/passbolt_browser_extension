/**
 * HTML Helper.
 *
 * @copyright (c) 2015-present Bolt Softwares Pvt Ltd
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.helper = passbolt.helper || {};
passbolt.helper.html = passbolt.helper.html || {};

(function (passbolt) {

	// Cache the templates.
	var _templatesCache = {};

	/**
	 * Resize an iframe container regarding its content size.
	 * Call this method from the iframe content scope.
	 *
	 * @param selector The target iframe container css selector
	 * @param options
	 * @param options.width
	 * @param options.height
	 */
	var resizeIframe = function(selector, options) {
		// Get the dimension of the current document.
		var dimension = {
			width: $('html').outerWidth(),
			height: $('html').outerHeight()
		};
		// If options given, override the dimensions found before.
		if (typeof options != 'undefined') {
			if (options.width) {
				dimension.width = options.width;
			}
			if (options.height) {
				dimension.height = options.height;
			}
		}
		// Request the application worker to resize the iframe container.
		passbolt.message.emit('passbolt.passbolt-page.resize-iframe', selector, dimension);
	};
	passbolt.helper.html.resizeIframe = resizeIframe;

	/**
	 * Get template
	 * @param path The template path.
	 * @return {Promise.<T>|*}
	 */
	var getTemplate = function(path) {
		// If the template exists in cache.
		if (typeof _templatesCache[path] != 'undefined') {
			var deferred = $.Deferred();
			deferred.resolveWith(this, [_templatesCache[path]]);
			return deferred.promise();
		}

		return passbolt.request('passbolt.template.get', path)
			.then(function(tpl) {
				_templatesCache[path] = tpl;
				return tpl;
			});
	};
	passbolt.helper.html.getTemplate = getTemplate;

	/**
	 * Render a template and add the result to the selector given in parameter.
	 *
	 * @param selector The selector which defines the HTMLElement to add the
	 *   rendered template in it.
	 * @param path The template path.
	 * @param loadStrategy The strategy to use to load the rendered template.
	 * @param data (optional) Data to pass to the rendering engine.
	 * @return {Promise.<T>|*}
	 */
	var loadTemplate = function(selector, path, loadStrategy, data) {
		if (!loadStrategy) {
			loadStrategy = 'html';
		}
		return getTemplate(path)
			.then(function(tpl) {
				// Render the template.
				var html = new EJS({text: tpl}).render(data);
				return $(selector)[loadStrategy](html);
			});
	};
	passbolt.helper.html.loadTemplate = loadTemplate;

})( passbolt );