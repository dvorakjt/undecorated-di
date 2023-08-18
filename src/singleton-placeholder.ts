import { UninitializedPropertyAccessError } from "./uninitialized-property-access-error";

export class SingletonPlaceholder<SingletonType extends Object> {
  instance? : SingletonType;
  proxy : SingletonType;

  constructor() {
    const self = this;
    this.proxy = new Proxy({} as SingletonType, {
      get(_target, prop) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError('Property of singleton accessed before it was instantiated. This is likely due to a reference to the property in the constructor of another class within a singleton dependency cycle.');
        }
        return self.instance[prop];
      },
      set(_target, prop, newValue) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError('Property of singleton accessed before it was instantiated. This is likely due to a reference to the property in the constructor of another class within a singleton dependency cycle.');
        }
        return self.instance[prop] = newValue;
      }
    });
  }
}