import type {
  Constructor,
  InjectableOrBindable,
  ParamsToKeys,
  ResolvedDependencies,
} from "../types";
import type { Key } from "./key";

export class InjectedClass<
  T,
  U extends Constructor<T>,
  V extends ParamsToKeys<ConstructorParameters<U>>,
> {
  public readonly dependencies: V;
  public readonly isSingleton: boolean;
  private injectable: InjectableOrBindable<U, V>;
  private key: Key<string, T>;

  public constructor(
    key: Key<string, T>,
    injectable: InjectableOrBindable<U, V>,
    isSingleton: boolean
  ) {
    this.key = key;
    this.injectable = injectable;
    this.dependencies = injectable.__dependencies__;
    this.isSingleton = isSingleton;
  }

  public resolve(resolvedDependencies: ResolvedDependencies<V>) {
    return this.key.asType(new this.injectable(...resolvedDependencies));
  }
}
