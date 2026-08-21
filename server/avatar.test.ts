import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("avatar privacy boundary", () => {
  it("does not expose a public avatar upload router", () => {
    const rootProcedures = appRouter._def.record as Record<string, unknown>;
    expect(rootProcedures).not.toHaveProperty("avatar");
  });
});
