import type { Key } from "../classes/key";

export type InjectableOrBindable<
  T = any,
  V extends ReadonlyArray<Key> = []
> = T & {
  __dependencies__: V;
};
