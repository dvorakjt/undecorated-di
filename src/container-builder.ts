import { Container } from "./container";
import { Container2 } from "./container2";
import { Container3 } from "./container3";
import { IService } from "./i-service.interface";
import { mergeDictionaries } from "./util/merge-dictionaries";

export class ContainerBuilder<ServicesDictionaryType, SingletonInstancesDictionaryType> {
  static createContainerBuilder() {
    return new ContainerBuilder({}, {});
  }

  servicesDictionary : ServicesDictionaryType;
  singletonInstancesDictionary : SingletonInstancesDictionaryType;

  private constructor(
    transientServiceDictionary : ServicesDictionaryType,
    singletonInstancesDictionary : SingletonInstancesDictionaryType
  ) {
    this.servicesDictionary = transientServiceDictionary;
    this.singletonInstancesDictionary = singletonInstancesDictionary;
  }

  registerTransientService<AdditionalServiceDictionary>(additionalServiceDictionary : AdditionalServiceDictionary) {
    const expandedServicesDictionary = mergeDictionaries(
      this.servicesDictionary,
      additionalServiceDictionary
    );
    return new ContainerBuilder(expandedServicesDictionary, this.singletonInstancesDictionary);
  }

  registerSingletonService<AdditionalServiceDictionary>(additionalServiceDictionary : AdditionalServiceDictionary) {
    const expandedServicesDictionary = mergeDictionaries(
      this.servicesDictionary,
      additionalServiceDictionary
    );
    const additionalSingletonInstanceDictionary = this.createSingletonInstancesDictionary(additionalServiceDictionary); 
    const expandedSingletonInstancesDictionary = mergeDictionaries(
      this.singletonInstancesDictionary,
      additionalSingletonInstanceDictionary
    );
    return new ContainerBuilder(expandedServicesDictionary, expandedSingletonInstancesDictionary);
  }

  build() {
    return new Container3(this.servicesDictionary, this.singletonInstancesDictionary);
  }

  private createSingletonInstancesDictionary<AdditionalServiceDictionary>(additionalServiceDictionary : AdditionalServiceDictionary) 
  : {[K in keyof AdditionalServiceDictionary] : AdditionalServiceDictionary[K] extends IService ? (ReturnType<AdditionalServiceDictionary[K]['getInstance']> | undefined): never}{
    const singletonInstanceDictionary : any = {};
    for(const key in additionalServiceDictionary) {
      singletonInstanceDictionary[key] = undefined;
    }
    return singletonInstanceDictionary as {[K in keyof AdditionalServiceDictionary] : AdditionalServiceDictionary[K] extends IService ? (ReturnType<AdditionalServiceDictionary[K]['getInstance']> | undefined): never};
  }
}