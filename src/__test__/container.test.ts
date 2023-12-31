import { describe, test, expect } from "vitest";
import { Container, SingletonInstancesDictionary } from "../container";
import { autowire } from "../autowire";
import { mergeDictionaries } from "../merge-dictionaries";
import { ErrorMessages } from "../error-messages";
import { DependencyGraphNode } from "../dependency-graph-node";

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
    const container = new Container(servicesTemplate, {} as SingletonInstancesDictionary<typeof servicesTemplate>);
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
    const container = new Container(servicesTemplate, {} as SingletonInstancesDictionary<typeof servicesTemplate>);
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

    const container = new Container(servicesDictionary, {} as SingletonInstancesDictionary<typeof servicesDictionary>);

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
    } as SingletonInstancesDictionary<typeof servicesDictionary>);
    const counterIncrementer = container.services.CounterIncrementer;
    counterIncrementer.increment();
    counterIncrementer.increment();
    counterIncrementer.increment();
    expect(container.services.Counter.count).toBe(3);
  });

  test("It throws an error if a requested service is missing.", () => {
    const emptyContainer = new Container({}, {});
    expect(() => (emptyContainer.services as any).NON_EXISTENT).toThrowError(
      ErrorMessages.SERVICE_NOT_FOUND('NON_EXISTENT')
    );
  });

  test("It throws an error if a dependency is missing.", () => {
    class A {
      b : B;
      constructor(b : B) {
        this.b = b
      }
    }
    class B {
      c : C;
      constructor(c : C) {
        this.c = c;
      }
    }
    class C {}
    const serviceA = autowire<'A', A, A>(A, 'A', ['B']);
    const serviceB = autowire<'B', B, B>(B, 'B', ['C']);
    const services = {...serviceA, ...serviceB };

    const container = new Container(services, {} as SingletonInstancesDictionary<typeof services>);

    const serviceANode = new DependencyGraphNode('A', false);
    const serviceBNode = new DependencyGraphNode('B', false, serviceANode);
    const serviceCNode = new DependencyGraphNode('C', false, serviceBNode);

    expect(() => container.services.A).toThrowError(
      ErrorMessages.MISSING_DEPENDENCY_ERROR_WITH_DEPENDENCY_GRAPH(serviceCNode));
  });

  test("It throws an error if a circular dependency exists and all classes are transient in scope.", () => {
    class A {
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    class B {
      c: C;
      constructor(c: C) {
        this.c = c;
      }
    }
    class C {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["B"]);
    const serviceB = autowire<"B", B, B>(B, "B", ["C"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["A"]);

    const servicesDictionary = mergeDictionaries(
      mergeDictionaries(serviceA, serviceB),
      serviceC,
    );

    const container = new Container(servicesDictionary, {} as SingletonInstancesDictionary<typeof servicesDictionary>);

    expect(() => container.services.A).toThrowError(
      ErrorMessages.CIRCULAR_DEPENDENCY_ERROR('A')
    );
  });

  test("It throws an error if a circular dependency exists and one class is registered transient in scope.", () => {
    class A {
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    class B {
      c: C;
      constructor(c: C) {
        this.c = c;
      }
    }
    class C {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["B"]);
    const serviceB = autowire<"B", B, B>(B, "B", ["C"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["A"]);

    const servicesDictionary = mergeDictionaries(
      mergeDictionaries(serviceA, serviceB),
      serviceC,
    );
    const singletonInstancesDictionary = {
      A : undefined,
      B : undefined
    } as SingletonInstancesDictionary<typeof servicesDictionary>

    const container = new Container(servicesDictionary, singletonInstancesDictionary);

    expect(() => container.services.A).toThrowError(
      ErrorMessages.CIRCULAR_DEPENDENCY_ERROR('A')
    );
  });

  test("It correctly resolves circular dependencies when all classes are registered in singleton scope.", () => {
    class A {
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    class B {
      c: C;
      constructor(c: C) {
        this.c = c;
      }
    }
    class C {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["B"]);
    const serviceB = autowire<"B", B, B>(B, "B", ["C"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["A"]);

    const servicesDictionary = mergeDictionaries(
      mergeDictionaries(serviceA, serviceB),
      serviceC,
    );
    const singletonInstancesDictionary = {
      A : undefined,
      B : undefined,
      C : undefined
    } as SingletonInstancesDictionary<typeof servicesDictionary>

    const container = new Container(servicesDictionary, singletonInstancesDictionary);

    expect(container.services.A).toBeInstanceOf(A);
    expect(container.services.B).toBeInstanceOf(B);
    expect(container.services.C).toBeInstanceOf(C);
    expect(container.services.A.b).toBeInstanceOf(B);
    expect(container.services.B.c).toBeInstanceOf(C);
    expect(container.services.C.a).toBeInstanceOf(A);
    expect(container.services.A.b.c).toBeInstanceOf(C);
    expect(container.services.B.c.a).toBeInstanceOf(A);
    expect(container.services.C.a.b).toBeInstanceOf(B);
    expect(container.services.A.b.c.a.b.c.a).toBeInstanceOf(A);
  });

  test('An error is thrown when a circular dependency is registered which includes an attempt to access properties of a dependency inside a constructor.', () => {
    class A {
      name = 'A'
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    class B {
      c: C;
      constructor(c: C) {
        this.c = c;
      }
    }
    class C {
      a: A;
      dependencyName : string;
      constructor(a: A) {
        this.a = a;
        this.dependencyName = a.name;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["B"]);
    const serviceB = autowire<"B", B, B>(B, "B", ["C"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["A"]);

    const servicesDictionary = mergeDictionaries(
      mergeDictionaries(serviceA, serviceB),
      serviceC,
    );
    const singletonInstancesDictionary = {
      A : undefined,
      B : undefined,
      C : undefined
    } as SingletonInstancesDictionary<typeof servicesDictionary>

    const container = new Container(servicesDictionary, singletonInstancesDictionary);

    expect(() => container.services.A).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test("It correctly resolves circular dependencies a class registered as a singleton depends upon itself.", () => {
    class A {
      b: B;
      constructor(b: B) {
        this.b = b;
      }
    }
    class B {
      c: C;
      constructor(c: C) {
        this.c = c;
      }
    }
    class C {
      a: A;
      d: D;
      constructor(a: A, d: D) {
        this.a = a;
        this.d = d;
      }
    }
    class D {
      e: E;
      constructor(e: E) {
        this.e = e;
      }
    }
    class E {
      f: F;
      constructor(f: F) {
        this.f = f;
      }
    }
    class F {
      c : C;
      constructor(c : C) {
        this.c = c;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["B"]);
    const serviceB = autowire<"B", B, B>(B, "B", ["C"]);
    const serviceC = autowire<"C", C, C>(C, "C", ["A", 'D']);
    const serviceD = autowire<'D', D, D>(D, 'D', ['E']);
    const serviceE = autowire<'E', E, E>(E, 'E', ['F']);
    const serviceF = autowire<'F', F, F>(F, 'F', ['C']);

    const servicesDictionary = {
      ...serviceA,
      ...serviceB,
      ...serviceC,
      ...serviceD,
      ...serviceE,
      ...serviceF
    }
    const singletonInstancesDictionary = {
      A : undefined,
      B : undefined,
      C : undefined,
      D : undefined,
      E : undefined,
      F : undefined
    } as SingletonInstancesDictionary<typeof servicesDictionary>

    const container = new Container(servicesDictionary, singletonInstancesDictionary);

    expect(container.services.A).toBeInstanceOf(A);
    expect(container.services.B).toBeInstanceOf(B);
    expect(container.services.C).toBeInstanceOf(C);
    expect(container.services.D).toBeInstanceOf(D);
    expect(container.services.E).toBeInstanceOf(E);
    expect(container.services.F).toBeInstanceOf(F);
    expect(container.services.D.e.f.c.a.b.c.d).toBeInstanceOf(D);
  });

  test("It correctly resolves circular dependencies when one singleton depends upon itself.", () => {
    class A {
      a: A;
      constructor(a: A) {
        this.a = a;
      }
    }
    const serviceA = autowire<"A", A, A>(A, "A", ["A"]);

    const servicesDictionary = serviceA;
    const singletonInstancesDictionary = {
      A : undefined
    } as SingletonInstancesDictionary<typeof servicesDictionary>

    const container = new Container(servicesDictionary, singletonInstancesDictionary);

    expect(container.services.A).toBeInstanceOf(A);
    expect(container.services.A.a).toBeInstanceOf(A);
  });
});