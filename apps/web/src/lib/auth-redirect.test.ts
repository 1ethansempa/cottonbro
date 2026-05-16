import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafeAuthRedirectPath } from "./auth-redirect";

describe("getSafeAuthRedirectPath", () => {
  it("falls back home when the redirect is missing", () => {
    assert.equal(getSafeAuthRedirectPath(null), "/");
    assert.equal(getSafeAuthRedirectPath(undefined), "/");
    assert.equal(getSafeAuthRedirectPath(""), "/");
  });

  it("allows dashboard destinations", () => {
    assert.equal(getSafeAuthRedirectPath("/dashboard"), "/dashboard");
    assert.equal(
      getSafeAuthRedirectPath("/dashboard/profile"),
      "/dashboard/profile",
    );
  });

  it("falls back home for non-dashboard destinations", () => {
    assert.equal(getSafeAuthRedirectPath("/design"), "/");
    assert.equal(getSafeAuthRedirectPath("/create-product"), "/");
  });

  it("falls back home for external or protocol-relative URLs", () => {
    assert.equal(getSafeAuthRedirectPath("https://example.com"), "/");
    assert.equal(getSafeAuthRedirectPath("//example.com"), "/");
  });
});
