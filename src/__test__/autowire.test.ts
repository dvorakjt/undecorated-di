import { describe, test, expect } from "vitest";
import { autowire } from "../autowire";
import { Service } from "../service";

describe("autowire", () => {
  test("An object with one key which matches the identifier, mapped to the expected Service type.", () => {
    interface IA {}
    const IAKey = "IA";
    type IAKeyType = typeof IAKey;
    class A implements IA {}
    const object = autowire<IAKeyType, IA, A>(A, IAKey);
    expect(object).toStrictEqual({
      [IAKey]: new Service(A),
    });
  });
});
