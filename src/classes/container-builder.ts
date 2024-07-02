import { Container } from "./container";
import { InjectedClass } from "./injected-class";
import { BoundFunction } from "./bound-function";
import { Constant } from "./constant";
import { DuplicateKeyError } from "../errors";
import type { Key } from "./key";
import type { Injectable } from "../interfaces";
import type {
  Constructor,
  InjectableOrBindable,
  ParamsToKeys,
  ResolvedDependencies,
} from "../types";

export class ContainerBuilder<T extends Record<string, Injectable>> {
  private constructor(public readonly injectables: T) {}

  public static createBuilder() {
    return new ContainerBuilder({});
  }

  public registerClass<
    T extends string,
    S,
    U extends Constructor<S>,
    V extends ParamsToKeys<ConstructorParameters<U>>,
  >(key: Key<T, S>, injectable: InjectableOrBindable<U, V>) {
    const injectableClass = new InjectedClass(key, injectable, false);
    return this.register<T, typeof injectableClass>(key.name, injectableClass);
  }

  public registerSingleton<
    T extends string,
    S,
    U extends Constructor<S>,
    V extends ParamsToKeys<ConstructorParameters<U>>,
  >(key: Key<T, S>, injectable: InjectableOrBindable<U, V>) {
    const singleton = new InjectedClass(key, injectable, true);
    return this.register<T, typeof singleton>(key.name, singleton);
  }

  public registerFunction<
    T extends string,
    S extends (...args: any[]) => any,
    U extends readonly Key[],
    V extends (
      ...args: [...ResolvedDependencies<U>, ...Parameters<S>]
    ) => ReturnType<ReturnType<S>>,
  >(key: Key<T, S>, bindable: InjectableOrBindable<V, U>) {
    const boundFunc = new BoundFunction(key, bindable);
    return this.register<T, typeof boundFunc>(key.name, boundFunc);
  }

  public registerConstant<T extends string, V>(key: Key<T, V>, value: V) {
    const constant = new Constant(value);
    return this.register<T, typeof constant>(key.name, constant);
  }

  public build() {
    return new Container(this.injectables);
  }

  private register<T extends string, V extends Injectable>(
    keyName: T,
    injectable: V
  ) {
    if (keyName in this.injectables) {
      throw new DuplicateKeyError(keyName);
    }

    const injectables = {
      ...this.injectables,
      [keyName]: injectable,
    } as this["injectables"] & {
      [K in T]: V;
    };

    return new ContainerBuilder(injectables);
  }
}
