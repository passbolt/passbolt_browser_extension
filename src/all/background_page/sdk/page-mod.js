/**
 * Passbolt ~ Open source password manager for teams
 * Copyright (c) Passbolt SA (https://www.passbolt.com)
 *
 * Licensed under GNU Affero General Public License version 3 of the or any later version.
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Passbolt SA (https://www.passbolt.com)
 * @license       https://opensource.org/licenses/AGPL-3.0 AGPL License
 * @link          https://www.passbolt.com Passbolt(tm)
 * @since         2.0.0
 */
import browser from "../sdk/polyfill/browserPolyfill";
import {Worker as Workers} from "../model/worker";
import ScriptExecution from "../sdk/scriptExecution";
import Worker from "../sdk/worker";
import {Uuid} from "../utils/uuid";
import Log from "../model/log";


/**
 * PageMod Class
 *
 * This class controls the insertions of content scripts in a page as well as a port name
 * When a content script is inserted it will establish a connection using the port name to the background page
 * Once the connection is establish the pagemod will create a Worker, and attach events to it. This
 * way the content script can request the background page for info and/or run sensitive logic.
 *
 * For Webextension Data Iframe the system is similar, it open ports data script can connect to and
 * create the associated worker, bind the events, etc. The only difference is the pagemod does not insert the
 * scripts, the html of the data page does.
 *
 * Format is weird because it was acting historically as a wrapper for chrome
 * to match the old Firefox SDK.
 */
class PageMod {
  /**
   * Constructor
   * @param {object} args
   */
  constructor(args) {
    if (typeof args === 'undefined') {
      throw new TypeError('Invalid pagemod. No argument provided');
    }
    this.args = args;
    this._ports = {}; // Object{tabid:port, ...} for which the pagemod has a port available
    this._listeners = []; // list of listeners initialized by this pagemod
    this.__init();
  }

  /**
   * PageMod Destroy
   */
  destroy() {
    /*
     * Stops the page-mod from making any more modifications.
     * Once destroyed the page-mod can no longer be used.
     * Modifications already made to open documents by content scripts will not be undone
     * Unsuported: stylesheets added by contentStyle or contentStyleFile, will be unregistered immediately.
     */
    if (typeof this._listeners['chrome.tabs.onRemoved'] !== 'undefined') {
      chrome.tabs.onRemoved.removeListener(this._listeners['chrome.tabs.onRemoved']);
      chrome.tabs.onReplaced.removeListener(this._listeners['chrome.tabs.onReplaced']);
      chrome.tabs.onUpdated.removeListener(this._listeners['chrome.tabs.onUpdated']);
    }

    if (typeof this._listeners['chrome.runtime.onConnect'] !== 'undefined') {
      chrome.runtime.onConnect.removeListener(this._listeners['chrome.runtime.onConnect']);
    }
    // clear the tab and listeners
    this._ports = {};
    this._listeners = [];
  }

