# undecorated-di

## Functions

### autowire

▸ **autowire**<`K`, `Interface`, `Implementation`\>(`service`, `identifier`, `dependencies?`): { [Key in string]: Service<Interface, Implementation\> }

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `K` | extends `string` | a unique key used to retrieve the autowired class. This should be the type of a string literal. |
| `Interface` | `Interface` | the interface / abstract class / class that you would like the returned instance to be typed as. |
| `Implementation` | `Implementation` | the type of the concrete class of the service. Must extend Interface. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `service` | `Constructor`<`Implementation`\> | The concrete class implmenting the generic type parameter Interface. |
| `identifier` | `K` | A string literal used to uniquely identify the class. Must be of type K. |
| `dependencies?` | `string`[] | An array of string literals used to retrieve the dependencies of the class when the container instantiates it. |

#### Returns

{ [Key in string]: Service<Interface, Implementation\> }

#### Example

```ts
  interface Flyable {
    fly() : void;
  }
  const FlyableKey = 'Flyable';
  type FlyableKeyType = typeof FlyableKey;

  class Bird implements Flyable {
    fly() {
      console.log('The bird flaps its wings and soars into the air.');
    }
  }
  

  const FlyableService = autowire<FlyableKeyType, Flyable, Bird>(Bird, FlyableKey); 

  //If registered to a container, will be retrieved as type Flyable
  export default FlyableService;
```

#### Defined in

[autowire.ts:33](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/autowire.ts#L33)

## Classes

### Class: ContainerBuilder<ServicesDictionaryType, SingletonInstancesDictionaryType\>

Used to build a dependency injection container. In service class files, call autowire() on the class, and export the returned value as default. 
Import these exports into the file in which a container is to be declared, and then use a ContainerBuilder to construct a container.

## Type parameters

| Name |
| :------ |
| `ServicesDictionaryType` |
| `SingletonInstancesDictionaryType` |

## Constructors

### constructor

• `Private` **new ContainerBuilder**<`ServicesDictionaryType`, `SingletonInstancesDictionaryType`\>(`transientServiceDictionary`, `singletonInstancesDictionary`)

#### Type parameters

| Name |
| :------ |
| `ServicesDictionaryType` |
| `SingletonInstancesDictionaryType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `transientServiceDictionary` | `ServicesDictionaryType` |
| `singletonInstancesDictionary` | `SingletonInstancesDictionaryType` |

#### Defined in

[container-builder.ts:24](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L24)

## Properties

### servicesDictionary

• **servicesDictionary**: `ServicesDictionaryType`

#### Defined in

[container-builder.ts:21](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L21)

___

### singletonInstancesDictionary

• **singletonInstancesDictionary**: `SingletonInstancesDictionaryType`

#### Defined in

[container-builder.ts:22](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L22)

## Methods

### build

▸ **build**(): `Container`<`ServicesDictionaryType`, `SingletonInstancesDictionaryType`\>

Once all of the necessary services have been registered, call this method to build a Container.

#### Returns

`Container`<`ServicesDictionaryType`, `SingletonInstancesDictionaryType`\>

Container

#### Defined in

[container-builder.ts:78](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L78)

___

### createSingletonInstancesDictionary

▸ `Private` **createSingletonInstancesDictionary**<`AdditionalServiceDictionary`\>(`additionalServiceDictionary`): { [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }

#### Type parameters

| Name |
| :------ |
| `AdditionalServiceDictionary` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `additionalServiceDictionary` | `AdditionalServiceDictionary` |

#### Returns

{ [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }

#### Defined in

[container-builder.ts:85](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L85)

___

### registerSingletonService

▸ **registerSingletonService**<`AdditionalServiceDictionary`\>(`additionalServiceDictionary`): [`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType` & `object` & { [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }\>

Registers a service in singleton scope (the same instance will be returned each time it is accessed from the container), and returns a new ContainerBuilder.

#### Type parameters

| Name |
| :------ |
| `AdditionalServiceDictionary` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `additionalServiceDictionary` | `AdditionalServiceDictionary` | Pass in value returned by autowire. |

#### Returns

[`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType` & `object` & { [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }\>

ContainerBuilder

#### Defined in

[container-builder.ts:55](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L55)

___

### registerTransientService

▸ **registerTransientService**<`AdditionalServiceDictionary`\>(`additionalServiceDictionary`): [`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType`\>

Registers a service in transient scope (a new instance will be returned each time it is accessed from the container), and returns a new ContainerBuilder.

#### Type parameters

| Name |
| :------ |
| `AdditionalServiceDictionary` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `additionalServiceDictionary` | `AdditionalServiceDictionary` | Pass in value returned by autowire. |

#### Returns

[`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType`\>

ContainerBuilder

#### Defined in

[container-builder.ts:37](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L37)

___

### createContainerBuilder

▸ `Static` **createContainerBuilder**(): [`ContainerBuilder`](ContainerBuilder.md)<{}, {}\>

returns a new ContainerBuilder with empty servicesDictionary and singletonInstancesDictionary. Use this to get a new ContainerBuilder.

#### Returns

[`ContainerBuilder`](ContainerBuilder.md)<{}, {}\>

ContainerBuilder<{}, {}>;

#### Example

```ts
  interface Flyable {
    fly() : void;
  }
  const FlyableKey = 'Flyable';
  type FlyableKeyType = typeof FlyableKey;

  class Bird implements Flyable {
    fly() {
      console.log('The bird flaps its wings and soars into the air.');
    }
  }
  

  const FlyableService = autowire<FlyableKeyType, Flyable, Bird>(Bird, FlyableKey); 

  const container = ContainerBuilder
    .createContainerBuilder()
    .registerTransientService(FlyableService)
    .build();
    
  const flyable = container.services.Flyable; //will be instance of Flyable
```

#### Defined in

[container-builder.ts:17](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L17)
