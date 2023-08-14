# undecorated-di

Type-safe, straightforward dependency injection for object-oriented programming using E6 classes and TypeScript interfaces/abstract classes/types--without annotations or reflect metadata.

![Statements](#statements#) ![Branches](#branches#) ![Functions](#functions#) ![Lines](#lines#)

## Installation

```
npm i -D undecorated-di
```

## Use

Define interfaces for your services.

```
//flyable.interface.ts

export interface Flyable {
  fly() : void;
}

export const FlyableKey = 'Flyable';

export type FlyableKeyType = typeof FlyableKey;

```

```
//logger.interface.ts

export interface Logger {
  log(message : any) : void;
}

export const LoggerKey = 'Logger';

export type LoggerKeyType = typeof LoggerKey;

```

Import these interfaces and implement them.

```
//bird.ts

import { autowire } from 'undecorated-di';
import { FlyableKey, type Flyable, type FlyableKeyType } from './flyable.interface';
import { LoggerKey, type Logger } from './logger.interface';

class Bird implements Flyable {
  constructor(private logger : Logger) {}

  fly() {
    this.logger.log('The bird flaps its wings and soars into the air.');
  }
}

export default autowire<FlyableKeyType, Flyable, Bird>(Bird, FlyableKey, [LoggerKey]);

```

Autowire is a generic function. The first generic type parameter is the type of the key you wish to associate the service class to. Here we are using 
the string literal 'Flyable' exported as FlyableKeyType from flyable.interface.ts. The second generic type parameter is the interface you wish the class
to be exposed as when it is retrieved from the container. This can be anything as long as the implementing class extends it. The third generic type parameter 
is the type of the class that you are registering as a service, or in other words, the class that implements the interface. 

The function takes 2-3 parameters. The first parameter is the class you wish to autowire. The second is the actual key you wish to register the class to. This should
be the same type as the first generic type parameter. The third parameter, which is optional, is a dependency array. Here, specify the keys of your dependencies.
Order matters here! You must specify them in the order that the constructor of the autowired class expects to receive them.

```
//plane.ts

import { autowire } from 'undecorated-di';
import { FlyableKey, type Flyable, type FlyableKeyType } from './flyable.interface';
import { LoggerKey, type Logger } from './logger.interface';

class Plane implements Flyable {
  constructor(private logger : Logger) {}

  fly() {
    this.logger.log('The pilot starts the engine, the propeller begins to spin, and the plane takes off.');
  }
}

export default autowire<FlyableKeyType, Flyable, Plane>(Plane, FlyableKey, [LoggerKey]);

```
```
//console-logger.ts

import { autowire } from 'undecorated-di';
import { LoggerKey, type Logger, type LoggerKeyType } from './logger.interface';

class ConsoleLogger implements Logger {
  log(message : any) {
    console.log(message);
  }
}

export default autowire<LoggerKeyType, Logger, ConsoleLogger>(ConsoleLogger, LoggerKey);

```

Register these classes to containers

```
//container-a.ts

import { ContainerBuilder } from 'undecorated-di';
import BirdService from './bird';
import ConsoleLoggerService from './console-logger';

const containerA = ContainerBuilder
  .createContainerBuilder()
  .registerTransientService(BirdService) //order does not matter, even if there are dependencies
  .registerTransientService(ConsoleLoggerService)
  .build();

export { containerA }; 

```
Another container. You can create as many as you need. Likely you will need one for src and one for testing.

```
//container-b.ts

import { ContainerBuilder } from 'undecorated-di';
import PlaneService from './plane';
import ConsoleLoggerService from './console-logger';

/* 
  Here, we register services as singletons. Only one instance of a singleton service is created per 
  container, even if it was first accessed indirectly by a dependent class.
*/

const containerB = ContainerBuilder
  .createContainerBuilder()
  .registerSingletonService(PlaneService) 
  .registerSingletonService(ConsoleLoggerService)
  .build();

export { containerB };

```
Import these containers and you will have access to the services you have registered. 

```
//some file, e.g. index.ts

import { containerA } from './container-a';

const iFly = containerA.services.Flyable; // returns a new instance of the class registered as Flyable

//iFly will be of type Flyable, but will call the concrete methods of its implementing class

iFly.fly(); //logs 'The bird flaps its wings and soars into the air.'

```
```
//another file, perhaps a test
import { containerB } from './container-b';

const iFly = containerB.services.Flyable; //in containerB, Plane was registered to Flyable
iFly.fly(); //logs 'The pilot starts the engine, the propeller begins to spin, and the plane takes off.'


```

Dependencies are resolved when an instance is retrieved from the services property. If a dependency is missing, an error will be thrown. Likewise, if a circular dependency exists (class A requires an instance of class C, class B requires an instance of class A, class C requires an instance of class B), an error will be thrown.

## tsconfig

Several classes in the project have private members. Therefore, you must set the target option in your tsconfig to "ES2015" or higher.

```
//tsconfig.json
{
  "compilerOptions": {
    "target": "ES2015",
  }
}
```

## Example

You can view a simple example project [here](https://github.com/dvorakjt/undecorated-di-sample).

## API

### Functions

#### autowire

▸ **autowire**<`K`, `Interface`, `Implementation`\>(`service`, `identifier`, `dependencies?`): { [Key in string]: Service<Interface, Implementation\> }

##### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `K` | extends `string` | a unique key used to retrieve the autowired class. This should be the type of a string literal. |
| `Interface` | `Interface` | the interface / abstract class / class that you would like the returned instance to be typed as. |
| `Implementation` | `Implementation` | the type of the concrete class of the service. Must extend Interface. |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `service` | `Constructor`<`Implementation`\> | The concrete class implementing the generic type parameter Interface. |
| `identifier` | `K` | A string literal used to uniquely identify the class. Must be of type K. |
| `dependencies?` | `string`[] | An array of string literals used to retrieve the dependencies of the class when the container instantiates it. |

##### Returns

{ [Key in string]: Service<Interface, Implementation\> }

##### Example

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

##### Defined in

[autowire.ts:33](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/autowire.ts#L33)

### Classes

#### Class: ContainerBuilder<ServicesDictionaryType, SingletonInstancesDictionaryType\>

Used to build a dependency injection container. In service class files, call autowire() on the class, and export the returned value as default. 
Import these exports into the file in which a container is to be declared, and then use a ContainerBuilder to construct a container.

### Type parameters

| Name |
| :------ |
| `ServicesDictionaryType` |
| `SingletonInstancesDictionaryType` |

### Constructors

#### constructor

• `Private` **new ContainerBuilder**<`ServicesDictionaryType`, `SingletonInstancesDictionaryType`\>(`transientServiceDictionary`, `singletonInstancesDictionary`)

##### Type parameters

| Name |
| :------ |
| `ServicesDictionaryType` |
| `SingletonInstancesDictionaryType` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `transientServiceDictionary` | `ServicesDictionaryType` |
| `singletonInstancesDictionary` | `SingletonInstancesDictionaryType` |

##### Defined in

[container-builder.ts:24](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L24)

### Properties

#### servicesDictionary

• **servicesDictionary**: `ServicesDictionaryType`

##### Defined in

[container-builder.ts:21](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L21)

___

#### singletonInstancesDictionary

• **singletonInstancesDictionary**: `SingletonInstancesDictionaryType`

#### Defined in

[container-builder.ts:22](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L22)

### Methods

#### build

▸ **build**(): `Container`<`ServicesDictionaryType`, `SingletonInstancesDictionaryType`\>

Once all of the necessary services have been registered, call this method to build a Container.

##### Returns

`Container`<`ServicesDictionaryType`, `SingletonInstancesDictionaryType`\>

Container

##### Defined in

[container-builder.ts:78](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L78)

___

#### createSingletonInstancesDictionary

▸ `Private` **createSingletonInstancesDictionary**<`AdditionalServiceDictionary`\>(`additionalServiceDictionary`): { [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }

##### Type parameters

| Name |
| :------ |
| `AdditionalServiceDictionary` |

##### Parameters

| Name | Type |
| :------ | :------ |
| `additionalServiceDictionary` | `AdditionalServiceDictionary` |

##### Returns

{ [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }

##### Defined in

[container-builder.ts:85](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L85)

___

#### registerSingletonService

▸ **registerSingletonService**<`AdditionalServiceDictionary`\>(`additionalServiceDictionary`): [`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType` & `object` & { [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }\>

Registers a service in singleton scope (the same instance will be returned each time it is accessed from the container), and returns a new ContainerBuilder.

##### Type parameters

| Name |
| :------ |
| `AdditionalServiceDictionary` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `additionalServiceDictionary` | `AdditionalServiceDictionary` | Pass in value returned by autowire. |

##### Returns

[`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType` & `object` & { [K in string \| number \| symbol]: AdditionalServiceDictionary[K] extends IService ? undefined \| ReturnType<any[any]["getInstance"]\> : never }\>

ContainerBuilder

##### Defined in

[container-builder.ts:55](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L55)

___

#### registerTransientService

▸ **registerTransientService**<`AdditionalServiceDictionary`\>(`additionalServiceDictionary`): [`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType`\>

Registers a service in transient scope (a new instance will be returned each time it is accessed from the container), and returns a new ContainerBuilder.

##### Type parameters

| Name |
| :------ |
| `AdditionalServiceDictionary` |

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `additionalServiceDictionary` | `AdditionalServiceDictionary` | Pass in value returned by autowire. |

##### Returns

[`ContainerBuilder`](ContainerBuilder.md)<`ServicesDictionaryType` & `object` & `AdditionalServiceDictionary` \| `ServicesDictionaryType` & ``null`` & `AdditionalServiceDictionary`, `SingletonInstancesDictionaryType`\>

ContainerBuilder

##### Defined in

[container-builder.ts:37](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L37)

___

#### createContainerBuilder

▸ `Static` **createContainerBuilder**(): [`ContainerBuilder`](ContainerBuilder.md)<{}, {}\>

returns a new ContainerBuilder with empty servicesDictionary and singletonInstancesDictionary. Use this to get a new ContainerBuilder.

##### Returns

[`ContainerBuilder`](ContainerBuilder.md)<{}, {}\>

ContainerBuilder<{}, {}>;

##### Example

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

##### Defined in

[container-builder.ts:17](https://github.com/dvorakjt/undecorated-di/blob/69b140c/src/container-builder.ts#L17)
