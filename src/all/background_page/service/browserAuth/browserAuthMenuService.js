const MENU_ID = "passbolt-authorize-cli";

let nativePort = null;
let reconnectTimer = null;
let activeAuthWindowId = null;

export default class BrowserAuthMenuService {
  static register() {
    const isMv3 = browser.runtime.getManifest().manifest_version === 3;
    const contexts = [isMv3 ? "action" : "browser_action", "page"];
    if (
      typeof navigator !== "undefined" &&
      navigator.userAgent &&
      navigator.userAgent.toLowerCase().includes("firefox")
    ) {
      contexts.push("tools_menu");
    }
    browser.contextMenus.create(
      {
        id: MENU_ID,
        title: "Authorize CLI",
        contexts,
      },
      () => {
        // An existing menu after background restart is harmless.
        void browser.runtime.lastError;
      },
    );

    browser.contextMenus.onClicked.addListener((info) => {
      if (info.menuItemId === MENU_ID) {
        BrowserAuthMenuService.openDialog();
      }
    });

    browser.windows.onRemoved.addListener((windowId) => {
      if (windowId === activeAuthWindowId) {
        activeAuthWindowId = null;
      }
    });

    BrowserAuthMenuService.startNativeListener();
  }

  static openDialog() {
    if (activeAuthWindowId !== null) {
      browser.windows
        .remove(activeAuthWindowId)
        .catch(() => {})
        .finally(() => {
          activeAuthWindowId = null;
          BrowserAuthMenuService.createDialog();
        })
        .catch(() => {});
      return;
    }
    BrowserAuthMenuService.createDialog();
  }

  static createDialog() {
    browser.windows
      .create({
        url: browser.runtime.getURL("browser-auth.html"),
        type: "popup",
        width: 620,
        height: 520,
      })
      .then((win) => {
        activeAuthWindowId = win.id;
        return win;
      })
      .catch((err) => {
        console.warn("Could not create authorization dialog:", err);
      });
  }

  static startNativeListener() {
    if (nativePort) {
      return;
    }
    try {
      try {
        nativePort = browser.runtime.connectNative("dev.haspr.cli");
      } catch (err) {
        nativePort = browser.runtime.connectNative("com.passbolt.cli");
      }
      nativePort.onMessage.addListener((message) => {
        if (message && message.action === "open-auth-dialog") {
          BrowserAuthMenuService.openDialog();
        }
      });
      nativePort.onDisconnect.addListener(() => {
        nativePort = null;
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            BrowserAuthMenuService.startNativeListener();
          }, 2000);
        }
      });
      nativePort.postMessage({ action: "listen" });
    } catch (err) {
      console.warn("Could not connect to native messaging host com.passbolt.cli:", err);
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          BrowserAuthMenuService.startNativeListener();
        }, 5000);
      }
    }
  }
}
