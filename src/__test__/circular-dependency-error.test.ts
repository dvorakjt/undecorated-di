import { describe, test, expect } from "vitest";
import { CircularDependencyError } from "../circular-dependency-error";

describe("CircularDependencyError", () => {
  test("It returns an error", () => {
    const missingDepError = new CircularDependencyError();
    expect(missingDepError).toBeInstanceOf(Error);
  });

  test("It returns an error with the supplied message.", () => {
    const expectedMessage = "test";
    const missingDepError = new CircularDependencyError(expectedMessage);
    expect(missingDepError.message).toBe(expectedMessage);
  });

  test('It returns an error with name "CircularDependencyError"', () => {
    const missingDepError = new CircularDependencyError();
    expect(missingDepError.name).toBe("CircularDependencyError");
  });
});
