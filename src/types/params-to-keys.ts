import type { Key } from "../classes/key";

export type ParamsToKeys<P extends readonly any[]> = {
  [K in keyof P]: Key<string, P[K]>;
};
