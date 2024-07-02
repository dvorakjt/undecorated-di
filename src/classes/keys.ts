import { DuplicateKeyError } from "../errors";
import { Key } from "./key";

type ForTypeReturnType<
  S extends string,
  T extends Record<string, Key>,
  U,
> = Keys<T & { [K in S]: Key<S, U> }>;

type ForType<S extends string, T extends Record<string, Key>> = {
  forType: <U>() => ForTypeReturnType<S, T, U>;
};

export class Keys<T extends Record<string, Key>> {
  private constructor(public readonly keys: T) {}

  public static createKeys() {
    return new Keys({});
  }

  public addKey<S extends string>(name: S): ForType<S, this["keys"]> {
    if (name in this.keys) {
      throw new DuplicateKeyError(name);
    }

    return {
      forType: <U>() => {
        const keys = {
          ...this.keys,
          [name]: new Key<S, U>(name),
        };

        return new Keys(keys);
      },
    } as ForType<S, this["keys"]>;
  }
}
