import { CircularDependencyError } from "./circular-dependency-error";
import { IService } from "./i-service.interface";
import { MissingDependencyError } from "./missing-dependency-error";

export class Container2<ServicesDictionaryType, SingletonInstancesDictionary> {
  serviceTemplates : ServicesDictionaryType;
  singletonInstances : SingletonInstancesDictionary;
  services : {
    [K in keyof this['serviceTemplates']] : typeof this['serviceTemplates'][K] extends IService ? ReturnType<this['serviceTemplates'][K]['getInstance']> : never
  } 

  constructor(serviceTemplates : ServicesDictionaryType, singletonInstances : SingletonInstancesDictionary) {
    this.serviceTemplates = serviceTemplates;
    this.singletonInstances = singletonInstances;
    const self = this;
    this.services = new Proxy({} as {
      [K in keyof this['serviceTemplates']] : typeof this['serviceTemplates'][K] extends IService ? ReturnType<this['serviceTemplates'][K]['getInstance']> : never
    } , {
      get(target, prop) {
        return self.getService(prop as keyof typeof self['serviceTemplates']);
      }
    })
  }

  public getService<K extends keyof this['serviceTemplates']>(serviceKey : K) : typeof this['serviceTemplates'][K] extends IService ? ReturnType<this['serviceTemplates'][K]['getInstance']> : never {
    return this.getServiceWithAncestralDependencies(serviceKey, new Set<K>());
  }

  private getServiceWithAncestralDependencies<K extends keyof this['serviceTemplates']>(serviceKey : K, ancestralDependencies : Set<K>) : typeof this['serviceTemplates'][K] extends IService ? ReturnType<this['serviceTemplates'][K]['getInstance']> : never {
    const possibleSingletonInstance = this.singletonInstances[serviceKey as keyof typeof this['singletonInstances']];
    if(possibleSingletonInstance) return possibleSingletonInstance as typeof this['serviceTemplates'][K] extends IService ? ReturnType<this['serviceTemplates'][K]['getInstance']> : never
    
    if(ancestralDependencies.has(serviceKey)) throw new CircularDependencyError(`${serviceKey.toString()} found in inherited dependencies of ${serviceKey.toString()}. This indicates a circular dependency.`);

    const service = this.serviceTemplates[serviceKey];
    if(!service) throw new MissingDependencyError(`Service with key ${serviceKey.toString()} not found.`);

    ancestralDependencies.add(serviceKey);
    const resolvedDependencies = (service as any).dependencies.map(dependency => {
      return this.getServiceWithAncestralDependencies(dependency, ancestralDependencies);
    });
    const instance = (service as typeof this['serviceTemplates'][K] extends IService ? typeof this['serviceTemplates'][K] : never).getInstance(resolvedDependencies);

    if(serviceKey in (this.singletonInstances as object)) {
      this.singletonInstances[serviceKey as keyof typeof this['singletonInstances']] = instance;
    }

    return instance;
  }
}