import type { InjectableOrBindable, ParamsToKeys, Subset } from "../types";

export function bind<
  T extends (...args: any[]) => any,
  V extends ParamsToKeys<Subset<Parameters<T>>>,
>(func: T, deps: V) {
  const bound = ((...args: Parameters<T>) =>
    func(...args)) as InjectableOrBindable<T, V>;
  bound.__dependencies__ = deps;
  return bound;
}
