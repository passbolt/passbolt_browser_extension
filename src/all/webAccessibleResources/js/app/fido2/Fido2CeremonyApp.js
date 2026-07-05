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
 * @since         5.13.0
 */

const PREFIX = "passbolt.fido2.ceremony.";
const params = new URLSearchParams(window.location.search);
const ceremonyId = params.get("ceremonyId");
const NEW_ITEM = "__new__";

// When rendered as an in-page overlay iframe, tell the service worker directly (chrome.runtime) that
// we actually booted, so it knows the page CSP did not block the frame and need not fall back to a
// popup window. Sent immediately (before get-context) so the worker's short readiness wait resolves.
if (params.get("overlay") === "1") {
  try {
    chrome.runtime.sendMessage({ type: `${PREFIX}overlay-ready`, ceremonyId });
  } catch {
    /* ignore */
  }
}

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of [].concat(children)) {
    if (child !== null && child !== undefined && child !== false) {
      node.append(child);
    }
  }
  return node;
};

// Self-contained page (no bundler deps): talk to the service worker via chrome.runtime directly.
const send = (type, extra = {}) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: `${PREFIX}${type}`, ceremonyId, ...extra }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });

let context = null;
let selectedResourceId = NEW_ITEM;
let selectedCredentialId = null;
let keepAliveTimer = null;

async function boot() {
  if (!ceremonyId) {
    renderMessage("Missing request identifier.");
    return;
  }
  try {
    const response = await send("get-context");
    context = response?.context;
    if (!context) {
      renderMessage("This request is no longer available.");
      return;
    }
    if (context.authRequired) {
      renderAuthRequired();
    } else {
      render();
    }
    startKeepAlive();
  } catch (error) {
    console.error("[passbolt.fido2] ceremony popup boot error", error);
    renderMessage(`Unable to load the passkey request. ${error?.message || ""}`);
  }
}

