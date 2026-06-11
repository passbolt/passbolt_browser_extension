#!/usr/bin/env node
"use strict";

/**
 * onmessage-guard: forbid bare async "claim-and-null" listeners on the polyfill bus.
 *
 * A function registered via `browser.runtime.onMessage`/`onMessageExternal.addListener`
 * that is `async` returns a Promise for EVERY message. The webextension-polyfill then
 * keeps the response channel open and resolves it (to null for messages the listener
 * does not handle), which hijacks the reply of unrelated `runtime.sendMessage`
 * broadcasts on the shared content-script bus. That is the broadcast-reply null-collision
 * (the service worker's real reply loses the single-response race to a content-script
 * context). A polyfill onMessage listener MUST make a synchronous claim decision: return
 * `undefined` synchronously to decline, or a Promise only for messages it owns.
 *
 * Scope: only the polyfill alias `browser.runtime.*`. Native `chrome.runtime.onMessage`
 * listeners are intentionally not covered. Chrome ignores a returned Promise (only
 * `return true` keeps the channel), so they do not claim-and-null.
 *
 * Escape hatch: put `// onmessage-guard-allow` on the addListener line for a vetted case.
 *
 * Heuristic note: catches the realistic reintroduction (an async listener, inline or a
 * same-file async-declared handler). It does not attempt to prove that an inline
 * non-async arrow never returns a Promise; those should be caught in review.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const ALLOW_MARKER = "onmessage-guard-allow";

// Capture the start of every polyfill onMessage/onMessageExternal listener registration:
// either an inline `async` callback or a handler reference (e.g. `this._onMessage`).
const LISTENER_RE = /browser\.runtime\.(?:onMessage|onMessageExternal)\.addListener\s*\(\s*(async\b|[\w.$]+)/g;

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") {
        continue;
      }
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".js") && !entry.name.endsWith(".test.js")) {
      out.push(full);
    }
  }
  return out;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Is the referenced handler declared `async` in this file?
function isDeclaredAsync(src, ref) {
  const name = ref.split(".").pop(); // this._onMessage -> _onMessage
  if (!name || name === "async") {
    return false;
  }
  const n = escapeRe(name);
  return [
    new RegExp(`async\\s+${n}\\s*\\(`), // async _onMessage(
    new RegExp(`${n}\\s*=\\s*async\\b`), // _onMessage = async
    new RegExp(`async\\s+function\\s+${n}\\b`), // async function _onMessage
    new RegExp(`${n}\\s*:\\s*async\\b`), // _onMessage: async
  ].some(re => re.test(src));
}

function lineNumberAt(src, index) {
  return src.slice(0, index).split("\n").length;
}

const violations = [];
for (const file of walk(SRC_DIR, [])) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  LISTENER_RE.lastIndex = 0;
  let match;
  while ((match = LISTENER_RE.exec(src)) !== null) {
    const ref = match[1];
    const ln = lineNumberAt(src, match.index);
    if ((lines[ln - 1] || "").includes(ALLOW_MARKER)) {
      continue;
    }
    const inlineAsync = ref === "async";
    if (inlineAsync || isDeclaredAsync(src, ref)) {
      violations.push({
        file: path.relative(ROOT, file),
        line: ln,
        what: inlineAsync ? "inline async listener" : `${ref} (declared async)`,
      });
    }
  }
}

if (violations.length > 0) {
  console.error("\n✖ onmessage-guard: async claim-and-null listener(s) on the polyfill bus:\n");
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.what}`);
  }
  console.error(
    "\nA browser.runtime.onMessage/onMessageExternal listener must make a SYNCHRONOUS claim\n" +
      "decision: return undefined synchronously to DECLINE, or a Promise only for messages it\n" +
      "owns. A bare async listener returns a Promise for every message, so the polyfill holds\n" +
      "the response channel open and resolves it to null, which hijacks unrelated sendMessage\n" +
      "replies (the broadcast-reply null-collision). Split owned vs. unowned dispatch, or mark\n" +
      "a vetted exception with `// onmessage-guard-allow` on the addListener line.\n"
  );
  process.exit(1);
}

console.log("✓ onmessage-guard: no claim-and-null polyfill onMessage listeners found.");
