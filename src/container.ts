import { CircularDependencyError } from "./circular-dependency-error";
import { IService } from "./i-service.interface";
import { MissingDependencyError } from "./missing-dependency-error";

export class Container<ServicesDictionaryType, SingletonInstancesDictionary> {
  services : ServicesDictionaryType;
  singletonInstances : SingletonInstancesDictionary;

  constructor(services : ServicesDictionaryType, singletonInstances) {
    this.services = services;
    this.singletonInstances = singletonInstances;
  }

  public getService<K extends keyof this['services']>(serviceKey : K) : typeof this['services'][K] extends IService ? ReturnType<this['services'][K]['getInstance']> : never {
    return this.getServiceWithAncestralDependencies(serviceKey, new Set<K>());
  }

  private getServiceWithAncestralDependencies<K extends keyof this['services']>(serviceKey : K, ancestralDependencies : Set<K>) : typeof this['services'][K] extends IService ? ReturnType<this['services'][K]['getInstance']> : never {
    const possibleSingletonInstance = this.singletonInstances[serviceKey as keyof typeof this['singletonInstances']];
    if(possibleSingletonInstance) return possibleSingletonInstance as typeof this['services'][K] extends IService ? ReturnType<this['services'][K]['getInstance']> : never
    
    if(ancestralDependencies.has(serviceKey)) throw new CircularDependencyError(`${serviceKey.toString()} found in inherited dependencies of ${serviceKey.toString()}. This indicates a circular dependency.`);

    const service = this.services[serviceKey];
    if(!service) throw new MissingDependencyError(`Service with key ${serviceKey.toString()} not found.`);

    ancestralDependencies.add(serviceKey);
    const resolvedDependencies = (service as any).dependencies.map(dependency => {
      return this.getServiceWithAncestralDependencies(dependency, ancestralDependencies);
    });
    const instance = (service as typeof this['services'][K] extends IService ? typeof this['services'][K] : never).getInstance(resolvedDependencies);

    if(serviceKey in (this.singletonInstances as object)) {
      this.singletonInstances[serviceKey as keyof typeof this['singletonInstances']] = instance;
    }

    return instance;
  }
}