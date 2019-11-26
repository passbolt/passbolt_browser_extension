import canSuggestUrl from "./canSuggestUrl";

describe("canSuggestUrl", () => {

  it("should return true only if search hostname matches or is a parent of the given hostname", () => {
    // Similar ips accepted.
    expect(canSuggestUrl("127.0.0.1", "127.0.0.1")).toBe(true);
    expect(canSuggestUrl("[::1]", "[::1]")).toBe(true);
    expect(canSuggestUrl("[2001:4860:4860::8888]", "[2001:4860:4860::8888]")).toBe(true);
    // Similar hostname accepted.
    expect(canSuggestUrl("www.passbolt.com", "www.passbolt.com")).toBe(true);
    expect(canSuggestUrl(new URL("https://àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ.com").hostname, "àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ.com")).toBe(true);
    expect(canSuggestUrl(new URL("https://الش.com").hostname, "الش.com")).toBe(true);
    expect(canSuggestUrl(new URL("https://Ид.com").hostname, "Ид.com")).toBe(true);
    expect(canSuggestUrl(new URL("https://完善.com").hostname, "完善.com")).toBe(true);
    // Parent hostname accepted.
    expect(canSuggestUrl("www.passbolt.com", "passbolt.com")).toBe(true);
    // Deeper parent hostname accepted.
    expect(canSuggestUrl("billing.admin.passbolt.com", "passbolt.com")).toBe(true);

    // Try to use the sub domain capability with fake IPs does not work
    expect(canSuggestUrl("fake.127.0.0.1", "127.0.0.1")).toBe(false);
    expect(canSuggestUrl("127.127.0.0.1", "127.0.0.1")).toBe(false);
    // Different IPs.
    expect(canSuggestUrl("[2001:4860:4860::8844]", "[2001:4860:4860::8888]")).toBe(false);
    // Should not accept hostname with not valid characters.
    expect(canSuggestUrl("https://attacker.com?passbolt.com", "www.passbolt.com")).toBe(false);
    expect(canSuggestUrl("https://attacker.com?www.passbolt.com", "www.passbolt.com")).toBe(false);
    expect(canSuggestUrl("https://attacker.com?url=https://www.passbolt.com", "www.passbolt.com")).toBe(false);
    // A subdomain cannot be parent of its parent hostname.
    expect(canSuggestUrl("passbolt.com", "www.passbolt.com")).toBe(false);
    // Should not match hostname which partially match
    expect(canSuggestUrl("bolt.com", "wwww.passbolt.com")).toBe(false);
    expect(canSuggestUrl("www.pass", "wwww.passbolt.com")).toBe(false);
    // Should not match if the search domain is a subdomain of the given domain.
    expect(canSuggestUrl("www.passbolt.com.attacker.com", "passbolt.com")).toBe(false);
    // Should not match if the search domain is a part of the given domain.
    expect(canSuggestUrl("www.attacker-passbolt.com", "passbolt.com")).toBe(false);
  });

});
