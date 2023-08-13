import type { Constructor } from "./constructor.type";

export class Service<AbstractType, ActualType extends AbstractType> {
  #actualConstructor: Constructor<ActualType>;
  dependencies: Array<string>;

  constructor(
    actualContructor: Constructor<ActualType>,
    dependencies: Array<string> = [],
  ) {
    this.#actualConstructor = actualContructor;
    this.dependencies = dependencies;
  }

  getInstance(resolvedDependencies: Array<any>): AbstractType {
    return new this.#actualConstructor(...resolvedDependencies) as AbstractType;
  }
}
