/**
 * HTML Helper.
 *
 * @copyright (c) 2017 Passbolt SARL
 * @licence GNU Affero General Public License http://www.gnu.org/licenses/agpl-3.0.en.html
 */

var passbolt = passbolt || {};
passbolt.html = passbolt.html || {};
passbolt.templates = window.templates;

(function (passbolt) {
  /**
   * Resize an iframe container regarding its content size.
   * Call this method from the iframe content scope.
   *
   * @param selector The target iframe container css selector
   * @param options
   * @param options.width
   * @param options.height
   */
  var resizeIframe = function (selector, options) {
    // Get the dimension of the current document.
    var dimension = {
      width: $('html').outerWidth(),
      height: $('html').outerHeight() + 6
    };
    // If options given, override the dimensions found before.
    if (typeof options != 'undefined') {
      if (options.width) {
        dimension.width = options.width;
      }
      if (options.height) {
        dimension.height = options.height + 6; // account for border;
      }
    }
    if (dimension.height < 52) {
      dimension.height = 52;
    }
    // Request the application worker to resize the iframe container.
    passbolt.message.emit('passbolt.passbolt-page.resize-iframe', selector, dimension);
  };
  passbolt.html.resizeIframe = resizeIframe;

  /**
   * Get template
   * @param path The template path.
   * @return {Promise.<T>|*}
   */
  var getTemplate = function (path) {
    return new Promise(function(resolve, reject) {
      var template = path.replace('data/tpl/','').replace('.ejs', '').split('/');
      if (typeof window.templates === 'undefined') {
        reject(new Error('Passbolt templates are not defined. Check if one or more js templates are included.'));
      }
      if (typeof window.templates[template[0]] === 'undefined') {
        reject(new Error('The following passbolt template group is missing or not included: ' + path));
      }
      if (typeof window.templates[template[0]][template[1]] === 'undefined') {
        reject(new Error('The following passbolt template is missing or not included: ' + path));
      }
      resolve(window.templates[template[0]][template[1]]);
    });
  };
  passbolt.html.getTemplate = getTemplate;

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
  var loadTemplate = function (selector, path, loadStrategy, data) {
    if (!loadStrategy) {
      loadStrategy = 'html';
    }
    return getTemplate(path)
      .then(function (tpl) {
        // Render the template.
        var html = tpl.call(this, data);
        return $(selector)[loadStrategy](html);
      }, function(e) {
        console.error(e.message);
      });
  };
  passbolt.html.loadTemplate = loadTemplate;

  /**
   * Return the browser name (best guess)
   * This should be used for view enhancement purposes not to change
   * functionalities or behaviors
   */
  var getBrowserName = function () {
    var userAgent = window.navigator.userAgent;
    if (typeof userAgent != 'undefined') {
      if (userAgent.indexOf('Firefox') != -1 || userAgent.indexOf('Seamonkey') != -1) {
        return 'firefox';
      }
      if (userAgent.indexOf('Chrome') != -1 || userAgent.indexOf('Chromium') != -1) {
        return 'chrome'
      }
      return 'unsupported';
    }
  };
  passbolt.html.getBrowserName = getBrowserName;

  /**
   *
   * @param iframeId string
   * @param iframeUrlOptions Object
   * @param appendTo string acting as jQuery selector
   * @param className string (optional)
   * @returns {*|jQuery|HTMLElement}
   */
  var insertIframe = function (iframeId, appendTo, className, iframeUrlOptions, insertMode, style) {
    // set defaults
    const mode = insertMode || 'append';
    const css = style || '';
    const urlOptions = iframeUrlOptions || {};
    const cssClass = className || '';

    // build iframe url
    var iframeUrl = chrome.runtime.getURL('data/' + iframeId +'.html') + `?passbolt=${iframeId}&`;
    let optionUrl = [];
    for (var options in urlOptions)
      if (iframeUrlOptions.hasOwnProperty(options)) {
        optionUrl.push(`${options}=${iframeUrlOptions[options]}`);
      }
    iframeUrl += optionUrl.join("&");

    // Build iframe html element
    var $iframe = $('<iframe/>', {
      id: iframeId,
      src: iframeUrl,
      class: cssClass,
      frameBorder: 0,
      style: css
    });

    // Append or prepend
    if (mode === 'append') {
      $iframe.appendTo(appendTo);
    } else {
      $iframe.prependTo(appendTo);
    }
    return $iframe;
  };
  passbolt.html.insertIframe = insertIframe;

  /**
   *
   * @param iframeId string
   * @param appendTo string acting as jQuery selector
   * @param iframeUrlOptions Object
   * @param className string (optional)
   * @param insertMode string append or prepend
   * @param style string optional
   * @returns {*|jQuery|HTMLElement}
   */
  var insertThemedIframe = async function (iframeId, appendTo, className, iframeUrlOptions, insertMode, style) {
    const urlOptions = iframeUrlOptions || {};
    try {
      urlOptions['theme'] = await passbolt.request('passbolt.user.settings.get.theme');
    } catch (e) {
      // no themes, no problem
    }
    return insertIframe(iframeId, appendTo, className, urlOptions, insertMode, style);
  };
  passbolt.html.insertThemedIframe = insertThemedIframe;

})(passbolt);