  /*
   * =====================================================================
   * Private functions
   * Not to be called directly
   * =====================================================================
   */
  /**
   * PageMod Init
   */
  __init() {
    // The url to use for the pageMod include is not a regex
    if (!(this.args.include instanceof RegExp)) {
      if (this.args.include.startsWith('about:blank')) {
        /*
         * For URL patterns like 'about:blank?passbolt=passbolt-iframe*'
         * Contrarily to Firefox we do not inject scripts in the page
         * They are loaded via chrome-extension://[pluginid]/js/iframe.html templates
         * We wait for the page mod to initiate the connection
         */
        this.__onIframeConnectInit();
        return;
      } else if (this.args.include.startsWith(chrome.runtime.getURL(''))) {
        // And similarly for any chrome-extension:// urls
        this.__onContentConnectInit();
        return;
      } else {
        this.args.include = new RegExp(this.args.include);
      }
    }

    /*
     * When a tab is updated we try to insert content code if it matches
     * the include and contentScriptWhen pageMod parameters
     */
    this._listeners['chrome.tabs.onUpdated'] = async(tabId, changeInfo, tab) => {
      /*
       * Temporarily fixing a bug seen with Chrome 99. tab doesn't always have defined url, title and favIconUrl properties.
       * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1305284&sort=-opened&q=tabs.onUpdated&can=1
       */
      if (typeof tab.url === 'undefined' && changeInfo?.status === 'complete') {
        tab = await browser.tabs.get(tabId);
      }
      this.__onTabUpdated(tabId, changeInfo, tab);
    };
    chrome.tabs.onUpdated.addListener(this._listeners['chrome.tabs.onUpdated']);

    /*
     * Sometimes the page is loaded from the cache and the 'onUpdate' listener is
     * not fired. To make sure we cover that case we listen to 'onReplaced' events
     * fired when a tab is replaced with another tab due to prerendering or instant.
     * see. https://bugs.chromium.org/p/chromium/issues/detail?id=109557
     */
    this._listeners['chrome.tabs.onReplaced'] = (addedTabId, removedTabId) => {
      chrome.tabs.get(addedTabId, tab => {
        chrome.tabs.get(removedTabId, oldTab => {
          Log.write({level: 'debug', message: `sdk/pageMod::__init ${this.args.name} processing chrome.tabs.onReplaced ${addedTabId} ${removedTabId} ${tab.url} ${oldTab.url}`});
        });
        this.__onTabUpdated(tab.id, {status: 'complete'}, tab);
      });
    };
    chrome.tabs.onReplaced.addListener(this._listeners['chrome.tabs.onReplaced']);

    /*
     * Using attachto a pagemod can be launched to an already opened tab
     * Useful after an install or a reinstall
     * see. attachTo: ["existing", "top"]
     * Existing = attach to already opened tab (default not)
     * Top = attach to only top document and not iframes (we can't attach to iframe in chrome anyway)
     */
    if (typeof this.args.attachTo !== 'undefined') {
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          this.__onAttachExistingTab(tab, this.args.attachTo.reload);
        });
      });
    }

    // When a tab is closed cleanup
    this._listeners['chrome.tabs.onRemoved'] = tabId => {
      Log.write({level: 'debug', message: `sdk/pagemod::__init::onRemovedListener tab:${tabId}`});
      if (tabId in this._ports) {
        delete this._ports[tabId];
      }
    };
    chrome.tabs.onRemoved.addListener(this._listeners['chrome.tabs.onRemoved']);
  }

  /**
   * Manage runtime.onConnect listeners
   *
   * @param {string} portName
   * @param {int|undefined} tabId
   * @param {string|undefined} iframe
   * @private
   */
  __initConnectListener(portName, tabId, iframe) {
    if (typeof iframe === 'undefined') {
      iframe = false;
    }
    this._listeners['chrome.runtime.onConnect'] = async port => {
      // check if the portname match
      if (port.name === portName) {
        /*
         * if there is a connection on the port for a pagemod that
         * was previously matching on that tab but not anymore
         */
        if (!iframe && !this.__checkUrl(port.sender.tab.url)) {
          // detach any existing worker
          if (Workers.exists(this.args.name, port.sender.tab.id)) {
            Workers.get(this.args.name, port.sender.tab.id).destroy('destroying worker because url changed');
          }
          return;
        }

        // add the sender tab id to the list of active tab for that worker
        if (typeof tabId === 'undefined' || tabId === port.sender.tab.id) {
          this._ports[port.sender.tab.id] = port;
          const worker = new Worker(port, port.sender.tab, iframe, this);
          await this.args.onAttach(worker);
          // Notify the content script that the pagemod is ready to communicate.
          worker.port.emit("passbolt.port.ready");
        }
      }
    };
    chrome.runtime.onConnect.addListener(this._listeners['chrome.runtime.onConnect']);
  }

  /**
   * iFrame port init
   * @private
   */
  __onIframeConnectInit() {
    /*
     * We use the passbolt part of the location for ifrrame portname
     * e.g. about:blank?passbolt=iframeId
     */
    let iframeId = this.args.include.split('passbolt=')[1];
    iframeId = iframeId.replace('*', '');
    this.portname = iframeId;
    Log.write({level: 'debug', message: `sdk/pageMod::__onIframeConnectInit ${this.args.name} iframe opening port on ${this.portname}`});
    this.__initConnectListener(this.portname, undefined, true);
  }

  /**
   * Content code port init
   * @private
   */
  __onContentConnectInit() {
    // We use the content file name as portname
    let portname = this.args.include;
    const replaceStr = chrome.runtime.getURL('/data/');
    portname = portname.replace(replaceStr, '').replace('.html', '');
    this.portname = portname;
    Log.write({level: 'debug', message: `sdk/pageMod::__onContentConnectInit ${this.args.name} content opening port on ${this.portname}`});
    this.__initConnectListener(this.portname);
  }

  /**
   * When a pagemod is requested on an already opened tab
   *
   * Refresh the page so that it can trigger a proper onTabUpdate
   * so that we have a clean state. Note that we can't just proceed with a onTabUpdate as
   * here might be some scripts already included in the page and we can't remove them
   *
   * @param {Tab} tab
   * @param {boolean} reload (optional) default true
   * @private
   */
  __onAttachExistingTab(tab, reload) {
    /*
     * We can't insert scripts if the url is not https or http
     * as this is not allowed, instead we insert the scripts manually in the background page if needed
     */
    if (!(tab?.url?.startsWith('http://') || tab?.url?.startsWith('https://'))) {
      return;
    }
    if (typeof reload === 'undefined') {
      reload = true;
    }

    // if the url match the pagemod requested pattern
    if (this.__checkUrl(tab.url)) {
      if (reload) {
        Log.write({level: 'debug', message: `Attaching pagemod on an existing tab, reload the tab @ tab:${tab.id}, pagemod: ${this.args.name}, url:${tab.url}, function: PageMod.__onAttachExistingTab()`});
        chrome.tabs.reload(tab.id);
      } else {
        Log.write({level: 'debug', message: `Attaching pagemod on an existing tab, reinsert the CS @ tab:${tab.id}, pagemod: ${this.args.name}, url:${tab.url}, function: PageMod.__onAttachExistingTab()`});
        this.__onTabUpdated(tab.id, {status: 'complete'}, tab);
      }
    }
  }

  /**
   * When a tab is updated
   *
   * @param {string} tabId
   * @param {object} changeInfo
   * @param {Tab} tab
   * @private
   */
  __onTabUpdated(tabId, changeInfo, tab) {
    /*
     * firefox sometimes fires changes with undefined status
     * ignore that garbage
     */
    if (changeInfo.status === undefined) {
      return;
    }
    // ignore loading requests
    if (changeInfo.status !== 'complete') {
      return;
    }

    /*
     * ignore requests that have changeInfo.url set.
     * they are only triggered by firefox in case of tab restore and proved buggy
     */
    if (changeInfo.url !== undefined) {
      return;
    }
    // ignore about:blank urls they can not be interacted with anyway
    if (tab.url === 'about:blank') {
      return;
    }
    /*
     * We can't insert scripts if the url is not https or http
     * as this is not allowed, instead we insert the scripts manually in the background page if needed
     */
    if (!(tab?.url?.startsWith('http://') || tab?.url?.startsWith('https://'))) {
      return;
    }
    // Check if pagemod url pattern match tab url
    if (!this.__checkUrl(tab.url)) {
      return;
    }

    Log.write({level: 'debug', message: `sdk/pageMod::__onTabUpdated ${this.args.name} processing chrome.tabs.onUpdated ${tabId} ${changeInfo.status} ${changeInfo.url} ${tab.url}`});

    /*
     * if there is not already a worker in that tab
     * generate a portname based on the tab it and listen to connect event
     * otherwise reuse the already an active worker in that tab to accept incoming connection
     */
    this.portname = `port-${Uuid.get(tabId.toString())}`;
    //if (this._ports.indexOf(tabId) === -1) {
    if (!(tabId in this._ports)) {
      this.__initConnectListener(this.portname, tabId);
    } else {
      try {
        /*
         * try to post a message in that port
         * If the port is disconnected, an error is thrown.
         */
        this._ports[tabId].postMessage('passbolt.port.check');
        /*
         * If there is not error it means there is already a content script running
         * and we do not need to include it a second time
         */
        return;
      } catch (error) {
        // If the port is not open / does not exist, we proceed to include scripts
      }
    }

    // a helper to handle insertion of scripts, variables and css in target page
    const scriptExecution = new ScriptExecution(tabId);

    // set portname in content code as global variable to be used by data/js/port.js
    scriptExecution.injectPortname(this.portname);

    // Inject JS files if needed
    const scripts = this.args.contentScriptFile.slice();
    scriptExecution.injectJs(scripts);

    // Inject CSS files if needed
    if (typeof this.args.contentStyleFile !== 'undefined') {
      const styles = this.args.contentStyleFile.slice();
      if (styles.length > 0) {
        scriptExecution.injectCss(styles);
      }
    }
  }

  /**
   * Check if a given URL match the pattern provided in the args
   *
   * @param url
   * @returns {boolean}
   * @private
   */
  __checkUrl(url) {
    return (url.match(this.args.include));
  }
}

export default PageMod;
