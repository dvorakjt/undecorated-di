import { UninitializedPropertyAccessError } from "../errors";

export class SingletonPlaceholder<SingletonType extends Object> {
  instance?: SingletonType;
  proxy: SingletonType;

  constructor() {
    const self = this;
    this.proxy = new Proxy({} as SingletonType, {
      get(_target, prop) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.get(self.instance, prop);
      },
      set(_target, prop, newValue) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.set(self.instance, prop, newValue);
      },
      getPrototypeOf(_target) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.getPrototypeOf(self.instance);
      },
      setPrototypeOf(_target, proto) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.setPrototypeOf(self.instance, proto);
      },
      defineProperty(_target, prop, descriptor) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.defineProperty(self.instance, prop, descriptor);
      },
      deleteProperty(_target, prop) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.deleteProperty(self.instance, prop);
      },
      getOwnPropertyDescriptor(_target, prop) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.getOwnPropertyDescriptor(self.instance, prop);
      },
      has(_target, prop) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.has(self.instance, prop);
      },
      ownKeys(_target) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        return Reflect.ownKeys(self.instance);
      },
      isExtensible(target) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        if (!Reflect.isExtensible(self.instance)) {
          Reflect.preventExtensions(target);
        }
        return Reflect.isExtensible(target);
      },
      preventExtensions(target) {
        if (!self.instance) {
          throw new UninitializedPropertyAccessError();
        }
        Reflect.preventExtensions(self.instance);
        return Reflect.preventExtensions(target);
      },
    });
  }
}
