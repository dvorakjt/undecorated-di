import { ErrorMessages } from "./error-messages";
import { UninitializedPropertyAccessError } from "./uninitialized-property-access-error";

export class SingletonPlaceholder<SingletonType extends Object> {
  instance? : SingletonType;
  proxy : SingletonType;

  constructor() {
    const self = this;
    this.proxy = new Proxy({} as SingletonType, {
      get(_target, prop) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return self.instance[prop];
      },
      set(_target, prop, newValue) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return self.instance[prop] = newValue;
      },
      getPrototypeOf(_target) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return Object.getPrototypeOf(self.instance);
      },
      defineProperty(_target, prop, descriptor) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        Object.defineProperty(self.instance, prop, descriptor);
        return prop in self.instance;
      },
      deleteProperty(_target, prop) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return delete self.instance[prop];
      },
      getOwnPropertyDescriptor(_target, prop) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return Object.getOwnPropertyDescriptor(self.instance, prop);
      },
      has(_target, prop) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return prop in self.instance;
      },
      isExtensible(_target) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return Object.isExtensible(self.instance);
      },
      ownKeys(_target) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        return Object.keys(self.instance);
      },
      preventExtensions(_target) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        Object.preventExtensions(self.instance);
        return true;
      },
      setPrototypeOf(_target, proto) {
        if(!self.instance) {
          throw new UninitializedPropertyAccessError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
        }
        Object.setPrototypeOf(self.instance, proto);
        return true;
      }
    });
  }
}