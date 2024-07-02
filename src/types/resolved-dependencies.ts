import type { Key } from "../classes/key";

export type ResolvedDependencies<T extends readonly Key[]> =
  T extends readonly [infer First, ...infer Rest]
    ? First extends Key
      ? [
          ReturnType<First["asType"]>,
          ...(Rest extends readonly Key[] ? ResolvedDependencies<Rest> : []),
        ]
      : never
    : [];
