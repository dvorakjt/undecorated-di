export class Key<T extends string = string, V = any> {
  constructor(public readonly name: T) {}

  asType(implementation: any) {
    return implementation as V;
  }
}
