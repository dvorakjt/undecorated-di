import { describe, test, expect } from "vitest";
import { ContainerBuilder } from "../container-builder";
import { autowire } from "../autowire";
import { Service } from "../service";
import { Container } from "../container";

describe("ContainerBuilder", () => {
  test("A ContainerBuilder is returned when static method createContainerBuilder() is called.", () => {
    expect(ContainerBuilder.createContainerBuilder()).toBeInstanceOf(
      ContainerBuilder,
    );
  });

  test("A new ContainerBuilder is returned when registerTransientService() is called.", () => {
    const originalCB = ContainerBuilder.createContainerBuilder();
    const newCB = originalCB.registerTransientService({});
    expect(originalCB).not.toBe(newCB);
  });

  test("When registerTransientService() is called, property servicesDictionary of the new ContainerBuilder includes keys from the existing instance and the newly added keys.", () => {
    const originalCB =
      ContainerBuilder.createContainerBuilder().registerTransientService({
        hello: "world",
      });
    const newCB = originalCB.registerTransientService({ one: 1 });
    expect(newCB.servicesDictionary).toStrictEqual({
      hello: "world",
      one: 1,
    });
  });

  test("When registerSingletonService() is called, both the servicesDictionary and singletonInstancesDictionary properties are merged.", () => {
    class A {}
    class B {}
    const serviceA = autowire<"ServiceA", A, A>(A, "ServiceA");
    const serviceB = autowire<"ServiceB", B, B>(B, "ServiceB");
    const originalCB =
      ContainerBuilder.createContainerBuilder().registerSingletonService(
        serviceA,
      );
    const newCB = originalCB.registerSingletonService(serviceB);
    expect(newCB.servicesDictionary).toStrictEqual({
      ServiceA: new Service<A, A>(A),
      ServiceB: new Service<B, B>(B),
    });
    expect(newCB.singletonInstancesDictionary).toStrictEqual({
      ServiceA: undefined,
      ServiceB: undefined,
    });
  });

  test("It returns a new Container when build() is called.", () => {
    const container = ContainerBuilder.createContainerBuilder().build();
    expect(container).toBeInstanceOf(Container);
  });
});
