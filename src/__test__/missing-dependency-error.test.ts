import { describe, test, expect } from "vitest";
import { MissingDependencyError } from "../missing-dependency-error";

describe("MissingDependencyError", () => {
  test("It returns an error", () => {
    const missingDepError = new MissingDependencyError();
    expect(missingDepError).toBeInstanceOf(Error);
  });

  test("It returns an error with the supplied message.", () => {
    const expectedMessage = "test";
    const missingDepError = new MissingDependencyError(expectedMessage);
    expect(missingDepError.message).toBe(expectedMessage);
  });

  test('It returns an error with name "MissingDependencyError"', () => {
    const missingDepError = new MissingDependencyError();
    expect(missingDepError.name).toBe("MissingDependencyError");
  });
});
