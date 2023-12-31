import { Container, Instance, SingletonInstancesDictionary } from "./container";
import { mergeDictionaries } from "./merge-dictionaries";
import type { Instantiable } from "./instantiable.interface";

/**
 * Used to build a dependency injection container. In service class files, call autowire() on the class, and export the returned value as default.
 * Import these exports into the file in which a container is to be declared, and then use a ContainerBuilder to construct a container.
 */
export class ContainerBuilder<
  ServicesDictionaryType,
  SingletonInstancesDictionaryType,
> {
  static #isInternalConstructing = false;
  /**
   * returns a new ContainerBuilder with empty servicesDictionary and singletonInstancesDictionary. Use this to get a new ContainerBuilder.
   * @returns ContainerBuilder<{}, {}>;
   */
  static createContainerBuilder() {
    ContainerBuilder.#isInternalConstructing = true;
    return new ContainerBuilder({}, {});
  }
  
  servicesDictionary: ServicesDictionaryType;
  singletonInstancesDictionary: SingletonInstancesDictionaryType;

  constructor(
    transientServiceDictionary: ServicesDictionaryType,
    singletonInstancesDictionary: SingletonInstancesDictionaryType,
  ) {
    if (!ContainerBuilder.#isInternalConstructing) {
      throw new TypeError("ContainerBuilder is not constructable. Use ContainerBuilder.createContainerBuilder() instead.");
    }
    ContainerBuilder.#isInternalConstructing = false;
    this.servicesDictionary = transientServiceDictionary;
    this.singletonInstancesDictionary = singletonInstancesDictionary;
  }

  /**
   * Registers a service in transient scope (a new instance will be returned each time it is accessed from the container), and returns a new ContainerBuilder.
   * @param additionalServiceDictionary - Pass in value returned by autowire.
   * @returns ContainerBuilder
   */
  registerTransientService<AdditionalServiceDictionary>(
    additionalServiceDictionary: AdditionalServiceDictionary,
  ) {
    const expandedServicesDictionary = mergeDictionaries(
      this.servicesDictionary,
      additionalServiceDictionary,
    );
    ContainerBuilder.#isInternalConstructing = true;
    return new ContainerBuilder(
      expandedServicesDictionary,
      this.singletonInstancesDictionary,
    );
  }

  /**
   * Registers a service in singleton scope (the same instance will be returned each time it is accessed from the container), and returns a new ContainerBuilder.
   * @param additionalServiceDictionary - Pass in value returned by autowire.
   * @returns ContainerBuilder
   */
  registerSingletonService<AdditionalServiceDictionary>(
    additionalServiceDictionary: AdditionalServiceDictionary,
  ) {
    const expandedServicesDictionary = mergeDictionaries(
      this.servicesDictionary,
      additionalServiceDictionary,
    );
    const additionalSingletonInstanceDictionary =
      this.#createSingletonInstancesDictionary(additionalServiceDictionary);
    const expandedSingletonInstancesDictionary = mergeDictionaries(
      this.singletonInstancesDictionary,
      additionalSingletonInstanceDictionary,
    );
    ContainerBuilder.#isInternalConstructing = true;
    return new ContainerBuilder(
      expandedServicesDictionary,
      expandedSingletonInstancesDictionary,
    );
  }

  /**
   * Once all of the necessary services have been registered, call this method to build a Container.
   * @returns Container
   */
  build() {
    return new Container(
      this.servicesDictionary,
      this.singletonInstancesDictionary as SingletonInstancesDictionary<this['servicesDictionary']>,
    );
  }

  #createSingletonInstancesDictionary<AdditionalServiceDictionary>(
    additionalServiceDictionary: AdditionalServiceDictionary,
  ): {
    [K in keyof AdditionalServiceDictionary]: AdditionalServiceDictionary[K] extends Instantiable
      ? Instance<K, AdditionalServiceDictionary> | undefined
      : never;
  } {
    const singletonInstanceDictionary: any = {};
    for (const key in additionalServiceDictionary) {
      singletonInstanceDictionary[key] = undefined;
    }
    return singletonInstanceDictionary as {
      [K in keyof AdditionalServiceDictionary]: AdditionalServiceDictionary[K] extends Instantiable
        ? Instance<K, AdditionalServiceDictionary> | undefined
        : never;
    };
  }
}
