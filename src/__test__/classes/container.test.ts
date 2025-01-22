import { describe, test, expect } from "vitest";
import {
  Container,
  ContainerBuilder,
  DependencyGraphNode,
  Key,
  Keys,
} from "../../classes";
import { bind, inject } from "../../functions";
import {
  CircularDependencyError,
  MissingDependencyError,
  MissingInjectableError,
  UninitializedPropertyAccessError,
} from "../../errors";

describe("Container", () => {
  test("getting a constant returns the value of the constant.", () => {
    const key = new Key<"TestConstant", string>("TestConstant");
    const value = "test";
    const container = ContainerBuilder.createBuilder()
      .registerConstant(key, value)
      .build();
    const retrieved = container.get(key);
    expect(retrieved).toBe(value);
  });

  test("getting a function returns the function.", () => {
    function testFunction() {
      return "test";
    }
    const key = new Key<"TestFunction", typeof testFunction>("TestFunction");
    const container = ContainerBuilder.createBuilder()
      .registerFunction(key, bind(testFunction, []))
      .build();
    expect(container.get(key)()).toBe(testFunction());
  });

  test("getting a class returns a new instance of the class each time.", () => {
    class TestClass {}
    const key = new Key<"TestClass", TestClass>("TestClass");
    const container = ContainerBuilder.createBuilder()
      .registerClass(key, inject(TestClass, []))
      .build();

    const instanceA = container.get(key);
    expect(instanceA).toBeInstanceOf(TestClass);

    const instanceB = container.get(key);
    expect(instanceB).toBeInstanceOf(TestClass);

    expect(instanceA).not.toBe(instanceB);
  });

  test("getting a singleton returns the same instance each time.", () => {
    class Singleton {
      #count = 0;

      public get count() {
        return this.#count;
      }

      increment() {
        this.#count++;
      }
    }
    const key = new Key<"Singleton", Singleton>("Singleton");
    const container = ContainerBuilder.createBuilder()
      .registerSingleton(key, inject(Singleton, []))
      .build();

    const firstRetrieval = container.get(key);
    expect(firstRetrieval).toBeInstanceOf(Singleton);

    const secondRetrieval = container.get(key);
    expect(secondRetrieval).toBeInstanceOf(Singleton);

    firstRetrieval.increment();
    expect(firstRetrieval.count).toBe(1);
    expect(secondRetrieval.count).toBe(1);

    secondRetrieval.increment();
    expect(firstRetrieval.count).toBe(2);
    expect(secondRetrieval.count).toBe(2);
  });

  test("calling get with an unregistered key throws a MissingInjectableError.", () => {
    const container = new Container({});
    expect(() =>
      container.get(new Key<"TestKey", string>("TestKey") as any)
    ).toThrow(new MissingInjectableError("TestKey"));
  });

  test(`getting a function that has dependencies returns the function with
  those dependencies resolved.`, () => {
    interface NumericBiFunc {
      (num1: number, num2: number): number;
    }

    interface ApplyTaxes {
      (price: number): number;
    }

    const { keys } = Keys.createKeys()
      .addKey("Multiply")
      .forType<NumericBiFunc>()
      .addKey("ApplyTaxes")
      .forType<ApplyTaxes>()
      .addKey("TaxRate")
      .forType<number>();

    function multiply(num1: number, num2: number) {
      return num1 * num2;
    }

    function applyBiFunc(biFunc: NumericBiFunc, num1: number, num2: number) {
      return biFunc(num1, num2);
    }

    const applyTaxes = bind(applyBiFunc, [keys.Multiply, keys.TaxRate]);

    const container = ContainerBuilder.createBuilder()
      .registerConstant(keys.TaxRate, 1.06)
      .registerFunction(keys.Multiply, bind(multiply, []))
      .registerFunction(keys.ApplyTaxes, applyTaxes)
      .build();

    expect(container.get(keys.ApplyTaxes)(100)).toBe(106);
  });

  test(`getting a class that has dependencies returns an instance of the
  class with those dependencies resolved.`, () => {
    interface NumericBiFunc {
      (num1: number, num2: number): number;
    }

    interface ApplyDiscount {
      (price: number): number;
    }

    interface SaleItem {
      getDiscountedPrice(): number;
    }

    const { keys } = Keys.createKeys()
      .addKey("Multiply")
      .forType<NumericBiFunc>()
      .addKey("ApplyDiscount")
      .forType<ApplyDiscount>()
      .addKey("Discount")
      .forType<number>()
      .addKey("SaleItem")
      .forType<SaleItem>();

    function multiply(num1: number, num2: number) {
      return num1 * num2;
    }

    function applyBiFunc(biFunc: NumericBiFunc, num1: number, num2: number) {
      return biFunc(num1, num2);
    }

    const applyDiscount = bind(applyBiFunc, [keys.Multiply, keys.Discount]);

    class DesktopComputer implements SaleItem {
      private applyDiscount: ApplyDiscount;
      private readonly normalPrice = 500;

      constructor(applyDiscount: ApplyDiscount) {
        this.applyDiscount = applyDiscount;
      }

      getDiscountedPrice(): number {
        return this.applyDiscount(this.normalPrice);
      }
    }

    const onSaleComputer = inject(DesktopComputer, [keys.ApplyDiscount]);

    const container = ContainerBuilder.createBuilder()
      .registerConstant(keys.Discount, 0.9)
      .registerFunction(keys.Multiply, bind(multiply, []))
      .registerFunction(keys.ApplyDiscount, applyDiscount)
      .registerClass(keys.SaleItem, onSaleComputer)
      .build();

    const saleItem = container.get(keys.SaleItem);
    expect(saleItem.getDiscountedPrice()).toBe(450);
  });

  test(`getting a singleton that has dependencies returns an instance of the
  singleton with those dependencies resolved.`, () => {
    interface ArrayEquals {
      equals(array1: Array<any>, array2: Array<any>): boolean;
    }

    interface ObjectEquals {
      equals(obj1: object, obj2: object): boolean;
    }

    const { keys } = Keys.createKeys()
      .addKey("ArrayEquals")
      .forType<ArrayEquals>()
      .addKey("ObjectEquals")
      .forType<ObjectEquals>();

    class ArrayEqualsImpl implements ArrayEquals {
      private objEquals: ObjectEquals;

      constructor(objEquals: ObjectEquals) {
        this.objEquals = objEquals;
      }

      equals(array1: any[], array2: any[]): boolean {
        if (array1.length !== array2.length) return false;

        for (let i = 0; i < array1.length; i++) {
          const item1 = array1[i];
          const item2 = array2[i];

          if (typeof item1 !== typeof item2) return false;

          if (typeof item1 === "object") {
            if (Array.isArray(item1)) {
              if (!Array.isArray(item2)) return false;
              if (!this.equals(item1, item2)) return false;
            } else {
              if (!this.objEquals.equals(item1, item2)) return false;
            }
          } else if (item1 !== item2) return false;
        }

        return true;
      }
    }

    class ObjectEqualsImpl implements ObjectEquals {
      private arrayEquals: ArrayEquals;

      constructor(arrayEquals: ArrayEquals) {
        this.arrayEquals = arrayEquals;
      }

      equals(obj1: object, obj2: object): boolean {
        const entries1 = Object.entries(obj1);
        const entries2 = Object.entries(obj2);

        if (entries1.length !== entries2.length) return false;

        for (let i = 0; i < entries1.length; i++) {
          const [key1, value1] = entries1[i];
          const [key2, value2] = entries2[i];

          if (key1 !== key2) return false;

          if (typeof value1 !== typeof value2) return false;

          if (typeof value1 === "object") {
            if (Array.isArray(value1)) {
              if (!Array.isArray(value2)) return false;
              if (!this.arrayEquals.equals(value1, value2)) return false;
            } else {
              if (!this.equals(value1, value2)) return false;
            }
          } else if (value1 !== value2) return false;
        }

        return true;
      }
    }

    const container = ContainerBuilder.createBuilder()
      .registerSingleton(
        keys.ArrayEquals,
        inject(ArrayEqualsImpl, [keys.ObjectEquals])
      )
      .registerSingleton(
        keys.ObjectEquals,
        inject(ObjectEqualsImpl, [keys.ArrayEquals])
      )
      .build();

    const objectEquals = container.get(keys.ObjectEquals);

    const object1 = {
      flag: true,
      string: "foo",
      number: 42,
      array: [
        true,
        "bar",
        {
          nestedArray: [1, 2, 3],
        },
      ],
    };

    const object2 = {
      flag: true,
      string: "foo",
      number: 42,
      array: [
        true,
        "bar",
        {
          nestedArray: [1, 2, 3],
        },
      ],
    };

    const object3 = {
      flag: true,
      string: "foo",
      number: 42,
      array: [
        true,
        "bar",
        {
          nestedArray: [3, 2, 1],
        },
      ],
    };

    expect(objectEquals.equals(object1, object2)).toBe(true);
    expect(objectEquals.equals(object1, object3)).toBe(false);
  });

  test(`getting an injectable that depends on an unregistered key throws a
  MissingDependencyError.`, () => {
    interface ApplyTaxes {
      (price: number): number;
    }

    const { keys } = Keys.createKeys()
      .addKey("ApplyTaxes")
      .forType<ApplyTaxes>()
      .addKey("TaxRate")
      .forType<number>();

    function applyTaxRate(taxRate: number, price: number) {
      return price * taxRate;
    }

    const applyTaxes = bind(applyTaxRate, [keys.TaxRate]);

    const container = ContainerBuilder.createBuilder()
      .registerFunction(keys.ApplyTaxes, applyTaxes)
      .build();

    expect(() => container.get(keys.ApplyTaxes)).toThrow(
      new MissingDependencyError(
        new DependencyGraphNode(
          keys.TaxRate.name,
          false,
          new DependencyGraphNode(keys.ApplyTaxes.name, false)
        )
      )
    );
  });

  test(`getting an injectable that is part of a dependency cycle that does not
  exclusively consist of singletons throws a CircularDependencyError.`, () => {
    class A {
      constructor(private b: B) {}
    }

    class B {
      constructor(private a: A) {}
    }

    const { keys } = Keys.createKeys()
      .addKey("A")
      .forType<A>()
      .addKey("B")
      .forType<B>();

    const container = ContainerBuilder.createBuilder()
      .registerClass(keys.A, inject(A, [keys.B]))
      .registerClass(keys.B, inject(B, [keys.A]))
      .build();

    expect(() => container.get(keys.A)).toThrow(
      new CircularDependencyError("A")
    );
  });

  test(`accessing a property of a singleton that is part of a cycle prior to the
  resolution of that cycle throws an UninitializedPropertyAccessError.`, () => {
    class ItemWithName {
      name = "Item";
      count: number;

      constructor(itemWithCount: ItemWithCount) {
        this.count = itemWithCount.count;
      }
    }

    class ItemWithCount {
      count = 42;
      name: string;

      constructor(itemWithName: ItemWithName) {
        this.name = itemWithName.name;
      }
    }

    const { keys } = Keys.createKeys()
      .addKey("ItemWithName")
      .forType<ItemWithName>()
      .addKey("ItemWithCount")
      .forType<ItemWithCount>();

    const container = ContainerBuilder.createBuilder()
      .registerSingleton(
        keys.ItemWithName,
        inject(ItemWithName, [keys.ItemWithCount])
      )
      .registerSingleton(
        keys.ItemWithCount,
        inject(ItemWithCount, [keys.ItemWithName])
      )
      .build();

    expect(() => container.get(keys.ItemWithName)).toThrow(
      new UninitializedPropertyAccessError()
    );
  });
});
