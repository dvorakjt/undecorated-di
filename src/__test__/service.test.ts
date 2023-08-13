import { describe, test, expect } from "vitest";
import { Service } from "../service";

describe("Service", () => {
  test("It returns an instance of the implementing class when getInstance is called with any empty dependency array.", () => {
    class A {}
    const service = new Service<A, A>(A);
    expect(service.getInstance([])).toBeInstanceOf(A);
  });

  test("It passes dependencies into the constructor of the implementing class when getInstance() is called with a non-empty dependency array.", () => {
    class A {}
    class B {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    const service = new Service<B, B>(B, ["A"]);
    expect(service.getInstance([new A()]).a).toBeInstanceOf(A);
  });
});
