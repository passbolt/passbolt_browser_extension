/** @jest-environment node */
import { webcrypto } from "node:crypto";
import BrowserAuthCryptoService from "./browserAuthCryptoService";

const base64 = (bytes) => Buffer.from(bytes).toString("base64url");
const account = { domain: "https://passbolt.example", userKeyFingerprint: "A".repeat(40) };
const request = () => ({
  version: 1,
  id: base64(webcrypto.getRandomValues(new Uint8Array(32))),
  origin: account.domain,
  fingerprint: account.userKeyFingerprint,
  public_key: "",
  challenge: "a".repeat(43),
  expires: Math.floor(Date.now() / 1000) + 120,
});

beforeAll(() => {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
});

describe("browser authorization", () => {
  it("encrypts the unlocked key and grant for the requesting agent", async () => {
    const pair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    const req = request();
    req.public_key = base64(await crypto.subtle.exportKey("raw", pair.publicKey));
    const payload = { private_key: "unlocked-private-key", grant: "single-use-grant", user_id: "account-id" };
    const sealed = await BrowserAuthCryptoService.seal(req, payload);
    expect(JSON.stringify(sealed)).not.toContain(payload.private_key);
    const peer = await crypto.subtle.importKey(
      "raw",
      Buffer.from(sealed.public_key, "base64url"),
      { name: "ECDH", namedCurve: "P-256" },
      false,
      [],
    );
    const shared = await crypto.subtle.deriveBits({ name: "ECDH", public: peer }, pair.privateKey, 256);
    const key = await crypto.subtle.importKey(
      "raw",
      await crypto.subtle.digest("SHA-256", shared),
      { name: "AES-GCM" },
      false,
      ["decrypt"],
    );
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: Buffer.from(sealed.nonce, "base64url"),
        additionalData: new TextEncoder().encode(JSON.stringify(req)),
      },
      key,
      Buffer.from(sealed.ciphertext, "base64url"),
    );
    expect(JSON.parse(new TextDecoder().decode(plaintext))).toEqual(payload);
  });
  it.each(["origin", "fingerprint", "expires", "version"])(
    "rejects a mismatched or expired %s before key access",
    (field) => {
      const req = request();
      req.public_key = "B".repeat(87);
      req[field] = { origin: "https://attacker.example", fingerprint: "B".repeat(40), expires: 0, version: 2 }[field];
      expect(() => BrowserAuthCryptoService.validate(req, account)).toThrow();
    },
  );
});
