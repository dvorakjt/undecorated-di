export class Constant<V> {
  constructor(private readonly value: V) {}

  public resolve() {
    return this.value;
  }
}
