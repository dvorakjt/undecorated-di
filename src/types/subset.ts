export type Subset<T extends any[]> = T extends [infer First, ...infer Rest]
  ? [] | [First, ...Subset<Rest>]
  : [];
