import { CircularDependencyError } from "./circular-dependency-error";
import { MissingDependencyError } from "./missing-dependency-error";
import type { Instantiable } from "./get-instance.interface";
import { DependencyGraphNode } from "./dependency-graph-node";
import { SingletonPlaceholder } from "./singleton-placeholder";
import { DependencyArrayBearer } from "./dependency-array-bearer.interface";
import { ErrorMessages } from "./error-messages";

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
  private serviceTemplates: ServicesDictionary;
  private singletonInstances: SingletonInstancesDictionary<ServicesDictionary>;
  private singletonPlaceholders = {} as SingletonPlaceholderDictionary<ServicesDictionary>;

  services: {
    [K in keyof ServicesDictionary]: Instance<K, ServicesDictionary>
  };

  constructor(
    serviceTemplates: ServicesDictionary,
    singletonInstances: SingletonInstancesDictionary<ServicesDictionary>,
  ) {
    this.serviceTemplates = serviceTemplates;
    this.singletonInstances = singletonInstances;
    const self = this;
    this.services = new Proxy(
      {} as {
        [K in keyof ServicesDictionary]: Instance<K, ServicesDictionary>
      },
      {
        get(target, prop) {
          return self.getService(prop as keyof ServicesDictionary);
        },
      },
    );
  }

  private getService<K extends keyof ServicesDictionary>(
    serviceKey: K,
  ): Instance<K, ServicesDictionary> {
    return this.getServiceWithDependencyGraph(new DependencyGraphNode<K>(
      serviceKey,
      this.isSingleton(serviceKey)
    ));
  }

  private getServiceWithDependencyGraph<K extends keyof ServicesDictionary>(
    node : DependencyGraphNode<K>
  ) : Instance<K, ServicesDictionary> { 
    //if the singleton exists already, just return it
    if(node.isSingleton) {
      const singletonInstance = this.singletonInstances[node.serviceKey];
      if(singletonInstance) return singletonInstance as Instance<K, ServicesDictionary>;
    }

    //check for circular dependencies, return a proxy if the node completes a singleton dependency cycle
    if(this.completesSingletonOnlyDependencyCycle(node)) {
      if(!(node.serviceKey in this.singletonPlaceholders)) {
        this.singletonPlaceholders[node.serviceKey] = []
      }
      const placeholder = new SingletonPlaceholder<Instance<typeof node['serviceKey'], ServicesDictionary>>()
      this.singletonPlaceholders[node.serviceKey].push(placeholder);
      return placeholder.proxy;
    }

    //resolve dependencies
    const service = this.serviceTemplates[node.serviceKey];
    if (!service) {
      throw new MissingDependencyError(
        node.parent ? ErrorMessages.MISSING_DEPENDENCY_ERROR_WITH_DEPENDENCY_GRAPH(node) :
        ErrorMessages.MISSING_DEPENDENCY_ERROR(node.serviceKey)
      );
    }
    const resolvedDependencies = (service as unknown as DependencyArrayBearer<ServicesDictionary>).dependencies.map(
      (dependency: keyof ServicesDictionary) => {
        const childNode = new DependencyGraphNode(
          dependency,
          this.isSingleton(dependency),
          node
        )
        return this.getServiceWithDependencyGraph(childNode);
      }
    );

    const instance = (
      service as ServicesDictionary[K] extends Instantiable
        ? ServicesDictionary[K]
        : never
    ).getInstance(resolvedDependencies);

    if(node.isSingleton) {
      this.singletonInstances[node.serviceKey] = instance;
      if(node.serviceKey in this.singletonPlaceholders) {
        const placeholders = this.singletonPlaceholders[node.serviceKey] as Array<SingletonPlaceholder<Instance<typeof node['serviceKey'], ServicesDictionary>>>;
        placeholders.forEach(placeholder => {
          placeholder.instance = instance
        });
        delete this.singletonPlaceholders[node.serviceKey];
      }
    }

    return instance;
  }

  private isSingleton<K extends keyof SingletonInstancesDictionary<ServicesDictionary>>(serviceKey : K) {
    return serviceKey in this.singletonInstances;
  }

  private completesSingletonOnlyDependencyCycle<K extends keyof ServicesDictionary>(node : DependencyGraphNode<K>) {
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
}

export { Container, type Instance, type SingletonInstancesDictionary };