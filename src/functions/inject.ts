import type { Constructor, InjectableOrBindable, ParamsToKeys } from "../types";

export function inject<
  T,
  U extends Constructor<T>,
  V extends ParamsToKeys<ConstructorParameters<U>>,
>(cls: U, dependencies: V) {
  const injected = cls as InjectableOrBindable<U, V>;
  injected.__dependencies__ = dependencies;
  return injected;
}
