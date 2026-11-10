import GetActiveAccountService from "../background_page/service/account/getActiveAccountService";
import PassphraseStorageService from "../background_page/service/session_storage/passphraseStorageService";
import GetDecryptedUserPrivateKeyService from "../background_page/service/account/getDecryptedUserPrivateKeyService";
import BrowserAuthCryptoService from "../background_page/service/browserAuth/browserAuthCryptoService";

let port;
let account;
let request;
let busy = false;
let approved = false;

const element = (id) => document.getElementById(id);
const setStatus = (text, isError = false) => {
  const el = element("status");
  el.textContent = text;
  el.className = isError ? "message error" : "message notice";
};

async function checkIsAuthenticated(origin) {
  try {
    const res = await fetch(`${origin}/auth/is-authenticated.json`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.header?.status === "success";
    }
  } catch (e) {
    console.warn("Could not check authentication status:", e);
  }
  return false;
}

function sendCancel() {
  if (request && !approved && port) {
    try {
      port.postMessage({ action: "cancel" });
    } catch {
      // ignore
    }
  }
}

function native(message) {
  return new Promise((resolve, reject) => {
    const listener = (response) => {
      port.onMessage.removeListener(listener);
      port.onDisconnect.removeListener(disconnect);
      if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    };
    const disconnect = () => {
      port.onMessage.removeListener(listener);
      const lastErr = browser.runtime.lastError?.message;
      reject(new Error(lastErr ? `Native host error: ${lastErr}` : "Native host unavailable."));
    };
    port.onMessage.addListener(listener);
    port.onDisconnect.addListener(disconnect);
    port.postMessage(message);
  });
}

async function load() {
  element("approve").disabled = true;
  request = null;
  approved = false;
  try {
    account = await GetActiveAccountService.get();
    if (!account) {
      throw new Error("No active Passbolt account found in browser. Sign in to Passbolt first.");
    }
    if (!port) {
      try {
        port = browser.runtime.connectNative("dev.haspr.cli");
      } catch (err) {
        port = browser.runtime.connectNative("com.passbolt.cli");
      }
    }
    const response = await native({ action: "pending" });
    if (!response || !response.request) {
      throw new Error("No pending CLI authorization request found.");
    }
    request = response.request;
    element("origin").textContent = request.origin;
    element("account").textContent = account.username;
    element("fingerprint").textContent = (account.userKeyFingerprint || "").toUpperCase();

    BrowserAuthCryptoService.validate(response.request, account);

    const loggedIn = await checkIsAuthenticated(request.origin);
    if (!loggedIn) {
      setStatus(
        "You are not signed in to Passbolt. A login tab has been opened. Please sign in, complete MFA, and return here.",
        false,
      );
      element("signin").hidden = false;
      element("approve").disabled = true;
      browser.tabs.create({ url: `${request.origin}/auth/login` });
      return;
    }

    const storedPassphrase = await PassphraseStorageService.get();
    if (storedPassphrase) {
      element("passphrase-group").hidden = true;
    } else {
      element("passphrase-group").hidden = false;
    }

    element("approve").disabled = false;
    element("signin").hidden = true;
    setStatus("Approve only if you started this CLI request on this computer.", false);
  } catch (err) {
    console.error("BrowserAuth load error:", err);
    setStatus(
      `${err?.message || "No matching CLI request."} Start a command with --agent --agent-auth=browser, then retry.`,
      true,
    );
  }
}

async function approve() {
  if (!request || busy) {
    return;
  }
  busy = true;
  element("approve").disabled = true;
  element("retry").disabled = true;
  let key;
  let payload;
  try {
    account = await GetActiveAccountService.get();
    BrowserAuthCryptoService.validate(request, account);

    const csrf = await browser.cookies.get({ url: request.origin, name: "csrfToken" });
    const response = await fetch(`${request.origin}/browser-auth/authorize.json`, {
      method: "POST",
      credentials: "include",
      redirect: "error",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": csrf?.value || "",
      },
      body: JSON.stringify({
        challenge: request.challenge,
        fingerprint: request.fingerprint || account.userKeyFingerprint.toUpperCase(),
      }),
    });
    if (!response.ok) {
      if (response.status === 401) {
        browser.tabs.create({ url: `${request.origin}/auth/login` });
        throw new Error("You are not signed in to Passbolt. A login tab has been opened. Please sign in and retry.");
      }
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.header?.message || `Server returned error (${response.status}).`);
    }
    const grant = await response.json();
    if (
      grant.header?.status !== "success" ||
      grant.body?.user_id !== account.userId ||
      typeof grant.body?.token !== "string"
    ) {
      throw new Error(grant.header?.message || "Invalid CLI authorization response from server.");
    }

    let passphrase = await PassphraseStorageService.get();
    if (!passphrase) {
      passphrase = element("passphrase-input").value;
      if (!passphrase) {
        element("passphrase-group").hidden = false;
        element("passphrase-input").focus();
        throw new Error("Please enter your Passbolt passphrase.");
      }
    }

    BrowserAuthCryptoService.validate(request, await GetActiveAccountService.get());
    key = await GetDecryptedUserPrivateKeyService.getKey(passphrase);
    const keyFingerprint = key.getFingerprint().toUpperCase();
    if (request.fingerprint && keyFingerprint !== request.fingerprint) {
      throw new Error("Account key changed.");
    }

    await PassphraseStorageService.set(passphrase, -1);

    payload = {
      private_key: key.armor(),
      grant: grant.body.token,
      user_id: grant.body.user_id,
    };
    const envelope = await BrowserAuthCryptoService.seal(request, payload);
    await native({ action: "submit", envelope });
    approved = true;
    request = null;
    if (port) {
      port.disconnect();
      port = null;
    }
    setStatus("Authorization sent to the CLI. Closing window...", false);
    setTimeout(() => {
      window.close();
    }, 150);
  } catch (err) {
    console.error("BrowserAuth approve error:", err);
    setStatus(`Authorization failed: ${err?.message || "Sign in to Passbolt and retry."}`, true);
    if (!element("passphrase-group").hidden) {
      element("passphrase-input").focus();
    }
  } finally {
    if (payload) {
      payload.private_key = "";
      payload.grant = "";
    }
    key = null;
    busy = false;
    element("approve").disabled = false;
    element("retry").disabled = false;
  }
}

element("approve").addEventListener("click", approve);
element("retry").addEventListener("click", load);
element("cancel").addEventListener("click", () => {
  sendCancel();
  window.close();
});
element("signin").addEventListener("click", () => {
  if (account) {
    browser.tabs.create({ url: `${account.domain}/auth/login` });
  }
});
element("passphrase-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !element("approve").disabled) {
    approve();
  }
});
window.addEventListener("focus", () => {
  if (!busy && !approved) {
    load();
  }
});
window.addEventListener("beforeunload", () => {
  sendCancel();
});
window.addEventListener("unload", () => {
  sendCancel();
  if (port) {
    port.disconnect();
    port = null;
  }
});

load();
