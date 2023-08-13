import { CircularDependencyError } from "./circular-dependency-error";
import { IService } from "./i-service.interface";
import { MissingDependencyError } from "./missing-dependency-error";

export class Container3<ServicesDictionaryType, SingletonInstancesDictionary> {
  private serviceTemplates : ServicesDictionaryType;
  private singletonInstances : SingletonInstancesDictionary;
  services : {
    [K in keyof ServicesDictionaryType] : ServicesDictionaryType[K] extends IService ? ReturnType<ServicesDictionaryType[K]['getInstance']> : never
  } 

  constructor(serviceTemplates : ServicesDictionaryType, singletonInstances : SingletonInstancesDictionary) {
    this.serviceTemplates = serviceTemplates;
    this.singletonInstances = singletonInstances;
    const self = this;
    this.services = new Proxy({} as {
      [K in keyof ServicesDictionaryType] : ServicesDictionaryType[K] extends IService ? ReturnType<ServicesDictionaryType[K]['getInstance']> : never
    } , {
      get(target, prop) {
        return self.getService(prop as keyof ServicesDictionaryType);
      }
    })
  }

  private getService<K extends keyof ServicesDictionaryType>(serviceKey : K) : ServicesDictionaryType[K] extends IService ? ReturnType<ServicesDictionaryType[K]['getInstance']> : never {
    return this.getServiceWithAncestralDependencies(serviceKey, new Set<K>());
  }

  private getServiceWithAncestralDependencies<K extends keyof ServicesDictionaryType>(serviceKey : K, ancestralDependencies : Set<K>) : ServicesDictionaryType[K] extends IService ? ReturnType<ServicesDictionaryType[K]['getInstance']> : never {
    const possibleSingletonInstance = this.singletonInstances[serviceKey as unknown as keyof SingletonInstancesDictionary];
    if(possibleSingletonInstance) return possibleSingletonInstance as ServicesDictionaryType[K] extends IService ? ReturnType<ServicesDictionaryType[K]['getInstance']> : never
    
    if(ancestralDependencies.has(serviceKey)) throw new CircularDependencyError(`${serviceKey.toString()} found in inherited dependencies of ${serviceKey.toString()}. This indicates a circular dependency.`);

    const service = this.serviceTemplates[serviceKey];
    if(!service) throw new MissingDependencyError(`Service with key ${serviceKey.toString()} not found.`);

    ancestralDependencies.add(serviceKey);
    const resolvedDependencies = (service as any).dependencies.map(dependency => {
      return this.getServiceWithAncestralDependencies(dependency, ancestralDependencies);
    });
    const instance = (service as ServicesDictionaryType[K] extends IService ? ServicesDictionaryType[K] : never).getInstance(resolvedDependencies);

    if(serviceKey in (this.singletonInstances as object)) {
      this.singletonInstances[serviceKey as unknown as keyof SingletonInstancesDictionary] = instance;
    }

    return instance;
  }
}