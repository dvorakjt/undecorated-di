import { describe, test, expect } from "vitest";
import { ErrorMessages } from "../error-messages";
import { SingletonPlaceholder } from "../singleton-placeholder";

class MockSingleton {
  someProp? = 'test'
}

describe('SingletonPlaceholder', () => {
  test('It throws an error if a property of proxy is accessed while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => singletonPlaceholder.proxy.someProp).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It returns a property of its instance if accessed while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    expect(singletonPlaceholder.proxy.someProp).toBe('test');
  });


  test('It throws an error if a property of proxy is set while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => singletonPlaceholder.proxy.someProp = 'new value').toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It sets a property of instance when the corresponding property on its proxy is set while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    singletonPlaceholder.proxy.someProp = 'new value';
    expect(singletonPlaceholder.proxy.someProp).toBe('new value');
  });


  test('It throws an error if getPrototypeOf is called on proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => Object.getPrototypeOf(singletonPlaceholder.proxy)).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It returns the prototype of instance if getPrototypeOf is called on proxy while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    expect(Object.getPrototypeOf(singletonPlaceholder.proxy)).toBe(Object.getPrototypeOf(singletonPlaceholder.instance));
  });


  test('It throws an error if defineProperty is called on proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => Object.defineProperty(singletonPlaceholder.proxy, 'newProp', {
      value : "new value"
    })).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It defines a property on instance when defineProperty is called on proxy while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    Object.defineProperty(singletonPlaceholder.proxy, 'newProp', {
      value : "new value"
    });
    expect((singletonPlaceholder.instance as any).newProp).toBe('new value');
  });

  test('It throws an error if deleteProperty is called on proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => delete singletonPlaceholder.proxy.someProp).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It deletes a property on instance when deleteProperty is called on proxy while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    delete singletonPlaceholder.proxy.someProp;
    expect((singletonPlaceholder.instance as any).someProp).toBe(undefined);
  });

  test('It throws an error if getOwnPropertyDescriptor is called on proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => Object.getOwnPropertyDescriptor(singletonPlaceholder.proxy, 'someProp')).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It returns the descriptor of a property on instance when getOwnPropertyDescriptor is called on proxy and instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    expect(Object.getOwnPropertyDescriptor(singletonPlaceholder.proxy, 'someProp'))
      .toStrictEqual(Object.getOwnPropertyDescriptor(singletonPlaceholder.instance, 'someProp'));
  });

  test('It throws an error if has() is called on proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => 'someProp' in singletonPlaceholder.proxy).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It returns instance.has() when has() is called on proxy while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    expect('someProp' in singletonPlaceholder.proxy).toBe('someProp' in singletonPlaceholder.instance);
  });

  test('It throws an error if isExtensible() is called on proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => Object.isExtensible(singletonPlaceholder.proxy)).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It returns instance.isExtensible() when isExtensible() is called on proxy while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    Object.preventExtensions(singletonPlaceholder.instance);
    expect(Object.isExtensible(singletonPlaceholder.proxy)).toBe(Object.isExtensible(singletonPlaceholder.instance));
  });

  test('It throws an error if preventExtensions() is called on the proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => Object.preventExtensions(singletonPlaceholder.proxy)).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It prevents extensions on the instance if Object.preventExtensions is called on the proxy while instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    Object.preventExtensions(singletonPlaceholder.proxy);
    expect(Object.isExtensible(singletonPlaceholder.instance)).toBe(false);
  });

  test('It throws an error if setPrototypeOf() is called on the proxy while instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    class PrototypicalClass {
      prototypicalProp = 'I greet thee, earthly sphere'
    }
    expect(() => Object.setPrototypeOf(singletonPlaceholder.proxy, PrototypicalClass.prototype)).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It sets the prototype of instance when setPrototypeOf() is called on the proxy and instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    class PrototypicalClass {
      prototypicalProp = 'I greet thee, earthly sphere'
    }
    Object.setPrototypeOf(singletonPlaceholder.proxy, PrototypicalClass.prototype);
    expect(Object.getPrototypeOf(singletonPlaceholder.instance)).toStrictEqual(PrototypicalClass.prototype);
  });

  test('It throws an error when ownKeys() is called and instance is undefined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    expect(() => Object.keys(singletonPlaceholder.proxy)).toThrowError(ErrorMessages.UNINITIALIZED_PROPERTY_ACCESS_ERROR);
  });

  test('It returns the keys of instance when Object.keys is called on proxy and instance is defined.', () => {
    const singletonPlaceholder = new SingletonPlaceholder<MockSingleton>();
    singletonPlaceholder.instance = new MockSingleton();
    expect(Object.keys(singletonPlaceholder.proxy)).toStrictEqual(Object.keys(singletonPlaceholder.instance));
  });
});