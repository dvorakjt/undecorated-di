import type { InjectableOrBindable, ResolvedDependencies } from "../types";
import type { Key } from "./key";

export class BoundFunction<
  T extends (...args: any[]) => any,
  U extends readonly Key[],
  V extends (
    ...args: [...ResolvedDependencies<U>, ...Parameters<T>]
  ) => ReturnType<T>,
> {
  public readonly dependencies: U;
  private key: Key<string, T>;
  private bindable: InjectableOrBindable<V, U>;

  public constructor(
    key: Key<string, T>,
    bindable: InjectableOrBindable<V, U>
  ) {
    this.key = key;
    this.bindable = bindable;
    this.dependencies = bindable.__dependencies__;
  }

  public resolve(resolvedDependencies: ResolvedDependencies<U>) {
    return this.key.asType(
      this.bindable.bind(this.bindable, ...resolvedDependencies)
    );
  }
}
