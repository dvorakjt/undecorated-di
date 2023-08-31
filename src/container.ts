import { CircularDependencyError } from "./circular-dependency-error";
import { MissingDependencyError } from "./missing-dependency-error";
import type { Instantiable } from "./instantiable.interface";
import { DependencyGraphNode } from "./dependency-graph-node";
import { SingletonPlaceholder } from "./singleton-placeholder";
import { DependencyArrayBearer } from "./dependency-array-bearer.interface";
import { ErrorMessages } from "./error-messages";
import { ServiceNotFoundError } from "./service-not-found-error";

type Instance<K extends keyof ServicesDictionary, ServicesDictionary> = 
  ServicesDictionary[K] extends Instantiable ? ReturnType<ServicesDictionary[K]["getInstance"]> : never;

type SingletonPlaceholderDictionary<ServicesDictionary> = {
  [K in keyof ServicesDictionary] : 
    Array<SingletonPlaceholder<Instance<K, ServicesDictionary>>>
}

type SingletonInstancesDictionary<ServicesDictionary> = {
  [K in keyof ServicesDictionary] : Instance<K, ServicesDictionary> | undefined;
}

class Container<ServicesDictionary> {
  #serviceTemplates: ServicesDictionary;
  #singletonInstances: SingletonInstancesDictionary<ServicesDictionary>;
  #singletonPlaceholders = {} as SingletonPlaceholderDictionary<ServicesDictionary>;
  #resolvedServices = new Set<keyof ServicesDictionary>();

  services: {
    [K in keyof ServicesDictionary]: Instance<K, ServicesDictionary>
  };

  constructor(
    serviceTemplates: ServicesDictionary,
    singletonInstances: SingletonInstancesDictionary<ServicesDictionary>,
  ) {
    this.#serviceTemplates = serviceTemplates;
    this.#singletonInstances = singletonInstances;
    const self = this;
    this.services = new Proxy(
      {} as {
        [K in keyof ServicesDictionary]: Instance<K, ServicesDictionary>
      },
      {
        get(_target, prop) {
          return self.#getService(prop as keyof ServicesDictionary);
        },
      },
    );
  }

  #getService<K extends keyof ServicesDictionary>(
    serviceKey: K,
  ): Instance<K, ServicesDictionary> {
    return this.#getServiceWithDependencyGraph(new DependencyGraphNode<K>(
      serviceKey,
      this.#isSingleton(serviceKey)
    ));
  }

  #getServiceWithDependencyGraph<K extends keyof ServicesDictionary>(
    node : DependencyGraphNode<K>
  ) : Instance<K, ServicesDictionary> {
    if(node.isSingleton) {
      const singletonInstance = this.#singletonInstances[node.serviceKey];
      if(singletonInstance) return singletonInstance as Instance<K, ServicesDictionary>;
    }

    if(!this.#wasPreviouslyResolved(node.serviceKey) && this.#completesSingletonOnlyDependencyCycle(node)) {
      if(!(node.serviceKey in this.#singletonPlaceholders)) {
        this.#singletonPlaceholders[node.serviceKey] = [];
      }
      const placeholder = new SingletonPlaceholder<Instance<typeof node['serviceKey'], ServicesDictionary>>()
      this.#singletonPlaceholders[node.serviceKey].push(placeholder);
      return placeholder.proxy;
    }

    const service = this.#serviceTemplates[node.serviceKey];
    if (!service) {
      if(node.parent) {
        throw new MissingDependencyError(
          ErrorMessages.MISSING_DEPENDENCY_ERROR_WITH_DEPENDENCY_GRAPH(node)
        );
      } else {
        throw new ServiceNotFoundError(ErrorMessages.SERVICE_NOT_FOUND(node.serviceKey));
      }
    }
    const resolvedDependencies = (service as unknown as DependencyArrayBearer<ServicesDictionary>).dependencies.map(
      (dependency: keyof ServicesDictionary) => {
        const childNode = new DependencyGraphNode(
          dependency,
          this.#isSingleton(dependency),
          node
        )
        return this.#getServiceWithDependencyGraph(childNode);
      }
    );

    const instance = (
      service as ServicesDictionary[K] extends Instantiable
        ? ServicesDictionary[K]
        : never
    ).getInstance(resolvedDependencies);

    if(node.isSingleton) {
      this.#singletonInstances[node.serviceKey] = instance;
      if(node.serviceKey in this.#singletonPlaceholders) {
        const placeholders = this.#singletonPlaceholders[node.serviceKey] as Array<SingletonPlaceholder<Instance<typeof node['serviceKey'], ServicesDictionary>>>;
        placeholders.forEach(placeholder => {
          placeholder.instance = instance
        });
        delete this.#singletonPlaceholders[node.serviceKey];
      }
    }

    this.#flagAsResolved(node.serviceKey);

    return instance;
  }

  #isSingleton<K extends keyof SingletonInstancesDictionary<ServicesDictionary>>(serviceKey : K) {
    return serviceKey in this.#singletonInstances;
  }

  #wasPreviouslyResolved<K extends keyof ServicesDictionary>(serviceKey : K) {
    return this.#resolvedServices.has(serviceKey);
  }

  #completesSingletonOnlyDependencyCycle<K extends keyof ServicesDictionary>(node : DependencyGraphNode<K>) {
    const { serviceKey } = node;
    let containsOnlySingletons = node.isSingleton;

    while(node.parent) {
      node = node.parent;
      if(!node.isSingleton) containsOnlySingletons = false;
      if(node.serviceKey === serviceKey) {
        if(!containsOnlySingletons) {
          throw new CircularDependencyError(ErrorMessages.CIRCULAR_DEPENDENCY_ERROR(serviceKey));
        }
      
        return true;
      }
    }

    return false;
  }

  #flagAsResolved<K extends keyof ServicesDictionary>(serviceKey : K) {
    this.#resolvedServices.add(serviceKey);
  }
}

export { Container, type Instance, type SingletonInstancesDictionary };