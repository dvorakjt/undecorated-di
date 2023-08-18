import { describe, test, expect } from "vitest";
import { Container } from "../container";
import { autowire } from "../autowire";
import { mergeDictionaries } from "../merge-dictionaries";

describe("Container", () => {
  test("It returns an instance of a class when the corresponding property of services is accessed.", () => {
    interface IFlyable {
      fly(): void;
    }
    const IFlyableKey = "IFlyable";
    type IFlyableKeyType = typeof IFlyableKey;
    class Bird implements IFlyable {
      fly(): void {
        console.log("A bird flies");
      }
      eatSeeds() {
        console.log("A bird eats seeds");
      }
    }
    const servicesTemplate = autowire<IFlyableKeyType, IFlyable, Bird>(
      Bird,
      IFlyableKey,
    );
    const container = new Container(servicesTemplate, {});
    expect(container.services.IFlyable).toBeInstanceOf(Bird);
  });

  test("It returns the same instance of a Singleton when that property is accessed multiple times.", () => {
    class Counter {
      count = 0;
    }
    const CounterKey = "Counter";
    type CounterKeyType = typeof CounterKey;
    const servicesTemplate = autowire<CounterKeyType, Counter, Counter>(
      Counter,
      CounterKey,
    );
    const container = new Container(servicesTemplate, {
      Counter: undefined,
    } as { Counter: Counter | undefined });
    const counter = container.services.Counter;
    counter.count++;
    const accessingCounterAgain = container.services.Counter;
    accessingCounterAgain.count++;
    expect(container.services.Counter.count).toBe(2);
  });

  test("It returns new instances of dependencies each time they are accessed if they are NOT registed as singletons.", () => {
    class Counter {
      count = 0;
    }
    const CounterKey = "Counter";
    type CounterKeyType = typeof CounterKey;
    const servicesTemplate = autowire<CounterKeyType, Counter, Counter>(
      Counter,
      CounterKey,
    );
    const container = new Container(servicesTemplate, {});
    const counter = container.services.Counter;
    counter.count++;
    const accessingCounterAgain = container.services.Counter;
    accessingCounterAgain.count++;
    expect(container.services.Counter.count).toBe(0);
  });

  test("It injects dependencies into dependent classes.", () => {
    class A {}
    class B {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    class C {
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A");
    const serviceB = autowire<"B", B, B>(B, "B", ["A"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["B"]);

    const servicesDictionary = mergeDictionaries(
      mergeDictionaries(serviceA, serviceB),
      serviceC,
    );

    const container = new Container(servicesDictionary, {});

    expect(container.services.C.b.a).toBeInstanceOf(A);
  });

  test("It returns the same instance of a singleton if it is first accessed by dependent classes.", () => {
    class Counter {
      count = 0;
    }
    class CounterIncrementer {
      counter: Counter;
      constructor(counter: Counter) {
        this.counter = counter;
      }
      increment() {
        this.counter.count++;
      }
    }
    const counterService = autowire<"Counter", Counter, Counter>(
      Counter,
      "Counter",
    );
    const counterIncrementerService = autowire<
      "CounterIncrementer",
      CounterIncrementer,
      CounterIncrementer
    >(CounterIncrementer, "CounterIncrementer", ["Counter"]);
    const servicesDictionary = mergeDictionaries(
      counterService,
      counterIncrementerService,
    );
    const container = new Container(servicesDictionary, {
      Counter: undefined,
    } as { Counter: Counter | undefined });
    const counterIncrementer = container.services.CounterIncrementer;
    counterIncrementer.increment();
    counterIncrementer.increment();
    counterIncrementer.increment();
    expect(container.services.Counter.count).toBe(3);
  });

  test("It throws an error if a dependency is missing.", () => {
    class A {}
    class B {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    const serviceB = autowire<"B", B, B>(B, "B", ["A"]);

    const container = new Container(serviceB, {});

    expect(() => container.services.B).toThrowError(
      "Service with key A not found.",
    );
  });

  test("It throws an error if a circular dependency exists.", () => {
    class A {
      c: C;
      constructor(c: C) {
        this.c = c;
      }
    }
    class B {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    class C {
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["C"]);
    const serviceB = autowire<"B", B, B>(B, "B", ["A"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["B"]);

    const servicesDictionary = mergeDictionaries(
      mergeDictionaries(serviceA, serviceB),
      serviceC,
    );

    const container = new Container(servicesDictionary, {});

    expect(() => container.services.A).toThrowError(
      "A found in inherited dependencies of A. This indicates a circular dependency which cannot be resolved.",
    );
  });
});