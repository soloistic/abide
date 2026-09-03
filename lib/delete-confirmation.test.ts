import { describe, expect, it } from "vitest";
import {
  DELETE_CONFIRM_VALUE,
  isDeleteConfirmed,
} from "./delete-confirmation";

describe("isDeleteConfirmed", () => {
  it("accepts the explicit confirmation value", () => {
    expect(isDeleteConfirmed(DELETE_CONFIRM_VALUE)).toBe(true);
  });

  it("rejects missing or unexpected values", () => {
    expect(isDeleteConfirmed(null)).toBe(false);
    expect(isDeleteConfirmed(undefined)).toBe(false);
    expect(isDeleteConfirmed("yes")).toBe(false);
    expect(isDeleteConfirmed("on")).toBe(false);
    expect(isDeleteConfirmed("")).toBe(false);
  });
});
