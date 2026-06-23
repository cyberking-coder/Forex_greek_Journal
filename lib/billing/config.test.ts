import { describe, it, expect, beforeEach } from "vitest";
import { productIdFor, planForProductId, isBillingConfigured } from "./config";

describe("billing config", () => {
  beforeEach(() => {
    process.env.DODO_PRODUCT_PRO_MONTHLY = "pdt_pro_m";
    process.env.DODO_PRODUCT_PRO_YEARLY = "pdt_pro_y";
    process.env.DODO_PRODUCT_ELITE_MONTHLY = "pdt_elite_m";
    process.env.DODO_PRODUCT_ELITE_YEARLY = "pdt_elite_y";
  });

  it("resolves product ids by plan and interval", () => {
    expect(productIdFor("PRO", "monthly")).toBe("pdt_pro_m");
    expect(productIdFor("ELITE", "yearly")).toBe("pdt_elite_y");
  });

  it("reverse-maps a product id to its plan", () => {
    expect(planForProductId("pdt_pro_y")).toBe("PRO");
    expect(planForProductId("pdt_elite_m")).toBe("ELITE");
    expect(planForProductId("unknown")).toBeNull();
  });

  it("reports configured state from the API key", () => {
    delete process.env.DODO_PAYMENTS_API_KEY;
    expect(isBillingConfigured()).toBe(false);
    process.env.DODO_PAYMENTS_API_KEY = "test_key";
    expect(isBillingConfigured()).toBe(true);
    delete process.env.DODO_PAYMENTS_API_KEY;
  });
});
