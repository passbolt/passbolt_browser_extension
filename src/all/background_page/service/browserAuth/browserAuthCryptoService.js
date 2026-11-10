/** One-shot encrypted handoff. The native host never receives plaintext key material. */
export default class BrowserAuthCryptoService {
  static encode(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  static decode(value) {
    const input = value.replace(/-/g, "+").replace(/_/g, "/");
    return Uint8Array.from(atob(input), (c) => c.charCodeAt(0));
  }

  static validate(request, account, now = Date.now()) {
    const fields = ["version", "id", "origin", "fingerprint", "public_key", "challenge", "expires"];
    if (!request || Object.keys(request).join(",") !== fields.join(",")) {
      throw new Error("Invalid CLI authorization request format.");
    }
    if (request.version !== 1) {
      throw new Error(`Unsupported CLI request version: ${request.version}`);
    }
    const origin = new URL(request.origin);
    if (origin.protocol !== "https:") {
      throw new Error(`CLI request must use HTTPS: ${origin.protocol}`);
    }
    if (origin.origin !== request.origin) {
      throw new Error(`Invalid request origin: ${request.origin}`);
    }
    if (origin.username || origin.password) {
      throw new Error("Request origin must not contain user credentials.");
    }
    if (!account || !account.domain) {
      throw new Error("No active Passbolt account found in browser.");
    }
    const accountOrigin = new URL(account.domain).origin;
    if (request.origin !== accountOrigin) {
      throw new Error(
        `Configured server mismatch: CLI requested server "${request.origin}", but the Passbolt browser extension is configured for "${accountOrigin}".`,
      );
    }
    const accountFingerprint = (account.userKeyFingerprint || "").toUpperCase();
    if (request.fingerprint && request.fingerprint !== accountFingerprint) {
      throw new Error(
        `Account key mismatch: CLI requested key ${request.fingerprint}, but active browser account is ${accountFingerprint}.`,
      );
    }
    if (!/^[\w-]{43}$/.test(request.id)) {
      throw new Error("Invalid request ID format.");
    }
    if (!/^[\w-]{43}$/.test(request.challenge)) {
      throw new Error("Invalid challenge format.");
    }
    if (!/^[\w-]{87}$/.test(request.public_key)) {
      throw new Error("Invalid public key format.");
    }
    const currentSec = Math.floor(now / 1000);
    if (!Number.isSafeInteger(request.expires) || request.expires <= currentSec) {
      throw new Error("CLI authorization request has expired.");
    }
    if (request.expires > currentSec + 300) {
      throw new Error("CLI authorization request expiration is too far in the future.");
    }
  }

  static async seal(request, payload) {
    const key = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
    const peer = await crypto.subtle.importKey(
      "raw",
      this.decode(request.public_key),
      { name: "ECDH", namedCurve: "P-256" },
      false,
      [],
    );
    const shared = await crypto.subtle.deriveBits({ name: "ECDH", public: peer }, key.privateKey, 256);
    try {
      const digest = await crypto.subtle.digest("SHA-256", shared);
      const encryptionKey = await crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt"]);
      new Uint8Array(digest).fill(0);
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      const plaintext = new TextEncoder().encode(JSON.stringify(payload));
      try {
        const ciphertext = await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: nonce, additionalData: new TextEncoder().encode(JSON.stringify(request)) },
          encryptionKey,
          plaintext,
        );
        return {
          id: request.id,
          public_key: this.encode(await crypto.subtle.exportKey("raw", key.publicKey)),
          nonce: this.encode(nonce),
          ciphertext: this.encode(ciphertext),
        };
      } finally {
        plaintext.fill(0);
      }
    } finally {
      new Uint8Array(shared).fill(0);
    }
  }
}
