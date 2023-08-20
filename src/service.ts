import type { Constructor } from "./constructor.type";

export class Service<Interface, Implementation extends Interface> {
  #actualConstructor: Constructor<Implementation>;
  dependencies: Array<string>;

  constructor(
    actualContructor: Constructor<Implementation>,
    dependencies: Array<string> = [],
  ) {
    this.#actualConstructor = actualContructor;
    this.dependencies = dependencies;
  }

  getInstance(resolvedDependencies: Array<any>): Interface {
    return new this.#actualConstructor(...resolvedDependencies) as Interface;
  }
}
