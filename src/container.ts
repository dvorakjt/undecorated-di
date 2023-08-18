import { CircularDependencyError } from "./circular-dependency-error";
import { MissingDependencyError } from "./missing-dependency-error";
import type { IService } from "./i-service.interface";
import { DependencyGraphNode } from "./dependency-graph-node";
import { SingletonPlaceholder } from "./singleton-placeholder";

type Instance<K extends keyof ServicesDictionary, ServicesDictionary> = 
  ServicesDictionary[K] extends IService ? ReturnType<ServicesDictionary[K]["getInstance"]> : never;

type SingletonPlaceholderDictionary<ServicesDictionary> = {
  [K in keyof ServicesDictionary] : 
    Array<SingletonPlaceholder<Instance<K, ServicesDictionary>>>
}

export class Container<ServicesDictionary, SingletonInstancesDictionary> {
  private serviceTemplates: ServicesDictionary;
  private singletonInstances: SingletonInstancesDictionary;
  private singletonPlaceholders = {} as SingletonPlaceholderDictionary<ServicesDictionary>;

  services: {
    [K in keyof ServicesDictionary]: Instance<K, ServicesDictionary>
  };

  constructor(
    serviceTemplates: ServicesDictionary,
    singletonInstances: SingletonInstancesDictionary,
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
      const singletonInstance = this.singletonInstances[node.serviceKey as unknown as keyof SingletonInstancesDictionary];
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
      console.log(node.serviceKey);

      throw new MissingDependencyError(
        `Service with key ${node.serviceKey.toString()} not found.`,
      );
    }
    const resolvedDependencies = (service as any).dependencies.map(
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
      service as ServicesDictionary[K] extends IService
        ? ServicesDictionary[K]
        : never
    ).getInstance(resolvedDependencies);

    if(node.isSingleton) {
      this.singletonInstances[
        node.serviceKey as unknown as keyof SingletonInstancesDictionary
      ] = instance;
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

  private isSingleton(serviceKey : any) {
    return serviceKey in (this.singletonInstances as object);
  }

  //must also not depend on itself?
  private completesSingletonOnlyDependencyCycle(node : DependencyGraphNode<any>) {
    const { serviceKey } = node;
    let containsOnlySingletons = node.isSingleton;

    while(node.parent) {
      node = node.parent;
      if(!node.isSingleton) containsOnlySingletons = false;
      if(node.serviceKey === serviceKey) {
        if(!containsOnlySingletons) {
          throw new CircularDependencyError(
            `${serviceKey.toString()} found in inherited dependencies of ${serviceKey.toString()}. This indicates a circular dependency which cannot be resolved.`
          );
        }
      
        return true;
      }
    }

    return false;
  }
}
