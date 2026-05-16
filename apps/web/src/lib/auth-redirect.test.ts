import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeRedirect } from "./auth-redirect";

describe("safeRedirect", () => {
  it("falls back home when the redirect is missing", () => {
    assert.equal(safeRedirect(null), "/");
    assert.equal(safeRedirect(undefined), "/");
    assert.equal(safeRedirect(""), "/");
  });

  it("allows dashboard destinations", () => {
    assert.equal(safeRedirect("/dashboard"), "/dashboard");
    assert.equal(safeRedirect("/dashboard/profile"), "/dashboard/profile");
  });

  it("falls back home for non-dashboard destinations", () => {
    assert.equal(safeRedirect("/design"), "/");
    assert.equal(safeRedirect("/create-product"), "/");
  });

  it("falls back home for external or protocol-relative URLs", () => {
    assert.equal(safeRedirect("https://example.com"), "/");
    assert.equal(safeRedirect("//example.com"), "/");
  });
});
