import { describe, test, expect } from "vitest";
import {
  Constant,
  ContainerBuilder,
  Container,
  Key,
  InjectedClass,
  BoundFunction,
} from "../../classes";
import { bind, inject } from "../../functions";
import { DuplicateKeyError } from "../../errors";

describe("ContainerBuilder", () => {
  test("createBuilder() returns a new ContainerBuilder.", () => {
    expect(ContainerBuilder.createBuilder()).toBeInstanceOf(ContainerBuilder);
  });

  test("build() returns a new Container.", () => {
    expect(ContainerBuilder.createBuilder().build()).toBeInstanceOf(Container);
  });

  test(`registerConstant() returns a new ContainerBuilder with the constant 
  added.`, () => {
    const key = new Key<"TestConstant", string>("TestConstant");
    const value = "test";
    const containerBuilder = ContainerBuilder.createBuilder().registerConstant(
      key,
      value
    );
    expect(containerBuilder.injectables.TestConstant).toBeInstanceOf(Constant);
    expect(containerBuilder.injectables.TestConstant.resolve()).toBe("test");
  });

  test(`registerClass() returns a new ContainerBuilder with the class
  added.`, () => {
    class TestClass {}
    const injected = inject(TestClass, []);
    const key = new Key<"TestClass", TestClass>("TestClass");

    const containerBuilder = ContainerBuilder.createBuilder().registerClass(
      key,
      injected
    );
    expect(containerBuilder.injectables.TestClass).toBeInstanceOf(
      InjectedClass
    );
    expect(containerBuilder.injectables.TestClass.isSingleton).toBe(false);
    expect(containerBuilder.injectables.TestClass.resolve([])).toBeInstanceOf(
      TestClass
    );
  });

  test(`registerSingleton() returns a new ContainerBuilder with the singleton
  added.`, () => {
    class TestClass {}
    const injected = inject(TestClass, []);
    const key = new Key<"TestClass", TestClass>("TestClass");

    const containerBuilder = ContainerBuilder.createBuilder().registerSingleton(
      key,
      injected
    );
    expect(containerBuilder.injectables.TestClass).toBeInstanceOf(
      InjectedClass
    );
    expect(containerBuilder.injectables.TestClass.isSingleton).toBe(true);
    expect(containerBuilder.injectables.TestClass.resolve([])).toBeInstanceOf(
      TestClass
    );
  });

  test(`registerFunction() returns a new ContainerBuilder with the function
    added.`, () => {
    function testFunction(value: string) {}
    const bound = bind(testFunction, []);
    const key = new Key<"TestFunction", typeof testFunction>("TestFunction");

    const containerBuilder = ContainerBuilder.createBuilder().registerFunction(
      key,
      bound
    );
    expect(containerBuilder.injectables.TestFunction).toBeInstanceOf(
      BoundFunction
    );
    expect(
      containerBuilder.injectables.TestFunction.resolve([])
    ).toBeInstanceOf(Function);
  });

  test(`When an attempt is made to register an injectable to a key that is 
  already in use, a DuplicateKeyError is thrown.`, () => {
    const key = new Key<"TestConstant", string>("TestConstant");
    const containerBuilder = ContainerBuilder.createBuilder().registerConstant(
      key,
      "some value"
    );
    expect(() =>
      containerBuilder.registerConstant(key, "some other value")
    ).toThrow(new DuplicateKeyError(key.name));
  });
});
