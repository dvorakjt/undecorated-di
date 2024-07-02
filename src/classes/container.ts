import { DependencyGraphNode } from "./dependency-graph-node";
import { InjectedClass } from "./injected-class";
import { Constant } from "./constant";
import { SingletonPlaceholder } from "./singleton-placeholder";
import {
  CircularDependencyError,
  MissingInjectableError,
  MissingDependencyError,
} from "../errors";
import type { Key } from "./key";
import type { Injectable } from "../interfaces";

type Singletons<T extends Record<string, Injectable>> = {
  [K in keyof T]+?: ReturnType<T[K]["resolve"]>;
};

type SingletonPlaceholders<T extends Record<string, Injectable>> = {
  [K in keyof T]+?: Array<SingletonPlaceholder<ReturnType<T[K]["resolve"]>>>;
};

export class Container<T extends Record<string, Injectable>> {
  private resolvedInjectables = new Set<string>();
  private singletons: Singletons<T> = {};
  private singletonPlaceholders: SingletonPlaceholders<T> = {};

  constructor(public readonly injectables: T) {}

  public get<K extends keyof T & string>(
    key: Key<K, ReturnType<T[K]["resolve"]>>
  ): ReturnType<T[K]["resolve"]> {
    const dependencyGraphNode = new DependencyGraphNode<K>(
      key.name,
      this.isSingleton(key.name)
    );

    return this.resolveWithDependencyGraph(dependencyGraphNode);
  }

  private resolveWithDependencyGraph<K extends keyof T & string>(
    node: DependencyGraphNode<K>
  ): ReturnType<T[K]["resolve"]> {
    const singleton = this.singletons[node.keyName];
    if (singleton) return singleton;

    const injectable = this.injectables[node.keyName];

    if (!injectable) {
      if (!node.parent) {
        throw new MissingInjectableError(node.keyName);
      } else {
        throw new MissingDependencyError(node);
      }
    }

    if (injectable instanceof Constant) {
      return injectable.resolve();
    }

    if (
      !this.wasPreviouslyResolved(node.keyName) &&
      this.completesSingletonOnlyDependencyCycle(node)
    ) {
      if (!(node.keyName in this.singletonPlaceholders)) {
        this.singletonPlaceholders[node.keyName] = [];
      }

      const placeholder = new SingletonPlaceholder<
        ReturnType<T[K]["resolve"]>
      >();

      this.singletonPlaceholders[node.keyName]!.push(placeholder);
      return placeholder.proxy;
    }

    const resolvedDependencies = (injectable as any).dependencies.map(
      (dependency: Key<keyof T & string>) => {
        const childNode = new DependencyGraphNode(
          dependency.name,
          this.isSingleton(dependency.name),
          node
        );
        return this.resolveWithDependencyGraph(childNode);
      }
    );

    const instance =
      this.injectables[node.keyName].resolve(resolvedDependencies);

    if (node.isSingleton) {
      this.singletons[node.keyName] = instance;
      if (node.keyName in this.singletonPlaceholders) {
        const placeholders = this.singletonPlaceholders[node.keyName] as Array<
          SingletonPlaceholder<ReturnType<T[K]["resolve"]>>
        >;

        placeholders.forEach((placeholder) => {
          placeholder.instance = instance;
        });

        delete this.singletonPlaceholders[node.keyName];
      }
    }

    this.flagResolved(node.keyName);

    return instance;
  }

  private isSingleton<K extends keyof this["injectables"] & string>(
    keyName: K
  ): boolean {
    const injectable = this.injectables[keyName];
    return injectable instanceof InjectedClass && injectable.isSingleton;
  }

  private wasPreviouslyResolved(keyName: string) {
    return this.resolvedInjectables.has(keyName);
  }

  private completesSingletonOnlyDependencyCycle<K extends keyof T & string>(
    node: DependencyGraphNode<K>
  ) {
    const { keyName } = node;
    let containsOnlySingletons = node.isSingleton;

    while (node.parent) {
      node = node.parent;
      if (!node.isSingleton) containsOnlySingletons = false;
      if (node.keyName === keyName) {
        if (!containsOnlySingletons) {
          throw new CircularDependencyError(keyName);
        }

        return true;
      }
    }

    return false;
  }

  private flagResolved(keyName: string) {
    this.resolvedInjectables.add(keyName);
  }
}