// The MV3 service worker suspends after ~30s idle. Pinging resets the idle timer while the user reads
// or types; if the worker restarted anyway, surface it instead of letting the submit silently fail.
function startKeepAlive() {
  stopKeepAlive();
  keepAliveTimer = setInterval(async () => {
    try {
      const response = await send("ping");
      if (response?.error) {
        stopKeepAlive();
        renderMessage("This request is no longer available.");
      }
    } catch {
      /* the worker may be mid-restart; the next ping (or submit) reports the outcome */
    }
  }, 20000);
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

function renderMessage(message) {
  document.getElementById("main").replaceChildren(el("p", { className: "fido2-hint", textContent: message }));
  document.getElementById("footer").replaceChildren();
}

function fallbackButton() {
  return el("button", {
    type: "button",
    className: "fido2-link",
    textContent: "Use another method (Windows Hello, security key…)",
    onclick: () => {
      stopKeepAlive();
      send("fallback");
    },
  });
}

/**
 * "Sign in required" state: the account is configured but not signed in, so we cannot store/use a
 * passkey. Ask the user to sign in to Passbolt (or use another method) instead of silently taking
 * over with the platform authenticator.
 */
function renderAuthRequired() {
  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  main.replaceChildren(
    el("h1", { textContent: "Sign in to Passbolt" }),
    el("p", { className: "fido2-hint" }, [
      "Sign in to your Passbolt to use your passkeys for ",
      el("strong", { textContent: context.rpId || "this site" }),
      ".",
    ]),
    el("div", { className: "error-message", id: "error" }),
  );
  const openBtn = el("button", {
    type: "button",
    className: "button primary big full-width",
    textContent: "Open Passbolt",
    onclick: () => send("open-passbolt"),
  });
  footer.replaceChildren(openBtn, fallbackButton());
}

function field(labelText, inputId, inputMode) {
  const props = { type: "password", id: inputId, className: "required", autocomplete: "off" };
  if (inputMode) {
    props.inputMode = inputMode;
  }
  return el("div", { className: "input text required" }, [
    el("label", { htmlFor: inputId, textContent: labelText }),
    el("input", props),
  ]);
}

function render() {
  const isCreate = context.mode === "create";

  const main = document.getElementById("main");
  const footer = document.getElementById("footer");
  main.replaceChildren();
  footer.replaceChildren();

  main.append(
    el("h1", { textContent: isCreate ? "Create a passkey" : "Sign in with a passkey" }),
    el("p", { className: "fido2-hint" }, [
      isCreate ? "for " : "to ",
      el("strong", { textContent: context.rpId }),
      context.userName ? ` as ${context.userName}` : "",
    ]),
  );

  if (isCreate) {
    main.append(renderResourcePicker());
  } else {
    main.append(renderPasskeyChoice());
  }

  // A passkey PIN stands in for the master passphrase (it unlocks it), so ask one or the other.
  if (context.pinRequired) {
    main.append(field("Passkey PIN", "pin", "numeric"));
  } else if (context.vaultLocked) {
    main.append(field("Passbolt passphrase", "passphrase"));
  }

  main.append(el("div", { className: "error-message", id: "error" }));

  const submitBtn = el("button", {
    type: "button",
    className: "button primary big full-width",
    textContent: isCreate ? "Create passkey" : "Sign in",
    onclick: onSubmit,
  });
  footer.append(submitBtn, fallbackButton());
}

/**
 * Searchable "save to" picker (create): a "Create a new item" option on top plus the matching
 * resources, filtered live by a search box — like the passbolt resource search / create menu.
 */
function renderResourcePicker() {
  const resources = context.resources || [];
  const options = [{ value: NEW_ITEM, name: "Create a new item", meta: context.rpId }].concat(
    resources.map((resource) => ({ value: resource.id, name: resource.name, meta: resource.username || context.rpId })),
  );
  selectedResourceId = NEW_ITEM;
  return renderPicker("Save to", options, "resource", (value) => {
    selectedResourceId = value;
  });
}

/**
 * Account chooser (get): with a single matching key we go straight in (no chooser); with several the
 * user searches + picks, the site's relying party shown as the suggestion.
 */
function renderPasskeyChoice() {
  const passkeys = context.passkeys || [];
  if (!passkeys.length) {
    return el("p", { className: "fido2-hint", textContent: "No passkey found for this site in your vault." });
  }
  const options = passkeys.map((passkey) => ({
    value: passkey.credentialId,
    name: passkey.userName || passkey.label || context.rpId,
    meta: passkey.resourceName || context.rpId,
  }));
  selectedCredentialId = options[0].value;

  if (context.autoSelect || options.length === 1) {
    // Single account: show it, no chooser.
    const only = options[0];
    return el("div", { className: "fido2-single" }, [
      el("div", { className: "fido2-name", textContent: only.name }),
      el("div", { className: "fido2-meta", textContent: only.meta }),
    ]);
  }
  return renderPicker("Choose an account", options, "credential", (value) => {
    selectedCredentialId = value;
  });
}

/**
 * Generic searchable picker: a label, a search input, and a filtered option list.
 * @param {string} labelText
 * @param {Array<{value, name, meta}>} options
 * @param {string} kind
 * @param {Function} onSelect
 */
function renderPicker(labelText, options, kind, onSelect) {
  const wrap = el("div", { className: "fido2-picker" });
  wrap.append(el("label", { textContent: labelText }));

  const search = el("input", {
    type: "text",
    className: "fido2-search",
    placeholder: "Search…",
    autocomplete: "off",
  });
  const list = el("div", { className: "fido2-option-list" });
  wrap.append(search, list);

  const renderList = (filter) => {
    const needle = (filter || "").toLowerCase();
    const matches = options.filter(
      (option) =>
        !needle ||
        (option.name || "").toLowerCase().includes(needle) ||
        (option.meta || "").toLowerCase().includes(needle),
    );
    list.replaceChildren(
      ...matches.map((option, index) =>
        buildOption(option.value, option.name, option.meta, index === 0, kind, onSelect),
      ),
    );
    if (matches.length) {
      onSelect(matches[0].value);
    }
  };
  search.oninput = () => renderList(search.value);
  renderList("");
  return wrap;
}

function buildOption(value, name, meta, selected, kind, onSelect) {
  const option = el("div", { className: `fido2-option${selected ? " selected" : ""}` });
  option.dataset.value = value;
  option.dataset.kind = kind;
  option.append(
    el("div", {}, [
      el("div", { className: "fido2-name", textContent: name }),
      el("div", { className: "fido2-meta", textContent: meta }),
    ]),
  );
  option.onclick = () => {
    document.querySelectorAll(`.fido2-option[data-kind="${kind}"]`).forEach((n) => n.classList.remove("selected"));
    option.classList.add("selected");
    onSelect(value);
  };
  return option;
}

async function onSubmit() {
  const errorNode = document.getElementById("error");
  errorNode.textContent = "";

  const passphraseNode = document.getElementById("passphrase");
  const pinNode = document.getElementById("pin");
  const passphrase = passphraseNode ? passphraseNode.value : null;
  const pin = pinNode ? pinNode.value : null;

  if (context.pinRequired && !pin) {
    errorNode.textContent = "Enter your passkey PIN.";
    return;
  }
  if (!context.pinRequired && context.vaultLocked && !passphrase) {
    errorNode.textContent = "Enter your Passbolt passphrase.";
    return;
  }
  if (context.mode === "get" && !selectedCredentialId) {
    errorNode.textContent = "Choose a passkey.";
    return;
  }

  const result =
    context.mode === "create"
      ? { action: "create", resourceId: selectedResourceId === NEW_ITEM ? null : selectedResourceId, passphrase, pin }
      : { credentialId: selectedCredentialId, passphrase, pin };

  let response;
  try {
    response = await send("submit", { result });
  } catch {
    errorNode.textContent = "Something went wrong. Please try again.";
    return;
  }

  if (response?.error) {
    // A wrong passphrase/PIN keeps the popup open with an inline message so the user can retry.
    if (response.error === "bad-pin") {
      errorNode.textContent = "The passkey PIN is incorrect.";
    } else if (response.error === "bad-passphrase") {
      errorNode.textContent = "The passphrase is incorrect.";
    } else if (response.error === "unknown-ceremony") {
      stopKeepAlive();
      renderMessage("This request is no longer available.");
    } else {
      errorNode.textContent = response.message || "Invalid input. Please try again.";
    }
    return;
  }

  // Accepted: the ceremony is settling, no more input needed.
  stopKeepAlive();
}

const closeBtn = document.getElementById("fido2-close");
if (closeBtn) {
  closeBtn.onclick = () => {
    stopKeepAlive();
    send("cancel");
  };
}

boot();
